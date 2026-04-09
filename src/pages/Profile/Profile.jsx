import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SignOut,
  Info,
  CaretRight,
  CaretLeft,
  Sun,
  Crown,
  Fire,
  Coin,
  X,
  Envelope,
  Globe,
  Code,
  Heart,
} from '@phosphor-icons/react';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import FlipCard from '../../components/FlipCard/FlipCard';
import StarsBackground from '../../components/StarsBackground/StarsBackground';
import { LEADERBOARD_DATA, USER_PROFILE, UPCOMING_MATCHES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContextBase';
import { useTheme } from '../../context/ThemeContextBase';
import { useWorldCupMatches } from '../../hooks/useWorldCupMatches';
import { useTier } from '../../hooks/useTier';
import { useMAIis } from '../../hooks/useMAIis';
import styles from './Profile.module.css';

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22 } },
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { matches } = useWorldCupMatches();
  const tier = useTier();
  const { currentMAIis, predictions } = useMAIis();
  const archetype = localStorage.getItem('archetype') || 'practico';
  const [showAboutModal, setShowAboutModal] = useState(false);
  const allMatches = matches?.length ? matches : UPCOMING_MATCHES;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const predictionHistory = Object.entries(predictions).map(([matchId, choice]) => {
    const match = allMatches.find((m) => String(m.id) === String(matchId));
    return match ? { ...match, prediction: choice } : null;
  }).filter(Boolean);

  const currentPredictionsCount = USER_PROFILE.totalPredictions + predictionHistory.length;
  const currentRank = 1 + LEADERBOARD_DATA.filter((player) => player.points > currentMAIis).length;
  const recentProfileActivity = predictionHistory.length > 0 ? predictionHistory.slice(0, 4) : USER_PROFILE.recentActivity;

  const accuracy = USER_PROFILE.winRate;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (accuracy / 100) * circumference;

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '4px'
            }}
          >
             <CaretLeft size={26} weight="bold" />
          </button>
          <h2 className={styles.title} style={{ marginBottom: 0 }}>Mi AIBank ID</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>Gestiona tus credenciales y actividad.</p>
      </motion.div>

      {/* Profile Card with Stars */}
      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <StarsBackground count={20} />
        <div className={styles.profileContent}>
          <motion.div
            className={styles.avatarWrap}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <span className={styles.avatar}>{USER_PROFILE.avatar}</span>
            <motion.span
              className={styles.tierBadge}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown size={20} weight="bold" />
            </motion.span>
          </motion.div>
          <div className={styles.profileInfo}>
            <h3 className={styles.name}>{user?.name || USER_PROFILE.name}</h3>
            <motion.span
              className={styles.tier}
              animate={{ boxShadow: ['0 0 0 rgba(255,215,0,0)', '0 0 12px rgba(255,215,0,0.3)', '0 0 0 rgba(255,215,0,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {tier}
            </motion.span>
          </div>
          <div className={styles.pointsBig}>
            <Coin size={24} weight="bold" />
            <AnimatedCounter
              value={currentMAIis.toLocaleString()}
              className={styles.pointsNum}
            />
            <span className={styles.ptsCurrency}>mAIis</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - FlipCards for each stat */}
      <motion.div
        className={styles.statsGrid}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Precision - FlipCard shows details on back */}
        <motion.div variants={staggerItem}>
          <FlipCard
            front={
              <div className={styles.statCard}>
                <div className={styles.ringWrap}>
                  <svg viewBox="0 0 100 100" className={styles.ring}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" stroke={theme === 'dark' ? '#ffd700' : '#b8960c'} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <span className={styles.ringValue}>{accuracy}%</span>
                </div>
                <span className={styles.statBoxLabel}>Precisión</span>
                <span className={styles.flipHint}>Toca para detalles</span>
              </div>
            }
            back={
              <div className={`${styles.statCard} ${styles.statCardBack}`}>
                <span className={styles.statBigNum}>✅ {USER_PROFILE.correctPredictions}</span>
                <span className={styles.statBoxLabel}>Aciertos de {USER_PROFILE.totalPredictions}</span>
                <span className={styles.statBigNum} style={{ color: theme === 'dark' ? '#ff1744' : '#dc3545' }}>❌ {USER_PROFILE.totalPredictions - USER_PROFILE.correctPredictions}</span>
                <span className={styles.statBoxLabel}>Errores</span>
              </div>
            }
          />
        </motion.div>

        {/* Predictions */}
        <motion.div variants={staggerItem}>
          <div className={styles.statCard}>
            <span className={styles.statBigNum}>{currentPredictionsCount}</span>
            <span className={styles.statBoxLabel}>Predicciones</span>
            <div className={styles.statMini}>
              <span className={styles.statWin}>✅ {USER_PROFILE.correctPredictions}</span>
              <span className={styles.statLoss}>
                ❌ {USER_PROFILE.totalPredictions - USER_PROFILE.correctPredictions}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Ranking */}
        <motion.div variants={staggerItem}>
          <div className={styles.statCard}>
            <AnimatedCounter value={`#${currentRank}`} className={styles.statBigNum} />
            <span className={styles.statBoxLabel}>Ranking</span>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div variants={staggerItem}>
          <div className={styles.statCard}>
            <motion.span
              className={styles.statBigNum}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {USER_PROFILE.streak} <Fire size={20} weight="bold" />
            </motion.span>
            <span className={styles.statBoxLabel}>Racha</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Achievements with stagger */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🏅 Logros</h3>
        <motion.div
          className={styles.achievements}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {USER_PROFILE.achievements.map((ach, index) => (
            <motion.div
              key={ach.id}
              className={`${styles.achBadge} ${!ach.unlocked ? styles.achLocked : ''}`}
              variants={staggerItem}
              whileTap={{ scale: 0.92, rotate: ach.unlocked ? [0, -3, 3, 0] : 0 }}
            >
              <motion.span
                className={styles.achIcon}
                animate={ach.unlocked ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.12 }}
              >
                {ach.icon}
              </motion.span>
              <span className={styles.achName}>{ach.name}</span>
              {!ach.unlocked && <span className={styles.achLock}>🔒</span>}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent Activity */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 Actividad Reciente</h3>
        <motion.div
          className={styles.activity}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {recentProfileActivity.map((act, i) => {
            const isSavedPrediction = 'home' in act || 'away' in act;
            const predictionLabel = isSavedPrediction
              ? (act.prediction === 'home' ? act.home.name : act.prediction === 'away' ? act.away.name : 'Empate')
              : act.prediction;
            const pointsLabel = isSavedPrediction ? `+${act.points}` : act.points;
            const accentColor = isSavedPrediction || act.result === 'win'
              ? (theme === 'dark' ? '#00e676' : '#28a745')
              : (theme === 'dark' ? '#ff1744' : '#dc3545');

            return (
              <motion.div
                key={isSavedPrediction ? act.id : i}
                className={styles.actItem}
                variants={staggerItem}
              >
                <div className={styles.actLeft}>
                  <motion.span
                    className={styles.actDot}
                    style={{ background: accentColor }}
                    animate={{
                      boxShadow: isSavedPrediction || act.result === 'win'
                        ? ['0 0 0 rgba(0,230,118,0)', '0 0 10px rgba(0,230,118,0.5)', '0 0 0 rgba(0,230,118,0)']
                        : ['0 0 0 rgba(255,23,68,0)', '0 0 10px rgba(255,23,68,0.5)', '0 0 0 rgba(255,23,68,0)'],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div>
                    <div className={styles.actMatch}>{isSavedPrediction ? `${act.home.name} vs ${act.away.name}` : act.match}</div>
                    <div className={styles.actPred}>Predicción: {predictionLabel}</div>
                  </div>
                </div>
                <span
                  className={styles.actPoints}
                  style={{ color: accentColor }}
                >
                  {pointsLabel}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Archetype Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎯 Tu Arquetipo</h3>
        <motion.div
          className={styles.archetypeCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.archetypeContent}>
            <span className={styles.archetypeIcon}>
              {archetype === 'practico' ? '🎁' : archetype === 'acumulador' ? '📈' : '🏆'}
            </span>
            <div>
              <h4 className={styles.archetypeName}>
                {archetype === 'practico' ? 'Práctico' : archetype === 'acumulador' ? 'Acumulador' : 'Competidor'}
              </h4>
              <p className={styles.archetypeDesc}>
                {archetype === 'practico'
                  ? 'Prefieres utilidad inmediata, canje rápido y beneficios claros.'
                  : archetype === 'acumulador'
                  ? 'Prefieres progreso, metas y premios de mayor valor por acumulación.'
                  : 'Prefieres reconocimiento, posición y premios aspiracionales.'}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Prediction History */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>📋 Historial de Predicciones</h3>
        <motion.div
          className={styles.historyList}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {predictionHistory.length > 0 ? (
            predictionHistory.map((pred) => (
              <motion.div
                key={pred.id}
                className={styles.historyItem}
                variants={staggerItem}
              >
                <div className={styles.historyMatch}>
                  <span className={styles.historyFlag}>{pred.home.flag}</span>
                  <span>{pred.home.name} vs {pred.away.name}</span>
                  <span className={styles.historyFlag}>{pred.away.flag}</span>
                </div>
                <div className={styles.historyPred}>
                  Tu predicción: <strong>{pred.prediction === 'home' ? pred.home.name : pred.prediction === 'away' ? pred.away.name : 'Empate'}</strong>
                </div>
                <div className={styles.historyPoints}>+{pred.points} mAIis</div>
              </motion.div>
            ))
          ) : (
            <p className={styles.noHistory}>Aún no has hecho predicciones.</p>
          )}
        </motion.div>
      </section>

      {/* Menu Items */}
      <section className={styles.section}>
        <motion.div
          className={styles.menuList}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {[
            {
              icon: <Sun size={20} weight="bold" />,
              label: 'Tema de la app',
              value: theme === 'dark' ? 'Oscuro' : 'Claro',
              action: toggleTheme,
            },
            { icon: <Info size={20} weight="bold" />, label: 'Acerca de', action: () => setShowAboutModal(true) },
            {
              icon: <SignOut size={20} weight="bold" />,
              label: 'Cerrar Sesión',
              danger: true,
              action: handleLogout,
            },
          ].map((item, i) => (
            <motion.button
              key={i}
              className={`${styles.menuItem} ${item.danger ? styles.menuDanger : ''}`}
              variants={staggerItem}
              whileTap={{ scale: 0.98, x: 4 }}
              onClick={item.action}
            >
              <div className={styles.menuItemLeft}>
                <span className={styles.menuIcon}>{item.icon}</span>
                <div className={styles.menuLabelGroup}>
                  <span>{item.label}</span>
                  {item.value && <span className={styles.menuItemValue}>{item.value}</span>}
                </div>
              </div>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              >
                <CaretRight size={16} weight="bold" className={styles.menuChevron} />
              </motion.span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <Info size={24} weight="bold" style={{ color: 'var(--gold-primary)' }} />
                <h3 className={styles.modalTitle}>Acerca de AI Banks</h3>
                <motion.button className={styles.modalClose} onClick={() => setShowAboutModal(false)} whileTap={{ scale: 0.85 }}>
                  <X size={20} weight="bold" />
                </motion.button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.aboutHero}>
                  <span className={styles.aboutLogo}>⚽</span>
                  <h4 className={styles.aboutAppName}>AI Banks Ecuador</h4>
                  <span className={styles.aboutVersion}>Versión 1.0.0</span>
                </div>
                <div className={styles.infoRow}>
                  <Globe size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>¿Qué es AI Banks?</div>
                    <div className={styles.infoDesc}>Una plataforma de predicciones deportivas impulsada por inteligencia artificial para el Mundial FIFA 2026. Acumula puntos, sube de nivel y gana premios.</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Code size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Tecnología</div>
                    <div className={styles.infoDesc}>Construida con React, Vite, Supabase y modelos de machine learning para predicciones inteligentes.</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Heart size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Desarrollado por</div>
                    <div className={styles.infoDesc}>Equipo AI Banks — powered by Tata Consultancy Services (TCS).</div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <Envelope size={20} weight="bold" className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Contacto</div>
                    <div className={styles.infoDesc}>¿Preguntas o sugerencias? Escríbenos a soporte@aibanks.ec</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className={styles.footerBrand}>AI Banks Ecuador</span>
        <span className={styles.footerPowered}>powered by <strong>TCS</strong></span>
        <span className={styles.footerVersion}>v1.0.0</span>
      </motion.div>
    </div>
  );
}
