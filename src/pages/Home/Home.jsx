import { motion } from 'framer-motion';
import { Lightning, TrendUp, Fire, Trophy, ArrowRight } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import CasinoCard from '../../components/CasinoCard/CasinoCard';
import GlowButton from '../../components/GlowButton/GlowButton';
import MatchCard from '../../components/MatchCard/MatchCard';
import { UPCOMING_MATCHES, USER_PROFILE } from '../../data/mockData';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();
  const hotMatches = UPCOMING_MATCHES.filter((m) => m.hot).slice(0, 2);

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.heroParticles}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
            />
          ))}
        </div>

        <motion.div
          className={styles.heroContent}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={styles.worldcupBadge}>
            <span>⚽</span> MUNDIAL 2026
          </div>
          <h2 className={styles.heroTitle}>
            ¡Predice y<br />
            <span className={styles.goldText}>Gana Premios!</span>
          </h2>
          <p className={styles.heroSub}>
            Haz tus predicciones y acumula puntos canjeables por premios increíbles
          </p>
          <GlowButton
            onClick={() => navigate('/predictions')}
            icon={<Lightning weight="fill" />}
            size="lg"
          >
            Empezar a Predecir
          </GlowButton>
        </motion.div>

        <div className={styles.heroBg} />
      </motion.section>

      {/* Quick Stats */}
      <section className={styles.stats}>
        {[
          { icon: <Fire weight="fill" />, label: 'Racha', value: `${USER_PROFILE.streak} 🔥`, color: '#ff6b35' },
          { icon: <TrendUp weight="fill" />, label: 'Aciertos', value: `${USER_PROFILE.winRate}%`, color: '#00e676' },
          { icon: <Trophy weight="fill" />, label: 'Ranking', value: `#${USER_PROFILE.rank}`, color: '#ffd700' },
        ].map((stat, i) => (
          <CasinoCard key={i} delay={0.1 * i} glow>
            <div className={styles.statContent}>
              <span className={styles.statIcon} style={{ color: stat.color }}>
                {stat.icon}
              </span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </CasinoCard>
        ))}
      </section>

      {/* Jackpot Banner */}
      <motion.section
        className={styles.jackpot}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.jackpotInner}>
          <div className={styles.jackpotLeft}>
            <span className={styles.jackpotIcon}>🎰</span>
            <div>
              <div className={styles.jackpotLabel}>BONO DIARIO</div>
              <div className={styles.jackpotValue}>+50 puntos</div>
            </div>
          </div>
          <GlowButton variant="green" size="sm" onClick={() => {}}>
            Reclamar
          </GlowButton>
        </div>
      </motion.section>

      {/* Hot Matches */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Fire weight="fill" className={styles.fireIcon} /> Partidos 🔥
          </h3>
          <button className={styles.seeAll} onClick={() => navigate('/predictions')}>
            Ver todos <ArrowRight size={14} weight="bold" />
          </button>
        </div>
        <div className={styles.matchList}>
          {hotMatches.map((match, i) => (
            <MatchCard key={match.id} match={match} delay={0.1 * i} />
          ))}
        </div>
      </section>

      {/* Promotions */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>🎁 Promociones</h3>
        <div className={styles.promoGrid}>
          {[
            {
              title: 'Doble Puntos',
              desc: 'Duplica tus puntos en partidos de Ecuador',
              icon: '✨',
              gradient: 'linear-gradient(135deg, #1a1a2e, #2d1b69)',
              border: 'rgba(213, 0, 249, 0.2)',
            },
            {
              title: 'Refiere y Gana',
              desc: 'Invita amigos y gana 500 puntos cada uno',
              icon: '🤝',
              gradient: 'linear-gradient(135deg, #1a1a2e, #1b3a2d)',
              border: 'rgba(0, 230, 118, 0.2)',
            },
          ].map((promo, i) => (
            <motion.div
              key={i}
              className={styles.promoCard}
              style={{ background: promo.gradient, borderColor: promo.border }}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className={styles.promoIcon}>{promo.icon}</span>
              <h4 className={styles.promoTitle}>{promo.title}</h4>
              <p className={styles.promoDesc}>{promo.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TCS Powered */}
      <div className={styles.powered}>
        <span>powered by</span>
        <strong>TCS</strong>
        <span className={styles.tcsLabel}>Tata Consultancy Services</span>
      </div>
    </div>
  );
}
