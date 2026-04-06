import { motion } from 'framer-motion';
import styles from './CasinoCard.module.css';

export default function CasinoCard({
  children,
  className = '',
  glow = false,
  onClick,
  delay = 0,
}) {
  return (
    <motion.div
      className={`${styles.card} ${glow ? styles.glow : ''} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className={styles.inner}>{children}</div>
    </motion.div>
  );
}
