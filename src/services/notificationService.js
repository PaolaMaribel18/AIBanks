import { supabase } from './supabaseClient';

let activeChannel = null;

/**
 * Suscribe al usuario a su canal personal de notificaciones.
 * Solo recibirá eventos enviados específicamente a su canal.
 * 
 * @param {string} userId - ID del usuario actual
 * @param {function} onNotification - Callback al recibir una notificación
 * @returns {function} Función para desuscribirse
 */
export function subscribeToNotifications(userId, onNotification) {
  // Limpiar canal previo si existe
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }

  const channelName = `notifications:${userId}`;

  activeChannel = supabase
    .channel(channelName)
    .on('broadcast', { event: 'new_transfer' }, ({ payload }) => {
      onNotification(payload);
    })
    .subscribe();

  return () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel);
      activeChannel = null;
    }
  };
}

/**
 * Envía una notificación de transferencia al canal del destinatario.
 * El destinatario debe estar suscrito a su canal para recibirla.
 * 
 * @param {string} recipientId - ID del usuario destinatario
 * @param {object} payload - Datos de la transferencia
 * @param {string} payload.fromName - Nombre del remitente
 * @param {number} payload.amount - Monto transferido
 */
export async function sendTransferNotification(recipientId, { fromName, amount }) {
  const channelName = `notifications:${recipientId}`;

  // Crear canal temporal para enviar el broadcast
  const tempChannel = supabase.channel(channelName);

  // Esperar a que el canal esté suscrito antes de enviar
  await new Promise((resolve) => {
    tempChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        resolve();
      }
    });
  });

  await tempChannel.send({
    type: 'broadcast',
    event: 'new_transfer',
    payload: {
      fromName,
      amount,
      timestamp: Date.now(),
    },
  });

  // Limpiar canal temporal después de un breve delay
  setTimeout(() => {
    supabase.removeChannel(tempChannel);
  }, 500);
}
