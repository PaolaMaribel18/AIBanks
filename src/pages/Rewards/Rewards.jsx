import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowButton from '../../components/GlowButton/GlowButton';
import { REWARDS_CATALOG, USER_PROFILE } from '../../data/mockData';
import styles from './Rewards.module.css';

const CATEGORIES = [
  { key: 'all', label: '🎁 Todos' },
  { key: 'cashback', label: '💵 Cashback' },
  { key: 'merchandise', label: '👕 Merch' },
  { key: 'entertainment', label: '🎬 Entreteni.' },
  { key: 'experiences', label: '🏟️ Experiencias' },
];

export default function Rewards() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [redeemed, setRedeemed] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const filtered =
    activeCategory === 'all'
      ? REWARDS_CATALOG
      : REWARDS_CATALOG.filter((r) => r.category === activeCategory);

  const handleRedeem = (reward) => {
    if (USER_PROFILE.points < reward.cost || redeemed[reward.id]) return;
    setRedeemed((prev) => ({ ...prev, [reward.id]: true }));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className={styles.confetti}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.span
                key={i}
                className={styles.confettiPiece}
                initial={{
                  x: '50%',
                  y: '40%',
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.5, delay: i * 0.05 }}
              >
                {['🎉', '⭐', '🪙', '✨', '🎊'][i % 5]}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={styles.title}>🎁 Premios</h2>
        <div className={styles.balance}>
          <span className={styles.balanceLabel}>Tu saldo</span>
          <div className={styles.balanceValue}>
            <span>🪙</span>
            <span className={styles.balanceNum}>{USER_PROFILE.points.toLocaleString()}</span>
            <span className={styles.balanceCurrency}>pts</span>
          </div>
        </div>
      </motion.div>

      {/* VIP Badge */}
      <motion.div
        className={styles.vipBanner}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className={styles.vipLeft}>
          <span className={styles.vipIcon}>👑</span>
          <div>
            <div className={styles.vipTitle}>{USER_PROFILE.tier}</div>
            <div className={styles.vipDesc}>Acceso exclusivo a premios premium</div>
          </div>
        </div>
        <div className={styles.vipMultiplier}>x2</div>
      </motion.div>

      {/* Categories */}
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.key}
            className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catActive : ''}`}
            onClick={() => setActiveCategory(cat.key)}
            whileTap={{ scale: 0.93 }}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Rewards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className={styles.grid}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {filtered.map((reward, i) => {
            const canAfford = USER_PROFILE.points >= reward.cost;
            const isRedeemed = redeemed[reward.id];

            return (
              <motion.div
                key={reward.id}
                className={`${styles.rewardCard} ${isRedeemed ? styles.redeemed : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileTap={{ scale: 0.97 }}
              >
                {reward.popular && !isRedeemed && (
                  <div className={styles.popularTag}>⭐ Popular</div>
                )}

                <span className={styles.rewardIcon}>{reward.icon}</span>
                <h4 className={styles.rewardName}>{reward.name}</h4>
                <p className={styles.rewardDesc}>{reward.description}</p>

                <div className={styles.rewardFooter}>
                  <div className={styles.rewardCost}>
                    <span>🪙</span>
                    <span className={styles.costValue}>{reward.cost.toLocaleString()}</span>
                  </div>
                  {isRedeemed ? (
                    <div className={styles.redeemedBadge}>✅ Canjeado</div>
                  ) : (
                    <GlowButton
                      variant={canAfford ? 'gold' : 'ghost'}
                      size="sm"
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Canjear' : 'Insuficiente'}
                    </GlowButton>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
