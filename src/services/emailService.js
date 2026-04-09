import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_SENDER = import.meta.env.VITE_EMAILJS_TEMPLATE_SENDER;
const TEMPLATE_RECIPIENT = import.meta.env.VITE_EMAILJS_TEMPLATE_RECIPIENT;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Envía email al REMITENTE notificándole que ganó mAIles por su transferencia.
 */
export async function sendSenderEmail({ senderName, senderEmail, recipientName, amount, earnedMAIles }) {
  if (!SERVICE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS no configurado. Saltando envío de email al remitente.');
    return;
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_SENDER,
      {
        to_name: senderName,
        to_email: senderEmail,
        recipient_name: recipientName,
        amount: Number(amount).toFixed(2),
        earned_mailes: earnedMAIles,
      },
      PUBLIC_KEY
    );
  } catch (err) {
    console.error('Error enviando email al remitente:', err);
  }
}

/**
 * Envía email al DESTINATARIO notificándole que recibió una transferencia.
 */
export async function sendRecipientEmail({ recipientName, recipientEmail, senderName, amount }) {
  if (!SERVICE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS no configurado. Saltando envío de email al destinatario.');
    return;
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_RECIPIENT,
      {
        to_name: recipientName,
        to_email: recipientEmail,
        sender_name: senderName,
        amount: Number(amount).toFixed(2),
      },
      PUBLIC_KEY
    );
  } catch (err) {
    console.error('Error enviando email al destinatario:', err);
  }
}
