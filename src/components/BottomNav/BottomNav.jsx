import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  House,
  Trophy,
  Target,
  Gift,
  UserCircle,
} from '@phosphor-icons/react';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { to: '/', icon: House, label: 'Inicio' },
  { to: '/predictions', icon: Target, label: 'Predecir' },
  { to: '/rewards', icon: Gift, label: 'Premios' },
  { to: '/leaderboard', icon: Trophy, label: 'Ranking' },
  { to: '/profile', icon: UserCircle, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      <div className={styles.bg} />
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
          <NavLink key={to} to={to} className={styles.item}>
            <div className={styles.iconWrap}>
              {isActive && (
                <motion.div
                  className={styles.activeBg}
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={24}
                weight={isActive ? 'fill' : 'regular'}
                className={`${styles.icon} ${isActive ? styles.activeIcon : ''}`}
              />
            </div>
            <span className={`${styles.label} ${isActive ? styles.activeLabel : ''}`}>
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
