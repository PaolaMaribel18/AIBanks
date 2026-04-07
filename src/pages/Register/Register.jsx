import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import GlowButton from '../../components/GlowButton/GlowButton';
import useGameSounds from '../../hooks/useGameSounds';
import styles from './Register.module.css';

export default function Register() {
  const navigate = useNavigate();
  const { register, clearError } = useAuth();
  const { playSuccess, playError } = useGameSounds();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      const result = await register(formData.email, formData.password, formData.name);
      playSuccess();

      if (result.requiresEmailConfirmation) {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Revisa tu correo y confirma tu cuenta antes de iniciar sesión.',
          },
        });
      }
      // Navigation will be handled by AppContent when a session exists
    } catch (err) {
      playError();
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <motion.div
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
          <h1 className={styles.title}>Registrarse</h1>
          <UserPlus size={32} weight="bold" className={styles.registerIcon} />
        </motion.div>
        <motion.form
          className={styles.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
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
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
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
            {loading ? 'Cargando...' : 'Registrarse'}
          </GlowButton>
        </motion.form>
        <motion.p
          className={styles.loginLink}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            className={styles.link}
            onClick={() => {
              clearError();
              navigate('/login');
            }}
          >
            Inicia Sesión
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}