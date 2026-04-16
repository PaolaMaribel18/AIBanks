import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../../components/MatchCard/MatchCard';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { useWorldCupMatches } from '../../hooks/useWorldCupMatches';
import { useTranslation } from '../../i18n';
import styles from './Predictions.module.css';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Predictions() {
  const navigate = useNavigate();
  const { matches, loading, error } = useWorldCupMatches();
  const { t } = useTranslation();
  const [activeGroup, setActiveGroup] = useState('all');
  const [predictions, setPredictions] = useState(() => {
    try {
      const stored = localStorage.getItem('predictions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('predictions', JSON.stringify(predictions));
    } catch {
      // Ignore localStorage write errors
    }
  }, [predictions]);

  const predictedMatches = (matches ?? []).filter((match) => Boolean(predictions[match.id]));
  const pendingMatches = (matches ?? []).filter((match) => !predictions[match.id]);
  const groupOptions = [
    'all',
    'predicted',
    ...new Set(pendingMatches.map((m) => m.group).filter(Boolean)),
  ];

  const filtered =
    activeGroup === 'predicted'
      ? predictedMatches
      : activeGroup === 'all'
        ? pendingMatches
        : pendingMatches.filter((m) => m.group === activeGroup);

  const handlePredict = (matchId, choice) => {
    setPredictions((prev) => ({ ...prev, [matchId]: choice }));
  };

  const pointsInPlay = predictedMatches.reduce((acc, m) => acc + m.points, 0);

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
             onClick={() => navigate('/season')}
             style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
             <ArrowLeft size={20} weight="bold" />
          </button>
          <h2 className={styles.title} style={{ margin: 0 }}>{t('predictions.title')}</h2>
        </div>
        <p className={styles.subtitle} style={{ marginTop: '8px' }}>{t('predictions.subtitle')}</p>
      </motion.div>

      {/* Group Filter Tabs with animated indicator */}
      <div className={styles.filters}>
        {groupOptions.map((g) => (
          <motion.button
            key={g}
            className={`${styles.filterBtn} ${activeGroup === g ? styles.filterActive : ''}`}
            onClick={() => setActiveGroup(g)}
            whileTap={{ scale: 0.93 }}
            style={{ position: 'relative' }}
          >
            {g === 'all'
              ? t('predictions.allEmoji')
              : g === 'predicted'
                ? t('predictions.predictedEmoji')
                : (g.length === 1 ? t('predictions.group', { group: g }) : g)}
            {activeGroup === g && (
              <motion.div
                className={styles.filterIndicator}
                layoutId="filterIndicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
          {t('predictions.loadingMatches')}
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ff4444' }}>
          {t('predictions.loadError')} {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Bar with animated values */}
      <motion.div
        className={styles.statsBar}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.stat}>
          <motion.span
            className={styles.statValue}
            key={Object.keys(predictions).length}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
          >
            {predictedMatches.length}
          </motion.span>
          <span className={styles.statLabel}>{t('predictions.predictionsLabel')}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <AnimatedCounter value={pendingMatches.length} className={styles.statValue} />
          <span className={styles.statLabel}>{t('predictions.matchesLabel')}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <AnimatedCounter value={pointsInPlay.toLocaleString()} className={styles.statValueGold} />
          <span className={styles.statLabel}>{t('predictions.ptsInPlay')}</span>
        </div>
      </motion.div>

      {/* Match List - staggered */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          className={styles.matchList}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10 }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
              {activeGroup === 'predicted'
                ? t('predictions.noPredictions')
                : t('predictions.noMatchesPending')}
            </div>
          ) : filtered.map((match) => (
            <motion.div key={match.id} variants={staggerItem}>
              <MatchCard
                match={match}
                onPredict={handlePredict}
                predictedChoice={predictions[match.id]}
              />
            </motion.div>
          ))}
        </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
