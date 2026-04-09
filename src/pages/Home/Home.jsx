import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PaperPlaneRight, Receipt, CreditCard, Bank, CaretRight, X, Trophy, 
  SpinnerGap, QrCode, HandCoins, Sparkle, WifiHigh, Lightning, Drop, 
  Television, Eye, EyeSlash, Lock, ShieldCheck, Coffee, MapPin, 
  ChatCircleDots, CheckCircle 
} from '@phosphor-icons/react';
import Confetti from 'react-confetti';
import { useMAIis } from '../../hooks/useMAIis';
import { useAuth } from '../../context/AuthContextBase';
import { useNotifications } from '../../context/NotificationContextBase';
import { supabase } from '../../services/supabaseClient';
import { sendSenderEmail, sendRecipientEmail } from '../../services/emailService';
import styles from './Home.module.css';
import { useTour } from '../../context/TourContextBase';

const APP_VERSION = '1.1.0';

function TransactionModal({ isOpen, onClose, onSuccess, currentUser }) {
  const [step, setStep] = useState('form'); // form | confirm | success
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
      setStep('form');
      setAmount('');
      setSelectedUserId('');
      setError('');
    }
  }, [isOpen]);

  const handleNext = (e) => {
    e.preventDefault();
    if (!amount || !selectedUserId) return;
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError('');

    const transferAmount = parseFloat(amount);
    
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
        setStep('form');
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

      // 5. Enviar emails
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
      setStep('success');
      onSuccess(earnedMAIles, currentBalance - transferAmount);
    } catch (err) {
      console.error('Error en transferencia:', err);
      setError('Ocurrió un error al procesar la transferencia.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return createPortal(
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className={styles.modalTitle}>Nueva Transferencia</h2>
                <p className={styles.modalDesc}>Transfiere a otros usuarios de AIBank.</p>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <form onSubmit={handleNext} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>Destinatario</label>
                    {loadingUsers ? (
                      <div className={styles.loadingUsers}>
                        <SpinnerGap size={20} className={styles.spinner} />
                        <span>Cargando usuarios...</span>
                      </div>
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
                  <button type="submit" className={styles.submitBtn} disabled={isProcessing || !amount || !selectedUserId}>
                    Continuar
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className={styles.modalTitle}>Confirmar Envío</h2>
                <div className={styles.confirmBox}>
                  <div className={styles.confirmRow}>
                    <span>Destinatario:</span>
                    <strong>{selectedUser?.name}</strong>
                  </div>
                  <div className={styles.confirmRow}>
                    <span>Monto:</span>
                    <strong className={styles.confirmAmount}>${amount}</strong>
                  </div>
                  <div className={styles.confirmRow}>
                    <span>Comisión:</span>
                    <strong>$0.00</strong>
                  </div>
                </div>
                {error && <div className={styles.errorBanner}>{error}</div>}
                <button 
                  className={styles.submitBtn} 
                  onClick={handleConfirm} 
                  disabled={isProcessing}
                  style={{ background: 'var(--accent-blue)' }}
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar y Enviar'}
                </button>
                <button className={styles.backBtn} onClick={() => setStep('form')} disabled={isProcessing}>Atrás</button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={styles.successIconWrapper}>
                  <Trophy size={60} weight="fill" color="#ffd700" />
                </div>
                <h2 className={styles.modalTitle}>¡Transferencia Exitosa!</h2>
                <p className={styles.modalDesc}>Has enviado <strong>${amount}</strong> a <strong>{selectedUser?.name}</strong>.</p>
                <div className={styles.rewardBanner}>
                  <Sparkle size={20} weight="fill" />
                  <span>Ganaste <strong>+250 mAIles</strong></span>
                </div>
                <button className={styles.submitBtn} onClick={onClose}>Entendido</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function ServicesModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState('categories'); // categories | pay | success
  const [selectedService, setSelectedService] = useState(null);
  const [refNumber, setRefNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = [
    { id: 'elec', name: 'Electricidad', icon: Lightning, color: '#f59e0b' },
    { id: 'water', name: 'Agua Potable', icon: Drop, color: '#3b82f6' },
    { id: 'internet', name: 'Internet / Wifi', icon: WifiHigh, color: '#6366f1' },
    { id: 'tv', name: 'Streaming / TV', icon: Television, color: '#ec4899' },
  ];

  const handlePay = () => {
    if (!refNumber) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onSuccess(150); // Payment reward
    }, 1500);
  };

  const resetAndClose = () => {
    setStep('categories');
    setSelectedService(null);
    setRefNumber('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={resetAndClose}><X size={20} /></button>

          <AnimatePresence mode="wait">
            {step === 'categories' && (
              <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className={styles.modalTitle}>Pago de Servicios</h2>
                <p className={styles.modalDesc}>Selecciona el servicio que deseas pagar.</p>
                <div className={styles.servicesGrid}>
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      className={styles.serviceItem}
                      onClick={() => { setSelectedService(cat); setStep('pay'); }}
                    >
                      <div className={styles.serviceIconFrame} style={{ background: cat.color + '15', color: cat.color }}>
                        <cat.icon size={28} weight="fill" />
                      </div>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'pay' && (
              <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                   <div className={styles.serviceIconSmall} style={{ background: selectedService.color + '20', color: selectedService.color }}>
                     <selectedService.icon size={20} weight="fill" />
                   </div>
                   <h2 className={styles.modalTitle} style={{ marginBottom: 0 }}>{selectedService.name}</h2>
                </div>
                <p className={styles.modalDesc}>Ingresa el número de referencia de tu factura.</p>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>Número de Suministro / Referencia</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 123456789" 
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                    />
                  </div>
                  <div className={styles.paymentInfo}>
                    <div className={styles.paymentRow}>
                      <span>Monto Estimado</span>
                      <strong>$24.50</strong>
                    </div>
                  </div>
                  <button className={styles.submitBtn} onClick={handlePay} disabled={isProcessing || !refNumber}>
                    {isProcessing ? 'Procesando...' : 'Pagar Ahora'}
                  </button>
                  <button className={styles.backBtn} onClick={() => setStep('categories')} disabled={isProcessing}>Atrás</button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={styles.successIconWrapper}>
                  <Trophy size={60} weight="fill" color="#ffd700" />
                </div>
                <h2 className={styles.modalTitle}>¡Pago Exitoso!</h2>
                <p className={styles.modalDesc}>Tu pago de <strong>{selectedService.name}</strong> ha sido procesado correctamente.</p>
                <div className={styles.rewardBanner}>
                  <Sparkle size={20} weight="fill" />
                  <span>Ganaste <strong>+150 mAIles</strong></span>
                </div>
                <button className={styles.submitBtn} onClick={resetAndClose}>Siguiente</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function CardsModal({ isOpen, onClose }) {
  const [showCvv, setShowCvv] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const transactions = [
    { id: 1, title: 'Netflix Subscription', date: 'Hoy, 10:20 AM', amount: -15.99, icon: Television },
    { id: 2, title: 'Starbucks Coffee', date: 'Ayer, 4:15 PM', amount: -6.50, icon: Coffee },
    { id: 3, title: 'AIBank Deposit', date: '08 Abr, 2026', amount: 500.00, icon: Bank },
  ];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{ maxWidth: '420px' }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          
          <h2 className={styles.modalTitle}>Gestión de Tarjetas</h2>
          <p className={styles.modalDesc}>Seguridad y datos de tu Tarjeta de Crédito AIBank.</p>

          <div className={`${styles.digitalCard} ${isLocked ? styles.cardLocked : ''}`} style={{ background: 'linear-gradient(135deg, #0f172a, #334155)' }}>
            <div className={styles.cardGlass} />
            <div className={styles.cardTop}>
              <div className={styles.cardBrand}>AIBank <span>Platinum</span></div>
              <ShieldCheck size={28} weight="fill" color="rgba(0, 230, 118, 0.8)" />
            </div>
            <div className={styles.cardNumber}>•••• •••• •••• 4567</div>
            <div className={styles.cardBottom}>
              <div className={styles.cardInfo}>
                <span className={styles.cardLabel}>VENCE</span>
                <span className={styles.cardValue}>12/28</span>
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardLabel}>CVV</span>
                <span className={styles.cardValue}>{showCvv ? '412' : '•••'}</span>
              </div>
            </div>
            {isLocked && (
              <div className={styles.lockedOverlay}>
                <Lock size={40} weight="fill" />
                <span>Tarjeta Congelada</span>
              </div>
            )}
          </div>

          <div className={styles.cardActionsGrid}>
            <button className={styles.cardActionItem} onClick={() => setShowCvv(!showCvv)}>
              {showCvv ? <EyeSlash size={22} /> : <Eye size={22} />}
              <span>{showCvv ? 'Ocultar' : 'Ver datos'}</span>
            </button>
            <button className={styles.cardActionItem} onClick={() => setIsLocked(!isLocked)}>
              <Lock size={22} color={isLocked ? 'var(--accent-red)' : 'inherit'} />
              <span>{isLocked ? 'Desbloquear' : 'Congelar'}</span>
            </button>
          </div>

          <div className={styles.transactionsSection}>
            <h3 className={styles.sectionTitleSmall}>Actividad Reciente</h3>
            <div className={styles.transList}>
              {transactions.map(t => (
                <div key={t.id} className={styles.transItem}>
                  <div className={styles.transIcon}>
                    <t.icon size={20} />
                  </div>
                  <div className={styles.transDetails}>
                    <p className={styles.transTitle}>{t.title}</p>
                    <p className={styles.transDate}>{t.date}</p>
                  </div>
                  <div className={`${styles.transAmount} ${t.amount > 0 ? styles.pos : ''}`}>
                    {t.amount > 0 ? `+$${t.amount}` : `-$${Math.abs(t.amount)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function BankingHubModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{ maxWidth: '440px' }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          
          <h2 className={styles.modalTitle}>Mi Banco AIBank</h2>
          <p className={styles.modalDesc}>Tu centro de relación y beneficios exclusivos.</p>

          <div className={styles.hubGrid}>
            <div className={styles.hubItem}>
              <div className={styles.hubIcon} style={{ background: 'rgba(var(--gold-primary-rgba), 0.1)', color: 'var(--gold-primary)' }}>
                <Trophy size={22} weight="fill" />
              </div>
              <div className={styles.hubInfo}>
                <p className={styles.hubLabel}>Nivel de Cliente</p>
                <p className={styles.hubValue}>Gold Member</p>
              </div>
            </div>
            <div className={styles.hubItem}>
              <div className={styles.hubIcon} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                <MapPin size={22} weight="fill" />
              </div>
              <div className={styles.hubInfo}>
                <p className={styles.hubLabel}>Sucursales</p>
                <p className={styles.hubValue}>Cercanas a ti</p>
              </div>
            </div>
          </div>

          <div className={styles.supportContact}>
             <button className={styles.supportBtn}>
               <ChatCircleDots size={20} />
               <span>Hablar con Soporte Humano</span>
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function FeatureAnnouncementModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handlePlayNow = () => {
    onClose();
    navigate('/season');
  };

  return createPortal(
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          style={{ background: 'linear-gradient(135deg, #1a1a2e, #3a1c71)', border: '1px solid rgba(213,0,249,0.3)', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          <div style={{ background: 'rgba(213,0,249,0.2)', padding: '16px', borderRadius: '50%', color: '#d500f9', display: 'inline-flex', marginBottom: '16px' }}>
            <Trophy size={40} weight="fill" />
          </div>
          <h2 className={styles.modalTitle} style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '12px' }}>Temporada Mundial con IA</h2>
          <p className={styles.modalDesc} style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
            Nuestra campaña de temporada ya está aquí, ahora <strong>impulsada por Inteligencia Artificial</strong>. <br /><br />
            Obtén predicciones exclusivas, desafía los pronósticos y gana mAIles canjeables.
          </p>
          <button
            onClick={handlePlayNow}
            style={{ background: '#d500f9', color: 'white', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%', marginTop: '20px', fontSize: '1rem', boxShadow: '0 4px 15px rgba(213,0,249,0.4)' }}
          >
            Jugar Ahora
          </button>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', padding: '8px 24px', borderRadius: '24px', fontWeight: '500', border: 'none', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '0.9rem', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            Omitir por ahora
          </button>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function CardActivationModal({ isOpen, onClose, onActivate }) {
  const [step, setStep] = useState('terms'); // terms | success
  
  if (!isOpen) return null;

  const handleAccept = () => {
    onActivate();
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('terms');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className={styles.modalOverlay}>
        <motion.div
          className={styles.modalContent}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{ maxWidth: '440px' }}
        >
          <button className={styles.closeBtn} onClick={resetAndClose}><X size={20} /></button>

          <AnimatePresence mode="wait">
            {step === 'terms' && (
              <motion.div key="terms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '50%', color: '#38bdf8', display: 'inline-flex', marginBottom: '16px' }}>
                  <CreditCard size={32} weight="fill" />
                </div>
                <h2 className={styles.modalTitle}>Activa tu Tarjeta Digital</h2>
                <p className={styles.modalDesc}>Disfruta de beneficios exclusivos al activar tu tarjeta Platinum hoy.</p>
                
                <div style={{ textAlign: 'left', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <CheckCircle size={18} color="#00e676" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>0% de comisión</strong> en todas tus compras online de temporada.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <CheckCircle size={18} color="#00e676" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Ganancia masiva</strong> de mAIles por tus predicciones del Mundial.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <CheckCircle size={18} color="#00e676" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Protección IA</strong> activa contra cualquier intento de fraude.</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  Al activar, aceptas el contrato de emisión de tarjeta digital AIBank v1.02.
                </p>

                <button className={styles.submitBtn} onClick={handleAccept}>Aceptar y Activar</button>
                <button className={styles.backBtn} onClick={resetAndClose}>Quizás más tarde</button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={styles.successIconWrapper}>
                  <Trophy size={60} weight="fill" color="#ffd700" />
                </div>
                <h2 className={styles.modalTitle}>¡Tarjeta Activada!</h2>
                <p className={styles.modalDesc}>¡Felicidades! Disfruta de tu nueva tarjeta Platinum. <br /> Has ganado <strong>+450 mAIles</strong>.</p>
                <div className={styles.rewardBanner}>
                  <Sparkle size={20} weight="fill" />
                  <span>Nuevos Beneficios Disponibles</span>
                </div>
                <button className={styles.submitBtn} onClick={resetAndClose}>Entendido</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startTour } = useTour();
  const { currentMAIis, addBankMAIis } = useMAIis();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [isCardActivated, setIsCardActivated] = useState(() => {
    return localStorage.getItem('isCardActivated_v1') === 'true';
  });

  useEffect(() => {
    // Show seasonal popup if it hasn't been dismissed for this version (v3)
    const dismissedVal = localStorage.getItem('seasonal_dismissed_v3');
    if (!dismissedVal) {
      setShowFeaturePopup(true);
    } else {
      // If no popup to show, start the tour if needed
      startTour();
    }
  }, [startTour]);

  const handleFeatureClose = () => {
    localStorage.setItem('seasonal_dismissed_v3', 'true');
    setShowFeaturePopup(false);
    startTour();
  };

  const handleTransactionSuccess = (earnedPts) => {
    addBankMAIis(earnedPts);
    setSuccessMessage(earnedPts);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      setSuccessMessage('');
    }, 5000);
  };

  const handleActivateCard = () => {
    setIsCardActivated(true);
    localStorage.setItem('isCardActivated_v1', 'true');
    handleTransactionSuccess(450);
  };

  const LOYALTY_MISSIONS = [
    {
      id: 'digital_card',
      title: 'Tarjeta Digital AIBank',
      description: 'Activa tu tarjeta digital y úsala en tus compras online.',
      reward: 450,
      icon: CreditCard,
      actionLabel: isCardActivated ? 'Gestionar' : 'Activar',
      action: isCardActivated ? () => setIsCardsModalOpen(true) : () => setIsActivationModalOpen(true),
      isExclusive: true,
    },
    {
      id: 'ai_savings',
      title: 'Cuenta Ahorro AIBank',
      description: 'Inicia un plan de ahorro Mundial en tu Cuenta Ahorro.',
      reward: 600,
      icon: Bank,
      actionLabel: 'Ahorrar',
      action: () => {
        handleTransactionSuccess(600);
      },
      isExclusive: true,
    },
    {
      id: 'ai_qr',
      title: 'Paga con QR AIBank',
      description: 'Escanea y paga en comercios con QR AIBank.',
      reward: 200,
      icon: QrCode,
      actionLabel: 'Escanear',
      action: () => handleTransactionSuccess(200),
    },
    {
      id: 'ai_salary',
      title: 'Nómina AIBank',
      description: 'Recibe tu sueldo en AIBank y recibe un bono VIP.',
      reward: 1200,
      icon: HandCoins,
      actionLabel: 'Vincular',
      action: () => handleTransactionSuccess(1200),
      isExclusive: true,
    },
  ];

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
            <span className={styles.amount}>{user?.balance || '4,250'}</span>
            <span className={styles.decimals}>.00</span>
          </div>
        </motion.div>

        {isCardActivated && (
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
        )}
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
          <button className={styles.actionBtn} onClick={() => setIsServicesModalOpen(true)}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
              <Receipt size={24} weight="fill" />
            </div>
            <span>Servicios</span>
          </button>
          {isCardActivated && (
            <button className={styles.actionBtn} onClick={() => setIsCardsModalOpen(true)}>
              <div className={styles.actionIconWrapper} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                <CreditCard size={24} weight="fill" />
              </div>
              <span>Tarjetas</span>
            </button>
          )}
          <button className={styles.actionBtn} onClick={() => setIsHubModalOpen(true)}>
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
        {LOYALTY_MISSIONS.map((mission) => (
          <div key={mission.id} className={styles.missionCard}>
            <div className={styles.missionInfo}>
              <div className={styles.missionHeaderRow}>
                <mission.icon size={20} weight="fill" className={styles.missionTypeIcon} />
                {mission.isExclusive && <span className={styles.exclusiveTag}>EXCLUSIVO</span>}
              </div>
              <h4>{mission.title}</h4>
              <p>{mission.description}</p>
              <span className={styles.missionReward}>+{mission.reward} mAIles</span>
            </div>
            <button className={styles.missionActionBtn} onClick={mission.action}>
              {mission.actionLabel}
            </button>
          </div>
        ))}
      </section>

      {/* Floating Notification */}
      <AnimatePresence>
        {successMessage && createPortal(
          <motion.div
            className={styles.floatingToast}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Trophy size={24} weight="fill" color="var(--gold-primary)" />
            <span className={styles.toastText}>¡Misión Completada! <strong>+{successMessage} mAIles</strong></span>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionSuccess}
        currentUser={user}
      />
      <ServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
      <CardsModal
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
      />
      <BankingHubModal
        isOpen={isHubModalOpen}
        onClose={() => setIsHubModalOpen(false)}
      />
      <FeatureAnnouncementModal
        isOpen={showFeaturePopup}
        onClose={handleFeatureClose}
      />
      <CardActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        onActivate={handleActivateCard}
      />
    </div>
  );
}
