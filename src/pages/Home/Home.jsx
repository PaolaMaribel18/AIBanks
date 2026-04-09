import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PaperPlaneRight, Receipt, CreditCard, Bank, CaretRight, X, Trophy, SpinnerGap } from '@phosphor-icons/react';
import Confetti from 'react-confetti';
import { useMAIis } from '../../hooks/useMAIis';
import { useAuth } from '../../context/AuthContextBase';
import { useNotifications } from '../../context/NotificationContextBase';
import { supabase } from '../../services/supabaseClient';
import { sendSenderEmail, sendRecipientEmail } from '../../services/emailService';
import styles from './Home.module.css';

function TransactionModal({ isOpen, onClose, onSuccess, currentUser }) {
  const [amount, setAmount] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const { sendTransferNotification } = useNotifications();

  // Cargar usuarios registrados al abrir el modal
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError('');
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .neq('id', currentUser.id);

        if (fetchError) throw fetchError;
        setUsers(data || []);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
        setError('No se pudieron cargar los destinatarios.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, currentUser?.id]);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setSelectedUserId('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !selectedUserId || isProcessing) return;

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 1. Verificar saldo del remitente
      const { data: senderProfile, error: senderError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', currentUser.id)
        .single();

      if (senderError) throw senderError;

      const currentBalance = parseFloat(senderProfile.balance);
      if (currentBalance < transferAmount) {
        setError(`Saldo insuficiente. Tu saldo es $${currentBalance.toFixed(2)}`);
        setIsProcessing(false);
        return;
      }

      // 2. Restar del remitente
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ balance: currentBalance - transferAmount })
        .eq('id', currentUser.id);

      if (deductError) throw deductError;

      // 3. Sumar al destinatario
      const { data: recipientProfile, error: recipientFetchError } = await supabase
        .from('profiles')
        .select('balance, name, email')
        .eq('id', selectedUserId)
        .single();

      if (recipientFetchError) throw recipientFetchError;

      const recipientBalance = parseFloat(recipientProfile.balance);
      const { error: addError } = await supabase
        .from('profiles')
        .update({ balance: recipientBalance + transferAmount })
        .eq('id', selectedUserId);

      if (addError) throw addError;

      // 4. Enviar notificación in-app al destinatario
      await sendTransferNotification(selectedUserId, {
        fromName: currentUser.name,
        amount: transferAmount,
      });

      // 5. Enviar emails (non-blocking, no falla la transferencia si falla el email)
      const earnedMAIles = 250;
      sendSenderEmail({
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        recipientName: recipientProfile.name,
        amount: transferAmount,
        earnedMAIles,
      });
      sendRecipientEmail({
        recipientName: recipientProfile.name,
        recipientEmail: recipientProfile.email,
        senderName: currentUser.name,
        amount: transferAmount,
      });

      // 6. Éxito
      setIsProcessing(false);
      onSuccess(earnedMAIles, currentBalance - transferAmount);
    } catch (err) {
      console.error('Error en transferencia:', err);
      setError('Ocurrió un error al procesar la transferencia.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId);

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
          <p className={styles.modalDesc}>Transfiere a otros usuarios de AIBank.</p>

          {error && (
            <div className={styles.errorBanner}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Destinatario</label>
              {loadingUsers ? (
                <div className={styles.loadingUsers}>
                  <SpinnerGap size={20} className={styles.spinner} />
                  <span>Cargando usuarios...</span>
                </div>
              ) : users.length === 0 ? (
                <div className={styles.noUsers}>No hay otros usuarios registrados.</div>
              ) : (
                <select
                  className={styles.userSelect}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isProcessing}
                >
                  <option value="">Selecciona un destinatario</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedUser && (
              <div className={styles.selectedUserCard}>
                <div className={styles.selectedUserAvatar}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={styles.selectedUserName}>{selectedUser.name}</div>
                  <div className={styles.selectedUserEmail}>{selectedUser.email}</div>
                </div>
              </div>
            )}

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
              disabled={isProcessing || !amount || !selectedUserId}
            >
              {isProcessing ? (
                <span className={styles.processingBtn}>
                  <SpinnerGap size={18} className={styles.spinner} />
                  Procesando...
                </span>
              ) : (
                'Transferir'
              )}
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
  const { user } = useAuth();
  const { currentMAIis, addBankMAIis } = useMAIis();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [balance, setBalance] = useState(null);

  // Cargar saldo real desde Supabase
  const fetchBalance = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setBalance(parseFloat(data.balance));
      }
    } catch (err) {
      console.error('Error cargando saldo:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    const hasSeen = localStorage.getItem('aiFeatureDismissed_v2');
    if (!hasSeen) {
      const timer = setTimeout(() => setShowFeaturePopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTransactionSuccess = (earnedPts, newBalance) => {
    setIsModalOpen(false);
    addBankMAIis(earnedPts);
    setSuccessMessage(earnedPts);
    if (newBalance !== undefined) {
      setBalance(newBalance);
    }
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setSuccessMessage('');
    }, 5000);
  };

  // Formatear saldo para display
  const displayBalance = balance !== null ? balance.toFixed(2) : '4,250.00';
  const [intPart, decPart] = displayBalance.split('.');
  const formattedInt = balance !== null
    ? parseInt(intPart).toLocaleString()
    : '4,250';

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
            <span className={styles.amount}>{formattedInt}</span>
            <span className={styles.decimals}>.{decPart || '00'}</span>
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
        currentUser={user}
      />
      <FeatureAnnouncementModal
        isOpen={showFeaturePopup}
        onClose={() => setShowFeaturePopup(false)}
      />
    </div>
  );
}

