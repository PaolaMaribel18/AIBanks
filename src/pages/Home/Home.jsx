import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PaperPlaneRight, Receipt, CreditCard, Bank, CaretRight, X, Trophy } from '@phosphor-icons/react';
import Confetti from 'react-confetti';
import { useMAIis } from '../../hooks/useMAIis';
import styles from './Home.module.css';

function TransactionModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !account) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(250); // Misión paga 250 mAIles
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          <h2 className={styles.modalTitle}>Nueva Transferencia</h2>
          <p className={styles.modalDesc}>Transfiere a otras cuentas desde tu App AIBank.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Cuenta Destino</label>
              <input
                type="text"
                placeholder="Ej. 2200334455"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Monto ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
                min="0.01"
                step="0.01"
              />
            </div>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isProcessing || !amount || !account}
            >
              {isProcessing ? 'Procesando...' : 'Transferir'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function FeatureAnnouncementModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleClose = () => {
    localStorage.setItem('aiFeatureDismissed_v2', 'true');
    onClose();
  };

  const handlePlayNow = () => {
    localStorage.setItem('aiFeatureDismissed_v2', 'true');
    navigate('/season');
  };

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          style={{ background: 'linear-gradient(135deg, #1a1a2e, #3a1c71)', border: '1px solid rgba(213,0,249,0.3)', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={handleClose}><X size={20} /></button>
          <div style={{ background: 'rgba(213,0,249,0.2)', padding: '16px', borderRadius: '50%', color: '#d500f9', display: 'inline-flex', marginBottom: '16px' }}>
            <Trophy size={40} weight="fill" />
          </div>
          <h2 className={styles.modalTitle} style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '12px' }}>Nueva Función IA Activada</h2>
          <p className={styles.modalDesc} style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
            Tu AIBank App ahora incluye predicciones deportivas impulsadas por Inteligencia Artificial. <br /><br />
            Desafía los pronósticos y gana mAIles canjeables.
          </p>
          <button
            onClick={handlePlayNow}
            style={{ background: '#d500f9', color: 'white', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%', marginTop: '16px', fontSize: '1rem', boxShadow: '0 4px 15px rgba(213,0,249,0.4)' }}
          >
            Jugar Ahora
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { currentMAIis, addBankMAIis } = useMAIis();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('aiFeatureDismissed_v2');
    if (!hasSeen) {
      const timer = setTimeout(() => setShowFeaturePopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTransactionSuccess = (earnedPts) => {
    setIsModalOpen(false);
    addBankMAIis(earnedPts);
    setSuccessMessage(earnedPts);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <div className={styles.dashboardContainer}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      {/* Saludo */}
      <header className={styles.header}>
        <h1 className={styles.greeting}>Mis Finanzas</h1>
        <p className={styles.subtitle}>AIBank Móvil</p>
      </header>

      {/* Cuentas y Tarjetas - Scroll Horizontal */}
      <section className={styles.accountsScroll}>
        <motion.div
          className={styles.accountCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.accountType}>Cuenta de Ahorros</span>
            <span className={styles.accountNumber}>**** 8901</span>
          </div>
          <div className={styles.cardBalance}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>4,250</span>
            <span className={styles.decimals}>.00</span>
          </div>
        </motion.div>

        <motion.div
          className={`${styles.accountCard} ${styles.creditCard}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.accountType}>Tarjeta de Crédito</span>
            <span className={styles.accountNumber}>**** 4567</span>
          </div>
          <div className={styles.cardBalance}>
            <span className={styles.label}>Cupo Disponible</span>
            <div>
              <span className={styles.currency}>$</span>
              <span className={styles.amount}>1,850</span>
              <span className={styles.decimals}>.50</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Acciones Rápidas (Widget) */}
      <section className={styles.quickActionsSection}>
        <div className={styles.actionsGrid}>
          <button className={styles.actionBtn} onClick={() => setIsModalOpen(true)}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
              <PaperPlaneRight size={24} weight="fill" />
            </div>
            <span>Transferir</span>
          </button>
          <button className={styles.actionBtn}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
              <Receipt size={24} weight="fill" />
            </div>
            <span>Servicios</span>
          </button>
          <button className={styles.actionBtn}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48' }}>
              <CreditCard size={24} weight="fill" />
            </div>
            <span>Tarjetas</span>
          </button>
          <button className={styles.actionBtn}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <Bank size={24} weight="fill" />
            </div>
            <span>Mi Banco</span>
          </button>
        </div>
      </section>

      <h3 className={styles.sectionTitle}>Beneficios y Misiones</h3>

      {/* Banner Temporada Mundial */}
      <motion.section
        className={styles.seasonBanner}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/season')}
        whileTap={{ scale: 0.98 }}
      >
        <div className={styles.bannerContent}>
          <div className={styles.bannerTitles}>
            <span className={styles.seasonTag}>MÓDULO EXCLUSIVO</span>
            <h3 className={styles.bannerTitle}>Temporada Mundial 2026</h3>
            <p className={styles.bannerDesc}>Tienes <strong>{currentMAIis} mAIles</strong> disponibles.</p>
          </div>
          <div className={styles.bannerIcon}>
            <Trophy size={32} weight="fill" />
            <CaretRight size={20} weight="bold" />
          </div>
        </div>
      </motion.section>

      {/* Misiones de Fidelización (Scroll Horizontal) */}
      <section className={styles.missionsScroll}>
        <div className={styles.missionCard}>
          <div className={styles.missionInfo}>
            <h4>Usa tu Tarjeta</h4>
            <p>Haz una transferencia con tarjeta hoy mismo.</p>
            <span className={styles.missionReward}>+250 mAIles</span>
          </div>
          <button className={styles.missionActionBtn} onClick={() => setIsModalOpen(true)}>
            Completar
          </button>
        </div>
        <div className={styles.missionCard}>
          <div className={styles.missionInfo}>
            <h4>Meta de Ahorro</h4>
            <p>Inicia un plan de ahorro Mundial.</p>
            <span className={styles.missionReward}>+500 mAIles</span>
          </div>
          <button className={styles.missionActionBtn} onClick={() => handleTransactionSuccess(500)}>
            Simular
          </button>
        </div>
        <div className={styles.missionCard}>
          <div className={styles.missionInfo}>
            <h4>Actualizar Datos</h4>
            <p>Confirma tus datos de contacto.</p>
            <span className={styles.missionReward}>+100 mAIles</span>
          </div>
          <button className={styles.missionActionBtn} onClick={() => handleTransactionSuccess(100)}>
            Actualizar
          </button>
        </div>
      </section>

      {/* Floating Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className={styles.floatingToast}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Trophy size={24} weight="fill" color="var(--gold-primary)" />
            <span className={styles.toastText}>¡Misión Completada! <strong>+{successMessage} mAIles</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
      <FeatureAnnouncementModal
        isOpen={showFeaturePopup}
        onClose={() => setShowFeaturePopup(false)}
      />
    </div>
  );
}
