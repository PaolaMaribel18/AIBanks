import { useState } from 'react';
import { motion } from 'framer-motion';
import { LEADERBOARD_DATA, USER_PROFILE } from '../../data/mockData';
import styles from './Leaderboard.module.css';

const TABS = ['Semanal', 'Mensual', 'Global'];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('Semanal');

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={styles.title}>🏆 Ranking</h2>
        <p className={styles.subtitle}>Compite con otros jugadores</p>
      </motion.div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <motion.button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
            whileTap={{ scale: 0.95 }}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      {/* Top 3 Podium */}
      <motion.div
        className={styles.podium}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* 2nd Place */}
        <div className={`${styles.podiumSpot} ${styles.second}`}>
          <div className={styles.podiumAvatar}>
            <span>{LEADERBOARD_DATA[1].avatar}</span>
          </div>
          <span className={styles.podiumBadge}>🥈</span>
          <span className={styles.podiumName}>{LEADERBOARD_DATA[1].name}</span>
          <span className={styles.podiumPoints}>
            {LEADERBOARD_DATA[1].points.toLocaleString()}
          </span>
          <div className={styles.podiumBar} style={{ height: 60 }} />
        </div>

        {/* 1st Place */}
        <div className={`${styles.podiumSpot} ${styles.first}`}>
          <motion.div
            className={styles.crownWrap}
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            👑
          </motion.div>
          <div className={`${styles.podiumAvatar} ${styles.podiumAvatarFirst}`}>
            <span>{LEADERBOARD_DATA[0].avatar}</span>
          </div>
          <span className={styles.podiumBadge}>🏆</span>
          <span className={styles.podiumName}>{LEADERBOARD_DATA[0].name}</span>
          <span className={styles.podiumPoints}>
            {LEADERBOARD_DATA[0].points.toLocaleString()}
          </span>
          <div className={styles.podiumBar} style={{ height: 84 }} />
        </div>

        {/* 3rd Place */}
        <div className={`${styles.podiumSpot} ${styles.third}`}>
          <div className={styles.podiumAvatar}>
            <span>{LEADERBOARD_DATA[2].avatar}</span>
          </div>
          <span className={styles.podiumBadge}>🥉</span>
          <span className={styles.podiumName}>{LEADERBOARD_DATA[2].name}</span>
          <span className={styles.podiumPoints}>
            {LEADERBOARD_DATA[2].points.toLocaleString()}
          </span>
          <div className={styles.podiumBar} style={{ height: 44 }} />
        </div>
      </motion.div>

      {/* Your Position */}
      <motion.div
        className={styles.yourPos}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.yourPosLeft}>
          <span className={styles.yourRank}>#{USER_PROFILE.rank}</span>
          <span className={styles.yourAvatar}>{USER_PROFILE.avatar}</span>
          <div>
            <div className={styles.yourName}>Tú ({USER_PROFILE.name})</div>
            <div className={styles.yourTier}>🔥 Racha: {USER_PROFILE.streak}</div>
          </div>
        </div>
        <div className={styles.yourPoints}>
          <span>{USER_PROFILE.points.toLocaleString()}</span>
          <span className={styles.ptLabel}>pts</span>
        </div>
      </motion.div>

      {/* Full List */}
      <div className={styles.list}>
        {LEADERBOARD_DATA.slice(3).map((player, i) => (
          <motion.div
            key={player.rank}
            className={styles.listItem}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.04 }}
          >
            <div className={styles.listLeft}>
              <span className={styles.listRank}>#{player.rank}</span>
              <span className={styles.listAvatar}>{player.avatar}</span>
              <div>
                <div className={styles.listName}>{player.name}</div>
                <div className={styles.listStreak}>🔥 {player.streak}</div>
              </div>
            </div>
            <div className={styles.listPoints}>
              <span>{player.points.toLocaleString()}</span>
              <span className={styles.ptLabel}>pts</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
