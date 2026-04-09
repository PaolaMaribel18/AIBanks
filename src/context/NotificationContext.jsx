import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextBase';
import { NotificationContext } from './NotificationContextBase';
import {
  subscribeToNotifications,
  sendTransferNotification as sendNotification,
} from '../services/notificationService';

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Suscribirse al canal personal del usuario
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToNotifications(user.id, (payload) => {
      const notification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...payload,
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Enviar notificación de transferencia
  const sendTransferNotification = useCallback(
    async (recipientId, { fromName, amount }) => {
      await sendNotification(recipientId, { fromName, amount });
    },
    []
  );

  // Descartar una notificación
  const dismissNotification = useCallback((notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const value = {
    notifications,
    sendTransferNotification,
    dismissNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
