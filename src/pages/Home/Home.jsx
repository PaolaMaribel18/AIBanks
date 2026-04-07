import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightning, TrendUp, Fire, Trophy, Gift, Eye, EyeSlash, ArrowRight, Target, Coin, Crown, Star, Handshake, Check, X } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import MatchCard from '../../components/MatchCard/MatchCard';
import StarsBackground from '../../components/StarsBackground/StarsBackground';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import RippleButton from '../../components/RippleButton/RippleButton';
import FifaLive from '../../components/FifaLive/FifaLive';
import { UPCOMING_MATCHES, USER_PROFILE } from '../../data/mockData';
import { useWorldCupMatches } from '../../hooks/useWorldCupMatches';
import styles from './Home.module.css';

// Staggered children animation
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: [20, -5, 0], transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Home() {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [claimedBonus, setClaimedBonus] = useState(false);
  const [popEye, setPopEye] = useState(false);
  const [predictions, setPredictions] = useState(() => {
    try {
      const stored = localStorage.getItem('predictions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const { matches, loading } = useWorldCupMatches();
  const allMatches = matches?.length ? matches : UPCOMING_MATCHES;
  const predictionHistory = Object.entries(predictions)
    .map(([matchId, choice]) => {
      const match = allMatches.find((item) => String(item.id) === String(matchId));
      return match ? { ...match, prediction: choice } : null;
    })
    .filter(Boolean);
  const earnedPredictionPoints = predictionHistory.reduce((acc, match) => acc + (match.points || 0), 0);
  const currentPoints = USER_PROFILE.points + earnedPredictionPoints;
  const pendingMatches = allMatches.filter((match) => !predictions[match.id]);
  const featuredMatches = pendingMatches.filter((match) => match.hot).slice(0, 2);
  const matchesToShow = featuredMatches.length > 0 ? featuredMatches : pendingMatches.slice(0, 2);

  useEffect(() => {
    try {
      localStorage.setItem('predictions', JSON.stringify(predictions));
    } catch {
      // Ignore localStorage write errors
    }
  }, [predictions]);

  const handlePredict = (matchId, choice) => {
    setPredictions((prev) => ({ ...prev, [matchId]: choice }));
  };

  const getPredictionLabel = (match) => (
    match.prediction === 'home'
      ? match.home.name
      : match.prediction === 'away'
        ? match.away.name
        : 'Empate'
  );

  const quickActions = [
    { icon: Target, label: 'Predecir', color: '#ffd700', bg: 'rgba(255,215,0,0.12)', path: '/predictions' },
    { icon: Gift, label: 'Premios', color: '#d500f9', bg: 'rgba(213,0,249,0.12)', path: '/rewards' },
    { icon: Trophy, label: 'Ranking', color: '#00e676', bg: 'rgba(0,230,118,0.12)', path: '/leaderboard' },
    { icon: Fire, label: 'Racha', color: '#ff6b35', bg: 'rgba(255,107,53,0.12)', path: '/profile' },
  ];

  return (
    <div className={styles.page}>
      {/* Balance Card with Stars Background */}
      <motion.section
        className={styles.balanceCard}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <StarsBackground count={25} />
        <div className={styles.balanceContent}>
          <div className={styles.balanceTop}>
            <span className={styles.balanceLabel}>Mis Puntos AI Banks</span>
            <motion.button
              className={styles.eyeBtn}
              onClick={() => {
                setShowBalance(!showBalance);
                setPopEye(true);
                setTimeout(() => setPopEye(false), 200);
              }}
              aria-label="Mostrar/ocultar saldo"
              whileTap={{ scale: 0.85 }}
              animate={{ scale: popEye ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={showBalance ? 'show' : 'hide'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  {showBalance ? <Eye size={20} weight="bold" /> : <EyeSlash size={20} weight="bold" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
          <div className={styles.balanceRow}>
            <div className={styles.balanceValue}>
              <motion.span
                className={styles.balanceCoin}
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Coin size={20} weight="bold" />
              </motion.span>
              <AnimatePresence mode="wait">
                {showBalance ? (
                  <motion.div
                    key="visible"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={styles.balanceNumWrap}
                  >
                    <AnimatedCounter
                      value={currentPoints.toLocaleString()}
                      className={styles.balanceNum}
                    />
                    <span className={styles.balancePts}>pts</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={styles.balanceNum}
                    style={{ letterSpacing: '4px' }}
                  >
                    • • • •
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <motion.span
              className={styles.balanceArrow}
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ›
            </motion.span>
          </div>
          <motion.div
            className={styles.balanceBadge}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Crown size={16} weight="bold" />
            <span>{USER_PROFILE.tier}</span>
            <span className={styles.badgeDot}>•</span>
            <span>+{earnedPredictionPoints} por predicciones</span>
            <span className={styles.badgeDot}>•</span>
            <span>Racha {USER_PROFILE.streak}</span>
            {USER_PROFILE.streak > 5 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ display: 'inline-block', marginLeft: '4px' }}
              >
                <Fire size={16} weight="bold" />
              </motion.span>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Actions - Staggered entrance */}
      <motion.section
        className={styles.quickActions}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {quickActions.map(({ icon: Icon, label, color, bg, path }) => (
          <motion.button
            key={label}
            className={styles.quickBtn}
            onClick={() => navigate(path)}
            variants={staggerItem}
            whileTap={{ scale: 0.88 }}
            whileHover={{ y: -3 }}
          >
            <motion.div
              className={styles.quickIcon}
              style={{ background: bg, color }}
              whileHover={{
                boxShadow: `0 0 20px ${color}40`,
                scale: 1.08,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Icon size={22} weight="bold" />
            </motion.div>
            <span className={styles.quickLabel}>{label}</span>
          </motion.button>
        ))}
      </motion.section>

      {/* Daily Bonus with pulse animation */}
      <motion.section
        className={styles.bonus}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
      >
        <div className={styles.bonusLeft}>
          <motion.span
            className={styles.bonusIcon}
            animate={{
              y: [0, -4, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <Gift size={24} weight="bold" />
          </motion.span>
          <div>
            <div className={styles.bonusLabel}>BONO DIARIO</div>
            <div className={styles.bonusValue}>+50 puntos gratis</div>
          </div>
        </div>
        <RippleButton variant="green" size="sm" onClick={() => setClaimedBonus(true)} disabled={claimedBonus}>
          {claimedBonus ? 'Reclamado' : 'Reclamar'}
        </RippleButton>
      </motion.section>
      {claimedBonus && <Confetti recycle={false} numberOfPieces={200} />}

      {/* ═══ FIFA World Cup 2026 — Live Section ═══ */}
      <FifaLive />

      {/* Mis Predicciones — staggered list */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Mis Predicciones</h3>
          <motion.button
            className={styles.seeAll}
            onClick={() => navigate('/profile')}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowRight size={18} weight="bold" />
          </motion.button>
        </div>
        <motion.div
          className={styles.activityList}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {predictionHistory.length > 0 ? (
            predictionHistory.slice(0, 3).map((match, i) => (
              <motion.div
                key={match.id}
                className={styles.actItem}
                variants={staggerItem}
                whileTap={{ scale: 0.98, backgroundColor: 'rgba(255,255,255,0.03)' }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,215,0,0.05)' }}
              >
                <div className={styles.actLeft}>
                  <motion.div
                    className={styles.actAvatar}
                    style={{
                      background: 'rgba(0, 230, 118, 0.12)',
                      color: '#00e676',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 400 }}
                  >
                    <Check size={16} weight="bold" />
                  </motion.div>
                  <div>
                    <div className={styles.actMatch}>{match.home.name} vs {match.away.name}</div>
                    <div className={styles.actPred}>Tu pronóstico: {getPredictionLabel(match)}</div>
                  </div>
                </div>
                <div className={styles.actRight}>
                  <motion.span
                    className={styles.actPoints}
                    style={{ color: '#00e676' }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    +{match.points}
                  </motion.span>
                  <span className={styles.actBalance}>guardada</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
              Aún no has guardado predicciones.
            </div>
          )}
        </motion.div>
      </section>

      {/* Hot Matches */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Partidos 🔥</h3>
          <motion.button
            className={styles.seeAll}
            onClick={() => navigate('/predictions')}
            whileHover={{ x: 3 }}
          >
            Ver todos <ArrowRight size={14} weight="bold" />
          </motion.button>
        </div>
        <div className={styles.matchList}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
              Cargando partidos... ⚽
            </div>
          ) : matchesToShow.length > 0 ? (
            matchesToShow.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                delay={0.1 * i}
                onPredict={handlePredict}
                predictedChoice={predictions[match.id]}
              />
            ))
          ) : (
            <div style={{ padding: '1rem', color: '#888' }}>No hay partidos destacados por ahora.</div>
          )}
        </div>
      </section>

      {/* Promos - Horizontal scroll with snap */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Mis Promociones</h3>
        <motion.div
          className={styles.promoScroll}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {[
            {
              title: 'Doble Puntos',
              desc: 'Duplica tus puntos en partidos de Ecuador',
              icon: Star,
              gradient: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
              border: 'rgba(213, 0, 249, 0.2)',
            },
            {
              title: 'Refiere y Gana',
              desc: 'Invita amigos y gana 500 puntos cada uno',
              icon: Handshake,
              gradient: 'linear-gradient(135deg, #1a1a2e, #1b3a2d)',
              border: 'rgba(0, 230, 118, 0.2)',
            },
            {
              title: 'Mundial 2026',
              desc: 'Predice el campeón y gana 10,000 pts',
              icon: Trophy,
              gradient: 'linear-gradient(135deg, #1a1a2e, #3a2d1b)',
              border: 'rgba(255, 215, 0, 0.2)',
            },
          ].map((promo, i) => (
            <motion.div
              key={i}
              className={styles.promoCard}
              style={{ background: promo.gradient, borderColor: promo.border }}
              variants={staggerItem}
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -4, boxShadow: `0 8px 30px ${promo.border}`, filter: 'brightness(1.1)' }}
            >
              <h4 className={styles.promoTitle}>{promo.title}</h4>
              <p className={styles.promoDesc}>{promo.desc}</p>
              <motion.div
                className={styles.promoIconWrap}
                animate={{ y: [0, -3, 0], rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
              >
                <promo.icon size={24} weight="bold" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TCS Powered */}
      <motion.div
        className={styles.powered}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span>powered by</span>
        <strong>TCS</strong>
        <span className={styles.tcsLabel}>Tata Consultancy Services</span>
      </motion.div>
    </div>
  );
}
