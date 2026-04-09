import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import FireworksBackground from '../../components/FireworksBackground/FireworksBackground';
import useGameSounds from '../../hooks/useGameSounds';
import styles from './AuthCallback.module.css';

/**
 * Asegura que el perfil del usuario exista en la tabla profiles.
 * Usa upsert para evitar duplicados si ya existe.
 */
async function ensureProfile(session) {
  if (!session?.user) return;
  const { user } = session;
  
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          name: user.user_metadata?.name || user.email.split('@')[0],
          email: user.email,
          points: 0,
          tier: 'Bronze',
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    if (error) {
      console.error('Error creando perfil:', error);
    }
  } catch (err) {
    console.error('Error en ensureProfile:', err);
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing | verified | error
  const [errorMsg, setErrorMsg] = useState('');
  const { playLoginLong, playFirework, playError } = useGameSounds();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error params in hash or query string
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const queryParams = new URLSearchParams(window.location.search);

        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');
        const errorDescription =
          hashParams.get('error_description') || queryParams.get('error_description');

        if (errorCode || errorDescription) {
          const decoded = errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : 'Ocurrió un error al verificar tu cuenta.';
          setStatus('error');
          setErrorMsg(decoded);
          playError();
          return;
        }

        // Let Supabase pick up the tokens from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setErrorMsg(error.message);
          return;
        }

        if (data.session) {
          // Successfully authenticated — create profile & celebrate
          await ensureProfile(data.session);
          setStatus('verified');
          playLoginLong();
          setTimeout(() => playFirework(), 300);
          setTimeout(() => playFirework(), 800);
          setTimeout(() => playFirework(), 1400);
          setTimeout(() => navigate('/', { replace: true }), 3500);
        } else {
          // No session yet, wait for the auth state change
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
              subscription.unsubscribe();
              await ensureProfile(session);
              setStatus('verified');
              playLoginLong();
              setTimeout(() => playFirework(), 300);
              setTimeout(() => playFirework(), 800);
              setTimeout(() => navigate('/', { replace: true }), 3500);
            }
          });

          // Timeout fallback: if no session after 5s, show error
          setTimeout(() => {
            subscription.unsubscribe();
            setStatus('error');
            setErrorMsg(
              'No se pudo completar la verificación. El enlace puede haber expirado.'
            );
          }, 5000);
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.message || 'Error inesperado al procesar la verificación.');
      }
    };

    handleCallback();
  }, [navigate]);

  if (status === 'verified') {
    return (
      <div className={styles.container}>
        <FireworksBackground
          population={3}
          duration={4000}
          colors={['#ffd700', '#ffaa00', '#00e676', '#00b0ff', '#d500f9', '#ff6b35']}
        />
        <div className={styles.card} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.iconSuccess}>✓</div>
          <h2>¡Cuenta verificada!</h2>
          <p>Bienvenido a AI Bank 🎉</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconError}>✕</div>
          <h2>Error de verificación</h2>
          <p>{errorMsg}</p>
          <button className={styles.btn} onClick={() => navigate('/login', { replace: true })}>
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <h2>Verificando tu cuenta…</h2>
        <p>Esto solo toma un momento.</p>
      </div>
    </div>
  );
}

