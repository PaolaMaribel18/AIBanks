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
      className={`${styles.card} ${match.hot ? styles.hot : ''} ${confirmed ? styles.confirmed : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={{ scale: 0.995 }}
    >
      {/* Decorative corner glows for hot matches */}
      {match.hot && (
        <>
          <div className={styles.cornerGlow} />
          <div className={styles.cornerGlowBR} />
        </>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.group}>Grupo {match.group}</span>
          {match.hot && (
            <motion.span
              className={styles.hotBadge}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🔥 HOT
            </motion.span>
          )}
        </div>
        <div className={styles.meta}>
          <span>{dateStr}</span>
          <span className={styles.dot}>•</span>
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Teams */}
      <div className={styles.teams}>
        <motion.div
          className={styles.team}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className={styles.flag}
            animate={selected === 'home' ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {match.home.flag}
          </motion.span>
          <span className={styles.teamName}>{match.home.name}</span>
          <span className={styles.teamCode}>{match.home.code}</span>
        </motion.div>
        <div className={styles.vsWrap}>
          <motion.div
            className={styles.vsCircle}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className={styles.vsRing} />
          </motion.div>
          <span className={styles.vs}>VS</span>
        </div>
        <motion.div
          className={styles.team}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className={styles.flag}
            animate={selected === 'away' ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {match.away.flag}
          </motion.span>
          <span className={styles.teamName}>{match.away.name}</span>
          <span className={styles.teamCode}>{match.away.code}</span>
        </motion.div>
      </div>

      <div className={styles.stadium}>📍 {match.stadium}</div>

      {/* Odds / Prediction Buttons */}
      <div className={styles.odds}>
        {[
          { key: 'home', label: match.home.code, odd: match.odds.home },
          { key: 'draw', label: 'Empate', odd: match.odds.draw },
          { key: 'away', label: match.away.code, odd: match.odds.away },
        ].map(({ key, label, odd }) => (
          <motion.button
            key={key}
            className={`${styles.oddBtn} ${selected === key ? styles.oddSelected : ''} ${confirmed && selected === key ? styles.oddConfirmed : ''}`}
            onClick={() => handleSelect(key)}
            whileTap={{ scale: 0.93 }}
            disabled={confirmed}
            layout
          >
            {selected === key && (
              <motion.div
                className={styles.oddSelectedBg}
                layoutId={`oddBg-${match.id}`}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={styles.oddLabel}>{label}</span>
            <span className={styles.oddValue}>{odd.toFixed(2)}</span>
          </motion.button>
        ))}
      </div>

      {/* Points & Confirm */}
      <div className={styles.footer}>
        <motion.div
          className={styles.pointsBadge}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🪙 <span>{match.points} pts</span>
        </motion.div>
        <AnimatePresence>
          {selected && !confirmed && (
            <motion.button
              className={styles.confirmBtn}
              onClick={handleConfirm}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              ✓ Confirmar
            </motion.button>
          )}
          {confirmed && (
            <motion.div
              className={styles.confirmedBadge}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
              >
                ✅
              </motion.span>
              Predicción enviada
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
