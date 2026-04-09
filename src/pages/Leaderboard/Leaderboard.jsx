import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Fire, Trophy, X } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContextBase';
import { LEADERBOARD_DATA, UPCOMING_MATCHES, USER_PROFILE } from '../../data/mockData';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import StarsBackground from '../../components/StarsBackground/StarsBackground';
import { useMAIis } from '../../hooks/useMAIis';
import styles from './Leaderboard.module.css';

const TABS = ['Semanal', 'Mensual', 'Global'];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const staggerItem = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
};

export default function Leaderboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('Semanal');
  const { matches } = useWorldCupMatches();
  const { user } = useAuth();
  const { currentMAIis } = useMAIis();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Remove scroll on body when modal opens
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const allMatches = matches?.length ? matches : UPCOMING_MATCHES;
  const currentRank = 1 + LEADERBOARD_DATA.filter((player) => player.points > currentMAIis).length;

  const modalContent = (
    <motion.div 
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className={styles.modalContent}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} weight="bold" />
        </button>

        <div className={styles.page}>
          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
        <h2 className={styles.title}><Trophy size={24} /> Ranking AIBank</h2>
        <p className={styles.subtitle}>Compite con tus amigos y otros clientes de AIBank.</p>
      </motion.div>



      {/* Podium with StarsBackground */}
      <motion.div
        className={styles.podiumWrap}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <StarsBackground count={15} />
        <div className={styles.podium}>
          {/* 2nd Place */}
          <div className={`${styles.podiumSpot} ${styles.second}`}>
            <motion.div
              className={styles.podiumAvatar}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              <span>{LEADERBOARD_DATA[1].avatar}</span>
            </motion.div>
            <span className={styles.podiumBadge}>🥈</span>
            <span className={styles.podiumName}>{LEADERBOARD_DATA[1].name}</span>
            <span className={styles.podiumPoints}>
              {LEADERBOARD_DATA[1].points.toLocaleString()}
            </span>
            <motion.div
              className={`${styles.podiumBar} ${styles.barSilver}`}
              style={{ height: 60 }}
              initial={{ height: 0 }}
              animate={{ height: 60 }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
            >
              <span className={styles.barRank}>2</span>
            </motion.div>
          </div>

          {/* 1st Place */}
          <div className={`${styles.podiumSpot} ${styles.first}`}>
            <motion.div
              className={styles.crownWrap}
              animate={{ y: [0, -5, 0], rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <Crown size={32} />
            </motion.div>
            <motion.div
              className={`${styles.podiumAvatar} ${styles.podiumAvatarFirst}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            >
              <span>{LEADERBOARD_DATA[0].avatar}</span>
            </motion.div>
            <span className={styles.podiumBadge}><Trophy size={16} /></span>
            <span className={styles.podiumName}>{LEADERBOARD_DATA[0].name}</span>
            <span className={styles.podiumPoints}>
              <AnimatedCounter value={LEADERBOARD_DATA[0].points.toLocaleString()} />
            </span>
            <motion.div
              className={`${styles.podiumBar} ${styles.barGold}`}
              style={{ height: 84 }}
              initial={{ height: 0 }}
              animate={{ height: 84 }}
              transition={{ delay: 0.3, duration: 0.7, type: 'spring' }}
            >
              <span className={styles.barRank}>1</span>
            </motion.div>
          </div>

          {/* 3rd Place */}
          <div className={`${styles.podiumSpot} ${styles.third}`}>
            <motion.div
              className={styles.podiumAvatar}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            >
              <span>{LEADERBOARD_DATA[2].avatar}</span>
            </motion.div>
            <span className={styles.podiumBadge}>🥉</span>
            <span className={styles.podiumName}>{LEADERBOARD_DATA[2].name}</span>
            <span className={styles.podiumPoints}>
              {LEADERBOARD_DATA[2].points.toLocaleString()}
            </span>
            <motion.div
              className={`${styles.podiumBar} ${styles.barBronze}`}
              style={{ height: 44 }}
              initial={{ height: 0 }}
              animate={{ height: 44 }}
              transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
            >
              <span className={styles.barRank}>3</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Your Position - highlighted */}
      <motion.div
        className={styles.yourPos}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: 'spring' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={styles.yourPosLeft}>
          <motion.span
            className={styles.yourRank}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            #{currentRank}
          </motion.span>
          <span className={styles.yourAvatar}>{USER_PROFILE.avatar}</span>
          <div>
            <div className={styles.yourName}>Tú ({user?.name || USER_PROFILE.name})</div>
            <div className={styles.yourTier}><Fire size={16} /> Racha: {USER_PROFILE.streak}</div>
          </div>
        </div>
        <div className={styles.yourPoints}>
          <AnimatedCounter value={currentMAIis.toLocaleString()} className={styles.yourPointsNum} />
          <span className={styles.ptLabel}>mAIis</span>
        </div>
      </motion.div>

      {/* Full List - staggered */}
      <motion.div
        className={styles.list}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {LEADERBOARD_DATA.slice(3).map((player) => (
          <motion.div
            key={player.rank}
            className={styles.listItem}
            variants={staggerItem}
            whileTap={{ scale: 0.98, x: 4 }}
          >
            <div className={styles.listLeft}>
              <span className={styles.listRank}>#{player.rank}</span>
              <motion.span
                className={styles.listAvatar}
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                {player.avatar}
              </motion.span>
              <div>
                <div className={styles.listName}>{player.name}</div>
                <div className={styles.listStreak}><Fire size={14} /> {player.streak}</div>
              </div>
            </div>
            <div className={styles.listRight}>
              <div className={styles.listPoints}>
                <span>{player.points.toLocaleString()}</span>
                <span className={styles.ptLabel}>mAIis</span>
              </div>
              <div className={styles.listBar}>
                <motion.div
                  className={styles.listBarFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${(player.points / LEADERBOARD_DATA[0].points) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
