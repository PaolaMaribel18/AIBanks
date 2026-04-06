import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MatchCard from '../../components/MatchCard/MatchCard';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { useWorldCupMatches } from '../../hooks/useWorldCupMatches';
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
  const { matches, loading, error } = useWorldCupMatches();
  const [activeGroup, setActiveGroup] = useState('Todos');
  const [predictions, setPredictions] = useState({});

  // Calcular grupos disponibles dinámicamente a partir de los partidos
  const dynamicGroups = ['Todos', ...new Set(matches.map(m => m.group).filter(Boolean))].sort();

  const filtered =
    activeGroup === 'Todos'
      ? matches
      : matches.filter((m) => m.group === activeGroup);

  const handlePredict = (matchId, choice) => {
    setPredictions((prev) => ({ ...prev, [matchId]: choice }));
  };

  const totalPts = filtered.reduce((acc, m) => acc + m.points, 0);

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={styles.title}>🎯 Predicciones</h2>
        <p className={styles.subtitle}>Elige el ganador y acumula puntos</p>
      </motion.div>

      {/* Group Filter Tabs with animated indicator */}
      <div className={styles.filters}>
        {dynamicGroups.map((g) => (
          <motion.button
            key={g}
            className={`${styles.filterBtn} ${activeGroup === g ? styles.filterActive : ''}`}
            onClick={() => setActiveGroup(g)}
            whileTap={{ scale: 0.93 }}
            style={{ position: 'relative' }}
          >
            {g === 'Todos' ? '🌎 Todos' : (g.length === 1 ? `Grupo ${g}` : g)}
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
          Cargando partidos de la FIFA... ⚽
        </div>
      )}
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ff4444' }}>
          Error al cargar: {error}
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
            {Object.keys(predictions).length}
          </motion.span>
          <span className={styles.statLabel}>Predicciones</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <AnimatedCounter value={filtered.length} className={styles.statValue} />
          <span className={styles.statLabel}>Partidos</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <AnimatedCounter value={totalPts.toLocaleString()} className={styles.statValueGold} />
          <span className={styles.statLabel}>Pts Posibles</span>
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
          {filtered.map((match) => (
            <motion.div key={match.id} variants={staggerItem}>
              <MatchCard
                match={match}
                onPredict={handlePredict}
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
