import { motion } from 'framer-motion';
import styles from './GlowButton.module.css';

export default function GlowButton({
  children,
  onClick,
  variant = 'gold',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
}) {
  return (
    <motion.button
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </motion.button>
  );
}
