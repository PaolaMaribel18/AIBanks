import { motion } from 'framer-motion';
import { Bell } from '@phosphor-icons/react';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <motion.div
          className={styles.logo}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        >
          ⚽
        </motion.div>
        <div className={styles.brand}>
          <h1 className={styles.title}>AI Banks</h1>
          <span className={styles.subtitle}>Ecuador 🇪🇨</span>
        </div>
      </div>
      <div className={styles.right}>
        <motion.div
          className={styles.points}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={styles.coin}>🪙</span>
          <span className={styles.pointsValue}>4,250</span>
        </motion.div>
        <button className={styles.notifBtn}>
          <Bell size={22} weight="bold" />
          <span className={styles.notifDot} />
        </button>
      </div>
    </header>
  );
}
