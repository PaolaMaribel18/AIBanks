import { motion } from 'framer-motion';
import {
  SignOut,
  Gear,
  ShieldCheck,
  Info,
} from '@phosphor-icons/react';
import CasinoCard from '../../components/CasinoCard/CasinoCard';
import { USER_PROFILE } from '../../data/mockData';
import styles from './Profile.module.css';

export default function Profile() {
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
        <h2 className={styles.title}>👤 Mi Perfil</h2>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.profileBg} />
        <div className={styles.profileContent}>
          <div className={styles.avatarWrap}>
            <span className={styles.avatar}>{USER_PROFILE.avatar}</span>
            <span className={styles.tierBadge}>👑</span>
          </div>
          <h3 className={styles.name}>{USER_PROFILE.name}</h3>
          <span className={styles.tier}>{USER_PROFILE.tier}</span>
          <div className={styles.pointsBig}>
            <span>🪙</span>
            <span className={styles.pointsNum}>{USER_PROFILE.points.toLocaleString()}</span>
            <span className={styles.ptsCurrency}>puntos</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <CasinoCard delay={0.15} glow>
          <div className={styles.statBox}>
            <div className={styles.ringWrap}>
              <svg viewBox="0 0 100 100" className={styles.ring}>
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="6"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 50 50)"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.5))' }}
                />
              </svg>
              <span className={styles.ringValue}>{accuracy}%</span>
            </div>
            <span className={styles.statBoxLabel}>Precisión</span>
          </div>
        </CasinoCard>

        <CasinoCard delay={0.2} glow>
          <div className={styles.statBox}>
            <span className={styles.statBigNum}>{USER_PROFILE.totalPredictions}</span>
            <span className={styles.statBoxLabel}>Predicciones</span>
            <div className={styles.statMini}>
              <span className={styles.statWin}>✅ {USER_PROFILE.correctPredictions}</span>
              <span className={styles.statLoss}>
                ❌ {USER_PROFILE.totalPredictions - USER_PROFILE.correctPredictions}
              </span>
            </div>
          </div>
        </CasinoCard>

        <CasinoCard delay={0.25} glow>
          <div className={styles.statBox}>
            <span className={styles.statBigNum}>#{USER_PROFILE.rank}</span>
            <span className={styles.statBoxLabel}>Ranking</span>
          </div>
        </CasinoCard>

        <CasinoCard delay={0.3} glow>
          <div className={styles.statBox}>
            <span className={styles.statBigNum}>{USER_PROFILE.streak} 🔥</span>
            <span className={styles.statBoxLabel}>Racha</span>
          </div>
        </CasinoCard>
      </div>

      {/* Achievements */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🏅 Logros</h3>
        <div className={styles.achievements}>
          {USER_PROFILE.achievements.map((ach, i) => (
            <motion.div
              key={ach.id}
              className={`${styles.achBadge} ${!ach.unlocked ? styles.achLocked : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              whileTap={{ scale: 0.92 }}
            >
              <span className={styles.achIcon}>{ach.icon}</span>
              <span className={styles.achName}>{ach.name}</span>
              {!ach.unlocked && <span className={styles.achLock}>🔒</span>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 Actividad Reciente</h3>
        <div className={styles.activity}>
          {USER_PROFILE.recentActivity.map((act, i) => (
            <motion.div
              key={i}
              className={styles.actItem}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
            >
              <div className={styles.actLeft}>
                <span
                  className={styles.actDot}
                  style={{
                    background: act.result === 'win' ? '#00e676' : '#ff1744',
                    boxShadow:
                      act.result === 'win'
                        ? '0 0 8px rgba(0,230,118,0.5)'
                        : '0 0 8px rgba(255,23,68,0.5)',
                  }}
                />
                <div>
                  <div className={styles.actMatch}>{act.match}</div>
                  <div className={styles.actPred}>Predicción: {act.prediction}</div>
                </div>
              </div>
              <span
                className={styles.actPoints}
                style={{ color: act.result === 'win' ? '#00e676' : '#ff1744' }}
              >
                {act.points}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Menu Items */}
      <section className={styles.section}>
        <div className={styles.menuList}>
          {[
            { icon: <Gear size={20} weight="bold" />, label: 'Configuración' },
            { icon: <ShieldCheck size={20} weight="bold" />, label: 'Seguridad' },
            { icon: <Info size={20} weight="bold" />, label: 'Acerca de' },
            {
              icon: <SignOut size={20} weight="bold" />,
              label: 'Cerrar Sesión',
              danger: true,
            },
          ].map((item, i) => (
            <motion.button
              key={i}
              className={`${styles.menuItem} ${item.danger ? styles.menuDanger : ''}`}
              whileTap={{ scale: 0.97 }}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.footerBrand}>AI Banks Ecuador</span>
        <span className={styles.footerPowered}>powered by <strong>TCS</strong></span>
        <span className={styles.footerVersion}>v1.0.0</span>
      </div>
    </div>
  );
}
