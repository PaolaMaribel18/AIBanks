import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyDollar, X } from '@phosphor-icons/react';
import { useNotifications } from '../../context/NotificationContextBase';
import styles from './NotificationToast.module.css';

export default function NotificationToast() {
  const { notifications, dismissNotification } = useNotifications();

  // Auto-dismiss después de 6 segundos
  useEffect(() => {
    if (notifications.length === 0) return;

    const latest = notifications[0];
    const timer = setTimeout(() => {
      dismissNotification(latest.id);
    }, 6000);

    return () => clearTimeout(timer);
  }, [notifications, dismissNotification]);

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {notifications.slice(0, 3).map((notification) => (
          <motion.div
            key={notification.id}
            className={styles.toast}
            initial={{ opacity: 0, y: -60, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            <div className={styles.iconWrap}>
              <CurrencyDollar size={22} weight="bold" />
            </div>
            <div className={styles.content}>
              <span className={styles.title}>Transferencia Recibida</span>
              <span className={styles.message}>
                <strong>{notification.fromName}</strong> te envió{' '}
                <strong>${Number(notification.amount).toFixed(2)}</strong>
              </span>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => dismissNotification(notification.id)}
              aria-label="Cerrar notificación"
            >
              <X size={14} weight="bold" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
