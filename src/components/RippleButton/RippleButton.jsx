import { motion } from 'framer-motion';
import styles from './RippleButton.module.css';
import { useState, useCallback } from 'react';
import useGameSounds from '../../hooks/useGameSounds';

// Ripple Button inspired by animate-ui/buttons/ripple
// Material Design-style ripple effect on click

export default function RippleButton({
  children,
  onClick,
  className = '',
  variant = 'gold',
  size = 'md',
  disabled = false,
  icon,
  fullWidth = false,
}) {
  const [ripples, setRipples] = useState([]);
  const { playClick } = useGameSounds();

  const handleClick = useCallback((e) => {
    playClick();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 800);

    onClick?.(e);
  }, [onClick, playClick]);

  return (
    <motion.button
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.full : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.content}>{children}</span>
    </motion.button>
  );
}
