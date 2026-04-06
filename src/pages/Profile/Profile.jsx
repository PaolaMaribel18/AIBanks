import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SignOut,
  Gear,
  ShieldCheck,
  Info,
  CaretRight,
  Sun,
  Crown,
  Fire,
  Coin,
} from '@phosphor-icons/react';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { USER_PROFILE, UPCOMING_MATCHES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [predictions, setPredictions] = useState({});
  const archetype = localStorage.getItem('archetype') || 'moderado';

  useEffect(() => {
    const stored = localStorage.getItem('predictions');
    if (stored) {
      setPredictions(JSON.parse(stored));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const predictionHistory = Object.entries(predictions).map(([matchId, choice]) => {
    const match = UPCOMING_MATCHES.find(m => m.id === parseInt(matchId));
    return match ? { ...match, prediction: choice } : null;
  }).filter(Boolean);

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
        <h2 className={styles.title}>Mi Perfil</h2>
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
            <h3 className={styles.name}>{USER_PROFILE.name}</h3>
            <motion.span
              className={styles.tier}
              animate={{ boxShadow: ['0 0 0 rgba(255,215,0,0)', '0 0 12px rgba(255,215,0,0.3)', '0 0 0 rgba(255,215,0,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {USER_PROFILE.tier}
            </motion.span>
          </div>
          <div className={styles.pointsBig}>
            <Coin size={24} weight="bold" />
            <AnimatedCounter
              value={USER_PROFILE.points.toLocaleString()}
              className={styles.pointsNum}
            />
            <span className={styles.ptsCurrency}>puntos</span>
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
            <span className={styles.statBigNum}>{USER_PROFILE.totalPredictions}</span>
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
            <AnimatedCounter value={`#${USER_PROFILE.rank}`} className={styles.statBigNum} />
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
          {USER_PROFILE.achievements.map((ach) => (
            <motion.div
              key={ach.id}
              className={`${styles.achBadge} ${!ach.unlocked ? styles.achLocked : ''}`}
              variants={staggerItem}
              whileTap={{ scale: 0.92, rotate: ach.unlocked ? [0, -3, 3, 0] : 0 }}
            >
              <motion.span
                className={styles.achIcon}
                animate={ach.unlocked ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
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
          {USER_PROFILE.recentActivity.map((act, i) => (
            <motion.div
              key={i}
              className={styles.actItem}
              variants={staggerItem}
            >
              <div className={styles.actLeft}>
                <motion.span
                  className={styles.actDot}
                  style={{
                    background: act.result === 'win' ? (theme === 'dark' ? '#00e676' : '#28a745') : (theme === 'dark' ? '#ff1744' : '#dc3545'),
                  }}
                  animate={{
                    boxShadow: act.result === 'win'
                      ? ['0 0 0 rgba(0,230,118,0)', '0 0 10px rgba(0,230,118,0.5)', '0 0 0 rgba(0,230,118,0)']
                      : ['0 0 0 rgba(255,23,68,0)', '0 0 10px rgba(255,23,68,0.5)', '0 0 0 rgba(255,23,68,0)'],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div>
                  <div className={styles.actMatch}>{act.match}</div>
                  <div className={styles.actPred}>Predicción: {act.prediction}</div>
                </div>
              </div>
              <span
                className={styles.actPoints}
                style={{ color: act.result === 'win' ? (theme === 'dark' ? '#00e676' : '#28a745') : (theme === 'dark' ? '#ff1744' : '#dc3545') }}
              >
                {act.points}
              </span>
            </motion.div>
          ))}
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
              {archetype === 'conservador' ? '🛡️' : archetype === 'moderado' ? '⚖️' : '🎰'}
            </span>
            <div>
              <h4 className={styles.archetypeName}>
                {archetype === 'conservador' ? 'Conservador' : archetype === 'moderado' ? 'Moderado' : 'Arriesgado'}
              </h4>
              <p className={styles.archetypeDesc}>
                {archetype === 'conservador'
                  ? 'Prefieres premios seguros y estables.'
                  : archetype === 'moderado'
                  ? 'Buscas un equilibrio entre riesgo y recompensa.'
                  : 'Te gustan los premios emocionantes y de alto valor.'}
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
                <div className={styles.historyPoints}>+{pred.points} pts</div>
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
            { icon: <Gear size={20} weight="bold" />, label: 'Configuración' },
            { icon: <ShieldCheck size={20} weight="bold" />, label: 'Seguridad' },
            { icon: <Info size={20} weight="bold" />, label: 'Acerca de' },
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
