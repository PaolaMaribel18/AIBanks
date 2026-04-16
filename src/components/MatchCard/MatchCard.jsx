import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fire, Coin, Check, Sparkle } from '@phosphor-icons/react';
import { useTranslation } from '../../i18n';
import styles from './MatchCard.module.css';

export default function MatchCard({ match, delay = 0, onPredict, predictedChoice }) {
  const [pendingChoice, setPendingChoice] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiViewState, setAiViewState] = useState('hidden'); // hidden, loading, revealed
  const { t } = useTranslation();

  const selected = predictedChoice ?? pendingChoice;
  const confirmed = Boolean(predictedChoice);

  // Determinar el favorito para asignar etiquetas
  const homeMult = aiData?.gamificacion?.multiplicadores?.[match.home.name] ? parseFloat(aiData.gamificacion.multiplicadores[match.home.name]) : 1.5;
  const awayMult = aiData?.gamificacion?.multiplicadores?.[match.away.name] ? parseFloat(aiData.gamificacion.multiplicadores[match.away.name]) : 1.5;
  const isHomeFavorite = homeMult <= awayMult;
  const isAwayFavorite = awayMult < homeMult;

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

  const handleSelect = (choice) => {
    if (confirmed) return;
    setPendingChoice(choice);
  };

  const handleConfirm = () => {
    if (!selected) return;
    const finalPoints = Math.round(selected === 'home' ? match.points * homeMult : match.points * awayMult);
    onPredict?.(match.id, { choice: selected, points: finalPoints });
  };

  const handleAiConsult = () => {
    setAiViewState('loading');
    setTimeout(() => {
      setAiViewState('revealed');
    }, 2000);
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
          <span className={styles.group}>{t('matchCard.group', { group: match.group })}</span>
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
              <a href={match.matchLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 'bold' }}>
                🔗 FIFA
              </a>
            </>
          )}
        </div>
      </div>

      {/* AI Consultation */}
      <AnimatePresence mode="popLayout">
        {aiViewState !== 'revealed' && (
          <motion.div
            className={styles.aiConsultWrap}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {aiViewState === 'hidden' && (
              <button className={styles.aiConsultBtn} onClick={handleAiConsult}>
                <Sparkle size={18} weight="fill" />
                <span>{t('matchCard.consultAI')}</span>
              </button>
            )}
            {aiViewState === 'loading' && (
              <div className={styles.aiLoadingBar}>
                <span className={styles.aiLoadingText}>{t('matchCard.aiAnalyzing')}</span>
                <div className={styles.progressTrack}>
                  <motion.div
                    className={styles.progressFill}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teams */}
      <div className={styles.teams}>
        <motion.div
          className={styles.team}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className={styles.flag}
            animate={selected === 'home' ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {match.home.flag}
          </motion.span>
          <span className={styles.teamName}>{match.home.name}</span>
          <AnimatePresence>
            {aiViewState === 'revealed' && aiData && aiData.probabilidades_victoria && (
              <motion.div
                className={styles.aiProbBadge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <Sparkle size={12} weight="fill" />
                <span>{Math.round(aiData.probabilidades_victoria[match.home.name])}%</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            className={`${styles.oddBtn} ${selected === 'home' ? styles.oddSelected : ''} ${confirmed && selected === 'home' ? styles.oddConfirmed : ''}`}
            onClick={(e) => { e.stopPropagation(); handleSelect('home'); }}
            whileTap={aiViewState === 'revealed' && !confirmed ? { scale: 0.93 } : {}}
            disabled={confirmed || aiViewState !== 'revealed'}
            layout
          >
            {selected === 'home' && (
              <motion.div
                className={styles.oddSelectedBg}
                layoutId={`oddBg-${match.id}`}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className={styles.btnContent} style={{ paddingTop: '4px', paddingBottom: '4px' }}>
              <span className={aiViewState === 'revealed' ? (isHomeFavorite ? styles.btnPrize : styles.btnPrizeAudaz) : styles.btnPrizeHidden}>
                {aiViewState === 'revealed' ? `+${(match.points * homeMult).toLocaleString()} mAIles` : '??? mAIles'}
              </span>
            </div>
          </motion.button>
        </motion.div>

        <div className={styles.vsWrap}>
          <span className={styles.vs}>VS</span>
        </div>

        <motion.div
          className={styles.team}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className={styles.flag}
            animate={selected === 'away' ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {match.away.flag}
          </motion.span>
          <span className={styles.teamName}>{match.away.name}</span>
          <AnimatePresence>
            {aiViewState === 'revealed' && aiData && aiData.probabilidades_victoria && (
              <motion.div
                className={styles.aiProbBadge}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <Sparkle size={12} weight="fill" />
                <span>{Math.round(aiData.probabilidades_victoria[match.away.name])}%</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            className={`${styles.oddBtn} ${selected === 'away' ? styles.oddSelected : ''} ${confirmed && selected === 'away' ? styles.oddConfirmed : ''}`}
            onClick={(e) => { e.stopPropagation(); handleSelect('away'); }}
            whileTap={aiViewState === 'revealed' && !confirmed ? { scale: 0.93 } : {}}
            disabled={confirmed || aiViewState !== 'revealed'}
            layout
          >
            {selected === 'away' && (
              <motion.div
                className={styles.oddSelectedBg}
                layoutId={`oddBg-${match.id}`}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className={styles.btnContent} style={{ paddingTop: '4px', paddingBottom: '4px' }}>
              <span className={aiViewState === 'revealed' ? (isAwayFavorite ? styles.btnPrize : styles.btnPrizeAudaz) : styles.btnPrizeHidden}>
                {aiViewState === 'revealed' ? `+${(match.points * awayMult).toLocaleString()} mAIles` : '??? mAIles'}
              </span>
            </div>
          </motion.button>
        </motion.div>
      </div>

      <div className={styles.stadium}>📍 {match.stadium}</div>

      {/* Points & Confirm */}
      <div className={styles.footer}>
        <motion.div
          className={styles.pointsBadge}
        >
          <Coin size={16} /> <span>{t('matchCard.ptsEntry')}</span>
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
              <Check size={16} /> {t('matchCard.confirm')}
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
              {t('matchCard.predictionSent')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
