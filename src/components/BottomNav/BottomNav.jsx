import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  House,
  SoccerBall,
  Gift,
  UserCircle,
} from '@phosphor-icons/react';
import useGameSounds from '../../hooks/useGameSounds';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { to: '/', icon: House, label: 'Banco' },
  { to: '/season', icon: SoccerBall, label: 'Mundial', center: true },
  { to: '/rewards', icon: Gift, label: 'Beneficios' }
];

export default function BottomNav() {
  const location = useLocation();
  const { playNav, playClick } = useGameSounds();

  const handleNavClick = (to) => {
    if (location.pathname !== to) {
      playNav();
    } else {
      playClick();
    }
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.bg} />
      {NAV_ITEMS.map((item, index) => {
        const { to, icon: Icon, label, center } = item;
        const isActive = location.pathname === to;
        return (
          <NavLink key={to} to={to} className={`${styles.item} ${center ? styles.centerItem : ''}`} onClick={() => handleNavClick(to)}>
            {center ? (
              <motion.div
                className={`${styles.centerBtn} ${isActive ? styles.centerActive : ''}`}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon size={34} weight="fill" />
              </motion.div>
            ) : (
              <>
                <div className={styles.iconWrap}>
                  {isActive && (
                    <motion.div
                      className={styles.activeBg}
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={23}
                    weight={isActive ? 'fill' : 'regular'}
                    className={`${styles.icon} ${isActive ? styles.activeIcon : ''}`}
                  />
                </div>
                <span className={`${styles.label} ${isActive ? styles.activeLabel : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
