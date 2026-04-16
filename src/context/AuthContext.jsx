import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

import { AuthContext } from './AuthContextBase';

const translateAuthError = (errorCode, errorDescription) => {
  const decodedDescription = errorDescription
    ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
    : '';

  if (errorCode === 'otp_expired' || /invalid or has expired/i.test(decodedDescription)) {
    return 'El enlace del correo es inválido o ya expiró. Solicita uno nuevo para continuar.';
  }

  if (errorCode === 'access_denied') {
    return 'No se pudo completar la validación del correo. Intenta nuevamente.';
  }

  return decodedDescription || 'Ocurrió un problema al autenticar tu cuenta.';
};

const syncUserFromSession = (session, setUser, setHasCompletedOnboarding) => {
  if (session?.user) {
    const baseUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name || session.user.email.split('@')[0],
    };
    setUser(baseUser);
    if (localStorage.getItem('hasCompletedOnboarding') === 'true') {
       setHasCompletedOnboarding(true);
    }
    return baseUser;
  }

  setUser(null);
  setHasCompletedOnboarding(false);
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem('hasCompletedOnboarding') === 'true'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hydrateUserProfile = useCallback(async (baseUserOrId) => {
    const userId = typeof baseUserOrId === 'string' ? baseUserOrId : baseUserOrId?.id;
    if (!userId) return;
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, points, tier, archetype, balance, referral_code, referred_by, referral_used_at')
        .eq('id', userId)
        .single();

      if (profileError || !data) return;

      setUser((prev) => {
        const baseUser =
          typeof baseUserOrId === 'object' && baseUserOrId
            ? baseUserOrId
            : prev && prev.id === userId
              ? prev
              : { id: userId };

        // No pisar si ya cambió a otro usuario
        if (prev && prev.id && prev.id !== userId) return prev;

        return { ...baseUser, ...data };
      });
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const errorCode = hashParams.get('error_code') || queryParams.get('error_code');
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

    if (errorCode || errorDescription) {
      setError(translateAuthError(errorCode, errorDescription));
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const baseUser = syncUserFromSession(session, setUser, setHasCompletedOnboarding);
        if (baseUser?.id) {
          await hydrateUserProfile(baseUser);
        }
      } catch (err) {
        setUser(null);
        setHasCompletedOnboarding(false);
        setError((currentError) => currentError || translateAuthError(err.code, err.message));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const baseUser = syncUserFromSession(session, setUser, setHasCompletedOnboarding);
      if (baseUser?.id) {
        hydrateUserProfile(baseUser);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return null;
    await hydrateUserProfile(user.id);
    return true;
  }, [user?.id, hydrateUserProfile]);

  // Escuchar cambios en tiempo real (Realtime) para la tabla profiles
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setUser((prev) => {
              if (!prev || prev.id !== payload.new.id) return prev;
              return { ...prev, ...payload.new }; // Actualiza los puntos y otros datos instantáneamente
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const register = async (email, password, name) => {
    try {
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { name },
        },
      });

      if (signUpError) throw signUpError;

      // Solo insertar perfil si hay sesión activa
      if (data.user && data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              points: 0,
              tier: 'Bronze',
            },
          ]);

        if (profileError) throw profileError;
      }

      return {
        success: true,
        data,
        requiresEmailConfirmation: !data.session,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Safety: crear perfil si no existe (cubre usuarios que confirmaron
      // email antes del fix en AuthCallback)
      if (data.user) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              name: data.user.user_metadata?.name || email.split('@')[0],
              email,
              points: 0,
              tier: 'Bronze',
            },
            { onConflict: 'id', ignoreDuplicates: true }
          );
      }

      if (localStorage.getItem('hasCompletedOnboarding') === 'true') {
        setHasCompletedOnboarding(true);
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const completeOnboarding = async (archetype) => {
    try {
      setError(null);
      
      // 1. Guardar primero de forma INMEDIATA en el FrontEnd (Independiente de backend)
      setHasCompletedOnboarding(true);
      localStorage.setItem('hasCompletedOnboarding', 'true');
      localStorage.setItem('archetype', archetype);

      // 2. Intentar respaldarlo en base de datos de manera silenciosa si hay usuario
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ archetype })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error("Error silencioso guardando en Supabase:", err);
      // No frenamos a la aplicación si falla la DB, el LocalStorage ya tiene la respuesta.
    }
  };

  const value = {
    user,
    hasCompletedOnboarding,
    loading,
    error,
    register,
    login,
    logout,
    completeOnboarding,
    clearError,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}