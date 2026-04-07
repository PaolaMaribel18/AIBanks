import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignIn } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GlowButton from '../../components/GlowButton/GlowButton';
import useGameSounds from '../../hooks/useGameSounds';
import styles from './Login.module.css';

import aguilaImg from '../../assets/images/aguila.drawio.png';
import jaguarImg from '../../assets/images/jaguar.drawio.png';
import alceImg from '../../assets/images/alce.drawio.png';
import backgroundLoginImg from '../../assets/images/backgroundlogin.png';

const INTRO_DURATION = 3400; // ms

function MascotIntro({ onComplete }) {
  const { playWhoosh, playBell } = useGameSounds();

  useEffect(() => {
    // Whoosh for each mascot crossing
    const w1 = setTimeout(() => playWhoosh(), 200);  // alce
    const w2 = setTimeout(() => playWhoosh(), 1000); // jaguar
    const w3 = setTimeout(() => playWhoosh(), 1800); // águila
    // Bell when it's time to log in
    const bell = setTimeout(() => playBell(), INTRO_DURATION - 400);
    const t = setTimeout(onComplete, INTRO_DURATION);
    return () => {
      clearTimeout(w1); clearTimeout(w2); clearTimeout(w3);
      clearTimeout(bell); clearTimeout(t);
    };
  }, [onComplete, playWhoosh, playBell]);

  // Each mascot crosses the screen one after another
  // Alce: right → left, Jaguar: left → right, Águila: top → bottom
  const mascots = [
    {
      src: alceImg,
      alt: 'Mascot 1',
      delay: 0.2,
      initial: { x: '100vw', opacity: 0 },
      animate: { x: [null, '0vw', '-100vw'], opacity: [0, 1, 0] },
      transition: { duration: 0.9, times: [0, 0.4, 1], ease: 'easeInOut' },
    },
    {
      src: jaguarImg,
      alt: 'Mascot 2',
      delay: 1.0,
      initial: { x: '-100vw', opacity: 0 },
      animate: { x: [null, '0vw', '100vw'], opacity: [0, 1, 0] },
      transition: { duration: 0.9, times: [0, 0.4, 1], ease: 'easeInOut' },
    },
    {
      src: aguilaImg,
      alt: 'Mascot 3',
      delay: 1.8,
      initial: { y: '-100vh', opacity: 0 },
      animate: { y: [null, '0vh', '100vh'], opacity: [0, 1, 0] },
      transition: { duration: 0.9, times: [0, 0.4, 1], ease: 'easeInOut' },
    },
  ];

  return (
    <motion.div
      className={styles.introOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className={styles.introTitle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        FIFA World Cup 2026™
      </motion.h2>

      {mascots.map((m, i) => (
        <motion.div
          key={i}
          className={styles.mascotCross}
          initial={m.initial}
          animate={m.animate}
          transition={{ ...m.transition, delay: m.delay }}
        >
          <div className={styles.mascotGlow} />
          <img
            src={m.src}
            alt={m.alt}
            className={styles.mascotImg}
          />
        </motion.div>
      ))}

      <motion.p
        className={styles.introSubtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Las mascotas oficiales te dan la bienvenida
      </motion.p>
    </motion.div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearError } = useAuth();
  const { theme } = useTheme();
  const { playLoginLong, playError, playClick } = useGameSounds();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(location.state?.message || null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setInfoMessage(null);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      playLoginLong();
      // Navigation will be handled by AppContent
    } catch (err) {
      playError();
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background image */}
      <div className={`${styles.bgImageWrap} ${theme === 'light' ? styles.bgLight : styles.bgDark}`}>
        <img
          src={backgroundLoginImg}
          alt=""
          className={styles.bgImage}
        />
      </div>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <MascotIntro key="intro" onComplete={() => setShowIntro(false)} />
        ) : (
          <motion.div
            key="login-form"
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className={styles.titleContainer}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className={styles.title}>Iniciar Sesión</h1>
              <SignIn size={32} weight="bold" className={styles.loginIcon} />
            </motion.div>
            <motion.form
              className={styles.form}
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
              {infoMessage && (
                <motion.div
                  className={styles.errorMessage}
                  style={{
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#d1fae5',
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {infoMessage}
                </motion.div>
              )}
              {error && (
                <motion.div
                  className={styles.errorMessage}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
              <GlowButton type="submit" variant="gold" fullWidth disabled={loading}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </GlowButton>
            </motion.form>
            <motion.p
              className={styles.registerLink}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className={styles.link}
                onClick={() => {
                  clearError();
                  navigate('/register');
                }}
              >
                Regístrate
              </button>
            </motion.p>

            {/* Powered by TCS */}
            <motion.div
              className={styles.poweredBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <span className={styles.poweredLabel}>powered by</span>
              <span className={styles.poweredTCS}>TCS</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}