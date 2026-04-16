import { supabase } from './supabaseClient';

/**
 * Aplica un código de referido usando la función segura (RPC) en Supabase.
 * - La función en DB (SECURITY DEFINER) se encarga de saltar el RLS y premiar a ambos usuarios.
 *
 * @param {string} code - Código ingresado
 * @param {string} currentUserId - ID del usuario actual
 */
export async function applyReferralCode(code, currentUserId) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) throw new Error('Ingresa un código válido.');

  const { data, error } = await supabase.rpc('apply_referral_code', {
    entered_code: normalizedCode,
    current_user_id: currentUserId,
  });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('ALREADY_USED')) throw new Error('ALREADY_USED');
    if (msg.includes('OWN_CODE')) throw new Error('OWN_CODE');
    if (msg.includes('NOT_FOUND')) throw new Error('NOT_FOUND');
    
    console.error('[referral] Error RPC:', error);
    throw new Error('UPDATE_ERROR');
  }

  // `data` contiene { success: true, rewardGiven: 100, referrerName: "..." } devuelto desde postgres
  return data;
}
