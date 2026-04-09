import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Moon, Sun, Bank, Question } from '@phosphor-icons/react';
import { USER_PROFILE } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContextBase';
import { useAuth } from '../../context/AuthContextBase';
import { useTour } from '../../context/TourContextBase';
import { useTier } from '../../hooks/useTier';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { startTour } = useTour();
  const tier = useTier();
  const navigate = useNavigate();
  const location = useLocation();

  const handleHelpClick = () => {
    // Determine flow based on route
    const flow = location.pathname === '/season' ? 'season' : 'global';
    startTour(true, flow);
  };

  return (
    <header className={styles.header}>
      <motion.div
        className={styles.left}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/profile')}
        whileHover={{ scale: 1.02 }}
      >
        <div className={styles.avatar}>
          <span>{USER_PROFILE.avatar}</span>
        </div>
        <motion.div
          className={styles.greeting}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className={styles.hello}>Hola, {user?.name || USER_PROFILE.name}</span>
          <span className={styles.tier}>{tier}</span>
        </motion.div>
      </motion.div>
      <div className={styles.right}>
        <div className={styles.brand}>
          <Bank size={20} weight="fill" className={styles.brandIcon} />
          <span className={styles.brandText}>AIBank</span>
        </div>
        <div className={styles.divider} />
        <motion.button
          className={styles.iconBtn}
          onClick={handleHelpClick}
          aria-label="Ver tour guiado"
          whileTap={{ scale: 0.9 }}
          title="Ver tour"
        >
          <Question size={20} weight="bold" />
        </motion.button>
        <motion.button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'dark' ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
        </motion.button>
      </div>
    </header>
  );
}
