import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fire, Coin, Check } from '@phosphor-icons/react';
import styles from './MatchCard.module.css';

export default function MatchCard({ match, delay = 0, onPredict, predictedChoice }) {
  const [selected, setSelected] = useState(predictedChoice || null);
  const [confirmed, setConfirmed] = useState(!!predictedChoice);
  const [aiData, setAiData] = useState(null);

  useEffect(() => {
    async function fetchAI() {
      try {
        const url = import.meta.env.VITE_AI_BACKEND_URL || 'http://127.0.0.1:8000';
        const response = await fetch(`${url}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ home_team: match.home.name, away_team: match.away.name })
        });
        if (response.ok) {
          const data = await response.json();
          setAiData(data);
        }
      } catch (err) {
        console.error("AI fetch failed:", err);
      }
    }
    fetchAI();
  }, [match.home.name, match.away.name]);

  useEffect(() => {
    if (predictedChoice) {
      setSelected(predictedChoice);
      setConfirmed(true);
      return;
    }

    setSelected(null);
    setConfirmed(false);
  }, [predictedChoice]);

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
              <Fire size={14} /> HOT
            </motion.span>
          )}
        </div>
        <div className={styles.meta}>
          <span>{dateStr}</span>
          <span className={styles.dot}>•</span>
          <span>{timeStr}</span>
          {match.matchLink && (
            <>
              <span className={styles.dot}>•</span>
              <a href={match.matchLink} target="_blank" rel="noopener noreferrer" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 'bold' }}>
                🔗 FIFA
              </a>
            </>
          )}
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
          {aiData && aiData.probabilidades_victoria && (
            <motion.span className={styles.aiProbability} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              {aiData.probabilidades_victoria[match.home.name]}%
            </motion.span>
          )}
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
          {aiData && aiData.probabilidades_victoria && (
            <motion.span className={styles.aiProbability} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              {aiData.probabilidades_victoria[match.away.name]}%
            </motion.span>
          )}
        </motion.div>
      </div>

      <div className={styles.stadium}>📍 {match.stadium}</div>

      {/* Prediction Buttons (sin cuotas) */}
      <div className={styles.odds}>
        {[
          { key: 'home', label: match.home.code, name: match.home.name },
          { key: 'draw', label: 'Empate', name: 'draw' },
          { key: 'away', label: match.away.code, name: match.away.name },
        ].map(({ key, label, name }) => (
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
            <span className={styles.oddLabel} style={{ width: '100%', textAlign: 'center' }}>{label}</span>
            {aiData?.gamificacion?.multiplicadores?.[name] && (
               <span className={styles.aiMultiplier}>{aiData.gamificacion.multiplicadores[name]}x</span>
            )}
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
          <Coin size={16} /> <span>{match.points} pts</span>
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
              <Check size={16} /> Confirmar
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
