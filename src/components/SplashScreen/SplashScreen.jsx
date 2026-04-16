import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import FootballMeteors from '../FootballMeteors/FootballMeteors';
import useGameSounds, { unlockAudio } from '../../hooks/useGameSounds';
import { useTranslation } from '../../i18n';

const POWERED_BY_DURATION = 2200; // ms to show "powered by TCS"

function PoweredByScreen({ onTap }) {
  const { t } = useTranslation();
  return (
    <motion.div
      key="powered-by"
      className="fixed inset-0 flex flex-col items-center justify-center z-9999 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6 }}
      onClick={onTap}
      onTouchStart={onTap}
    >
      {/* Subtle radial pulse */}
      <motion.div
        className="absolute"
        style={{
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,100,182,0.12) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* "powered by" label */}
      <motion.p
        className="text-xs font-light tracking-[0.25em] uppercase mb-4"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        powered by
      </motion.p>

      {/* TCS Logo / Name */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      >
        <span
          className="text-4xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #0064B6, #00A3E0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          TCS
        </span>
        <motion.span
          className="text-sm font-medium tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          Tata Consultancy Services
        </motion.span>
      </motion.div>

      {/* Subtle decorative line */}
      <motion.div
        className="mt-6 h-[2px] rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, #0064B6, #00A3E0, transparent)' }}
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
      />

      {/* Tap hint */}
      <motion.p
        className="absolute bottom-12 text-xs tracking-[0.15em] uppercase"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0.3, 0.6] }}
        transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
      >
        {t('splash.tapToStart')}
      </motion.p>
    </motion.div>
  );
}

export default function SplashScreen() {
  const { t } = useTranslation();
  const { playSwoosh, playCoin, playElegant } = useGameSounds();
  const [phase, setPhase] = useState('powered'); // 'powered' | 'main'
  const [tapped, setTapped] = useState(false);

  // Auto-advance after timeout
  useEffect(() => {
    const timer = setTimeout(() => setPhase('main'), POWERED_BY_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // Try to play elegant sound on mount (works if audio already unlocked)
  useEffect(() => {
    const snd = setTimeout(() => playElegant(), 400);
    return () => clearTimeout(snd);
  }, [playElegant]);

  // When user taps the TCS screen: unlock audio, play sound, advance
  const handleTap = useCallback(() => {
    if (tapped) return;
    setTapped(true);
    unlockAudio();
    // Small delay so context has time to resume
    setTimeout(() => {
      playElegant();
      setTimeout(() => setPhase('main'), 600);
    }, 50);
  }, [tapped, playElegant]);

  useEffect(() => {
    if (phase === 'main') {
      const t1 = setTimeout(() => playSwoosh(), 300);
      const t2 = setTimeout(() => playCoin(), 800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [phase, playSwoosh, playCoin]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'powered' ? (
        <PoweredByScreen onTap={handleTap} />
      ) : (
        <motion.div
          key="main-splash"
          className="fixed inset-0 flex items-center justify-center z-9999 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary), var(--bg-surface))',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(90deg, var(--accent-blue) 1px, transparent 1px),
                linear-gradient(0deg, var(--accent-blue) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Football meteors / comets */}
          <FootballMeteors count={10} />

          {/* Floating elements - Top left */}
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 border-2 rounded-lg opacity-20"
            style={{ borderColor: 'var(--accent-blue)' }}
            animate={{
              rotate: 360,
              y: [0, 20, 0],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          />

          {/* Floating elements - Bottom right */}
          <motion.div
            className="absolute bottom-20 right-20 w-40 h-40 border-2 rounded-3xl opacity-15"
            style={{ borderColor: 'var(--gold-primary)' }}
            animate={{
              rotate: -360,
              y: [0, -25, 0],
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
              y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
            }}
          />

          {/* Center content */}
          <motion.div
            className="relative z-10 text-center max-w-lg px-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Animated circle background */}
            <motion.div
              className="absolute -inset-20 rounded-full opacity-0"
              style={{
                background: 'radial-gradient(circle, var(--gold-primary), transparent)',
              }}
              animate={{
                opacity: [0, 0.05, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Logo with modern design */}
            <motion.div
              className="relative mb-12"
              variants={itemVariants}
            >
              <motion.div
                className="inline-block"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="w-28 h-28 flex items-center justify-center text-6xl font-black rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-light))',
                    boxShadow: '0 20px 60px rgba(255, 215, 0, 0.15)',
                  }}
                >
                  🏦
                </div>
              </motion.div>

              {/* Decorative circles around logo */}
              <motion.div
                className="absolute -inset-8 border border-dashed opacity-30"
                style={{ borderColor: 'var(--gold-primary)' }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <motion.div
                className="absolute -inset-14 border border-dotted opacity-20"
                style={{ borderColor: 'var(--accent-blue)' }}
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-6xl font-black mb-3 tracking-tight"
              style={{
                background: 'linear-gradient(90deg, var(--gold-primary), var(--gold-light), var(--gold-primary))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              variants={itemVariants}
            >
              AI Bank
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg font-light tracking-widest uppercase mb-8"
              style={{ color: 'var(--text-secondary)' }}
              variants={itemVariants}
            >
              {t('splash.subtitle')}
            </motion.p>

            {/* Modern loading bar */}
            <motion.div
              className="mb-8 h-1 bg-gradient-to-r from-transparent via-gold-primary to-transparent overflow-hidden rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--gold-primary), var(--gold-light), transparent)',
              }}
              variants={itemVariants}
            >
              <motion.div
                className="h-full w-full"
                style={{
                  background: 'linear-gradient(90deg, var(--gold-primary), var(--gold-light))',
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            {/* Status text */}
            <motion.p
              className="text-sm font-light"
              style={{ color: 'var(--text-muted)' }}
              variants={itemVariants}
            >
              {t('splash.loadingExperience')}
            </motion.p>
          </motion.div>

          {/* Corner accent lines */}
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 opacity-20"
            style={{ borderColor: 'var(--gold-primary)' }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 opacity-20"
            style={{ borderColor: 'var(--accent-blue)' }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}