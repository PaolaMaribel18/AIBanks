import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MatchCard.module.css';

export default function MatchCard({ match, delay = 0, onPredict }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (choice) => {
    if (confirmed) return;
    setSelected(choice);
  };

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    onPredict?.(match.id, selected);
  };

  const matchDate = new Date(match.date);
  const dateStr = matchDate.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  const timeStr = matchDate.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      className={`${styles.card} ${match.hot ? styles.hot : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {match.hot && (
        <div className={styles.hotBadge}>
          <span>🔥</span> HOT
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.group}>Grupo {match.group}</span>
        <div className={styles.meta}>
          <span>{dateStr}</span>
          <span className={styles.dot}>•</span>
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Teams */}
      <div className={styles.teams}>
        <div className={styles.team}>
          <span className={styles.flag}>{match.home.flag}</span>
          <span className={styles.teamName}>{match.home.name}</span>
        </div>
        <div className={styles.vs}>VS</div>
        <div className={styles.team}>
          <span className={styles.flag}>{match.away.flag}</span>
          <span className={styles.teamName}>{match.away.name}</span>
        </div>
      </div>

      <div className={styles.stadium}>📍 {match.stadium}</div>

      {/* Odds / Prediction Buttons */}
      <div className={styles.odds}>
        {[
          { key: 'home', label: match.home.code, odd: match.odds.home },
          { key: 'draw', label: 'X', odd: match.odds.draw },
          { key: 'away', label: match.away.code, odd: match.odds.away },
        ].map(({ key, label, odd }) => (
          <motion.button
            key={key}
            className={`${styles.oddBtn} ${selected === key ? styles.oddSelected : ''} ${confirmed && selected === key ? styles.oddConfirmed : ''}`}
            onClick={() => handleSelect(key)}
            whileTap={{ scale: 0.93 }}
            disabled={confirmed}
          >
            <span className={styles.oddLabel}>{label}</span>
            <span className={styles.oddValue}>{odd.toFixed(2)}</span>
          </motion.button>
        ))}
      </div>

      {/* Points & Confirm */}
      <div className={styles.footer}>
        <div className={styles.pointsBadge}>
          🪙 <span>{match.points} pts</span>
        </div>
        <AnimatePresence>
          {selected && !confirmed && (
            <motion.button
              className={styles.confirmBtn}
              onClick={handleConfirm}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
            >
              Confirmar ✓
            </motion.button>
          )}
          {confirmed && (
            <motion.div
              className={styles.confirmedBadge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ✅ Predicción enviada
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
