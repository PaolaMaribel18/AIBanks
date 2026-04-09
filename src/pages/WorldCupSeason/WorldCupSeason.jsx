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
import { useTier } from '../../hooks/useTier';
import { useMAIis } from '../../hooks/useMAIis';
import styles from './WorldCupSeason.module.css';

// Staggered children animation
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: [20, -5, 0], transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function WorldCupSeason() {
  const navigate = useNavigate();
  const tier = useTier();
  const [showBalance, setShowBalance] = useState(true);
  const [claimedBonus, setClaimedBonus] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return localStorage.getItem('dailyBonusClaimed') === today;
  });
  const [popEye, setPopEye] = useState(false);
  const { currentMAIis, earnedPredictionMAIis, predictions, setPredictions, addBankMAIis } = useMAIis();
  const { matches, loading } = useWorldCupMatches();
  const allMatches = matches?.length ? matches : UPCOMING_MATCHES;
  const predictionHistory = Object.entries(predictions)
    .map(([matchId, predData]) => {
      const match = allMatches.find((item) => String(item.id) === String(matchId));
      if (!match) return null;
      const choice = typeof predData === 'object' ? predData.choice : predData;
      const points = typeof predData === 'object' ? predData.points : match.points;
      return { ...match, prediction: choice, calculatedPoints: points };
    })
    .filter(Boolean);
  const pendingMatches = allMatches.filter((match) => !predictions[match.id]);
  const featuredMatches = pendingMatches.filter((match) => match.hot).slice(0, 2);
  const matchesToShow = featuredMatches.length > 0 ? featuredMatches : pendingMatches.slice(0, 2);

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

  const [activeTab, setActiveTab] = useState('Desafios');

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
            <span className={styles.balanceLabel}>Mis mAIles Temporada Mundial</span>
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
                      value={currentMAIis.toLocaleString()}
                      className={styles.balanceNum}
                    />
                    <span className={styles.balancePts}>mAIles</span>
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
            <span>+{earnedPredictionMAIis} por predicciones</span>
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

      {/* Tab Navigation */}
      <div className={styles.tabsMain}>
        {['Desafios', 'Pronosticos', 'En Vivo'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tabMainBtn} ${activeTab === tab ? styles.tabMainActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                className={styles.tabMainIndicator}
                layoutId="mainTabIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        <AnimatePresence mode="wait">
          {activeTab === 'Desafios' && (
            <motion.div
              key="desafios"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Daily Bonus */}
              <motion.section
                className={styles.bonus}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className={styles.bonusLeft}>
                  <motion.span
                    className={styles.bonusIcon}
                    animate={{ y: [0, -4, 0], rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                  >
                    <Gift size={24} weight="bold" />
                  </motion.span>
                  <div>
                    <div className={styles.bonusLabel}>BONO DIARIO</div>
                    <div className={styles.bonusValue}>+50 mAIles gratis</div>
                  </div>
                </div>
                <RippleButton
                  variant="green"
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    localStorage.setItem('dailyBonusClaimed', today);
                    setClaimedBonus(true);
                    addBankMAIis(50);
                  }}
                  disabled={claimedBonus}
                >
                  {claimedBonus ? 'Reclamado' : 'Reclamar'}
                </RippleButton>
              </motion.section>
              {claimedBonus && <Confetti recycle={false} numberOfPieces={200} />}

              {/* Info Banner */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  margin: '16px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(213,0,249,0.1), rgba(0,230,118,0.05))',
                  border: '1px solid rgba(213,0,249,0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ background: 'rgba(213,0,249,0.2)', padding: '8px', borderRadius: '50%', color: '#d500f9', flexShrink: 0 }}>
                   <Lightning size={20} weight="fill" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#fff', fontWeight: '800' }}>¿Cómo ganar más mAIles?</h4>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    Nuestra IA analiza los datos para predecir al favorito de cada partido. Al <strong>consultar a AI-Gents</strong>, obtendrás ganancias conservadoras o te llevarás una recompensa masiva según el riesgo.
                  </p>
                </div>
              </motion.div>

              {/* Hot Matches */}
              <section className={styles.section} style={{ marginTop: '16px' }}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Partidos para ti 🔥</h3>
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
                    <div style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>
                      Ya completaste todos los partidos recientes.
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'Pronosticos' && (
            <motion.div
              key="pronosticos"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Mi Portafolio</h3>
                </div>
                <motion.div
                  className={styles.activityList}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {predictionHistory.length > 0 ? (
                    predictionHistory.map((match, i) => (
                      <motion.div
                        key={match.id}
                        className={styles.actItem}
                        variants={staggerItem}
                      >
                        <div className={styles.actLeft}>
                          <motion.div
                            className={styles.actAvatar}
                            style={{ background: 'rgba(0, 230, 118, 0.12)', color: '#00e676' }}
                          >
                            <Check size={16} weight="bold" />
                          </motion.div>
                          <div>
                            <div className={styles.actMatch}>{match.home.name} vs {match.away.name}</div>
                            <div className={styles.actPred}>Elegiste: {getPredictionLabel(match)}</div>
                          </div>
                        </div>
                        <div className={styles.actRight}>
                          <span className={styles.actPoints} style={{ color: '#00e676' }}>
                            +{match.calculatedPoints} mAIles
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      Aún no has guardado predicciones. <br/> ¡Ve a Desafíos!
                    </div>
                  )}
                </motion.div>
              </section>
            </motion.div>
          )}

          {activeTab === 'En Vivo' && (
            <motion.div
              key="envivo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <FifaLive />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
