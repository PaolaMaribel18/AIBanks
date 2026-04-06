import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MatchCard from '../../components/MatchCard/MatchCard';
import { UPCOMING_MATCHES } from '../../data/mockData';
import styles from './Predictions.module.css';

const GROUPS = ['Todos', 'A', 'B', 'C', 'D'];

export default function Predictions() {
  const [activeGroup, setActiveGroup] = useState('Todos');
  const [predictions, setPredictions] = useState({});

  const filtered =
    activeGroup === 'Todos'
      ? UPCOMING_MATCHES
      : UPCOMING_MATCHES.filter((m) => m.group === activeGroup);

  const handlePredict = (matchId, choice) => {
    setPredictions((prev) => ({ ...prev, [matchId]: choice }));
  };

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

      {/* Group Filter Tabs */}
      <div className={styles.filters}>
        {GROUPS.map((g) => (
          <motion.button
            key={g}
            className={`${styles.filterBtn} ${activeGroup === g ? styles.filterActive : ''}`}
            onClick={() => setActiveGroup(g)}
            whileTap={{ scale: 0.93 }}
          >
            {g === 'Todos' ? '🌎 Todos' : `Grupo ${g}`}
          </motion.button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{Object.keys(predictions).length}</span>
          <span className={styles.statLabel}>Predicciones</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{filtered.length}</span>
          <span className={styles.statLabel}>Partidos</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {filtered.reduce((acc, m) => acc + m.points, 0).toLocaleString()}
          </span>
          <span className={styles.statLabel}>Pts Posibles</span>
        </div>
      </div>

      {/* Match List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          className={styles.matchList}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {filtered.map((match, i) => (
            <MatchCard
              key={match.id}
              match={match}
              delay={0.05 * i}
              onPredict={handlePredict}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
