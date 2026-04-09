import { createContext, useContext } from 'react';

export const NotificationContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
}
