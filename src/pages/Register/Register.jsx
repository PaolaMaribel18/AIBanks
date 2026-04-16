import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContextBase';
import GlowButton from '../../components/GlowButton/GlowButton';
import useGameSounds from '../../hooks/useGameSounds';
import { useTranslation } from '../../i18n';
import styles from './Register.module.css';

export default function Register() {
  const navigate = useNavigate();
  const { register, clearError } = useAuth();
  const { playSuccess, playError } = useGameSounds();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptDataPolicy: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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
        throw new Error(t('register.passwordsMismatch'));
      }

      if (!formData.acceptTerms || !formData.acceptDataPolicy) {
        throw new Error(t('register.mustAcceptTerms'));
      }


      const result = await register(formData.email, formData.password, formData.name);
      playSuccess();

      if (result.requiresEmailConfirmation) {
        navigate('/login', {
          replace: true,
          state: {
            message: t('register.confirmEmail'),
          },
        });
      }
      // Navigation will be handled by AppContent when a session exists
    } catch (err) {
      playError();
      setError(err.message || t('register.errorDefault'));
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
          <h1 className={styles.title}>{t('register.title')}</h1>
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
            <label htmlFor="name" className={styles.label}>{t('register.fullName')}</label>
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
            <label htmlFor="email" className={styles.label}>{t('register.email')}</label>
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
            <label htmlFor="password" className={styles.label}>{t('register.password')}</label>
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
            <label htmlFor="confirmPassword" className={styles.label}>{t('register.confirmPassword')}</label>
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

          <div className={styles.legalCheckboxes}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <label htmlFor="acceptTerms" className={styles.checkboxLabel}>
                {t('register.acceptTerms')} <button type="button" className={styles.inlineLink}>{t('register.termsAndConditions')}</button>
              </label>
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="acceptDataPolicy"
                name="acceptDataPolicy"
                checked={formData.acceptDataPolicy}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <label htmlFor="acceptDataPolicy" className={styles.checkboxLabel}>
                {t('register.acceptDataPolicy')} <button type="button" className={styles.inlineLink}>{t('register.dataProtectionLaw')}</button>
              </label>
            </div>
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
            {loading ? t('common.loading') : t('register.submit')}
          </GlowButton>
        </motion.form>
        <motion.p
          className={styles.loginLink}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {t('register.hasAccount')}{' '}
          <button
            type="button"
            className={styles.link}
            onClick={() => {
              clearError();
              navigate('/login');
            }}
          >
            {t('register.loginLink')}
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}