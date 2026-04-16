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
import { useTranslation } from '../../i18n';
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
  const { refreshProfile } = useAuth();
  const { t } = useTranslation();

  const [recentRecipients] = useState([
    { id: '1', name: 'Carlos Mendoza', account: '2200334455', color: '#0ea5e9' },
    { id: '2', name: 'María López', account: '1100998877', color: '#10b981' },
    { id: '3', name: 'Andrés Pérez', account: '5500667788', color: '#7c3aed' },
  ]);

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
        setError(t('home.modal.transfer.recipientsError'));
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
    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      setError(t('home.modal.transfer.invalidAmount'));
      setIsProcessing(false);
      setStep('form');
      return;
    }
    
    try {
      // 1. Transferencia ATÓMICA vía RPC (debit + credit en una transacción)
      const { error: rpcError } = await supabase.rpc('transfer_balance', {
        p_sender_id: currentUser.id,
        p_recipient_id: selectedUserId,
        p_amount: transferAmount,
      });

      if (rpcError) {
        const msg = (rpcError.message || '').toLowerCase();

        if (msg.includes('insufficient balance')) {
          setError(t('home.modal.transfer.insufficientBalance'));
          setIsProcessing(false);
          setStep('form');
          return;
        }

        if (msg.includes('could not find the function') || msg.includes('transfer_balance')) {
          setError(t('home.modal.transfer.rpcMissing'));
          setIsProcessing(false);
          setStep('form');
          return;
        }

        throw rpcError;
      }

      // 2. Traer info del destinatario (para notificación/email)
      const { data: recipientProfile, error: recipientFetchError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', selectedUserId)
        .single();

      if (recipientFetchError) throw recipientFetchError;

      // 3. Refrescar balance local del remitente (si falla, seguimos con éxito)
      try {
        if (typeof refreshProfile === 'function') {
          await refreshProfile();
        }
      } catch {
        // no-op
      }

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
      onSuccess(earnedMAIles);
    } catch (err) {
      console.error('Error en transferencia:', err);
      setError(t('home.modal.transfer.transferError'));
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
                <h2 className={styles.modalTitle}>{t('home.modal.transfer.title')}</h2>
                <p className={styles.modalDesc}>{t('home.modal.transfer.desc')}</p>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.recipientsSection}>
                  <p className={styles.labelSmall}>{t('home.modal.transfer.recent')}</p>
                  <div className={styles.recipientsGrid}>
                    {recentRecipients.map(r => (
                      <button 
                        key={r.id} 
                        className={styles.recipientItem}
                        type="button"
                        onClick={() => {
                          // Intentar emparejar con un usuario de Supabase si existe (por nombre o ID si coinciden)
                          // Para esta simulación, solo pondremos el ID si está en la lista de usuarios
                          const match = users.find(u => u.name === r.name);
                          if (match) setSelectedUserId(match.id);
                        }}
                      >
                        <div className={styles.recipientAvatar} style={{ background: r.color }}>{r.name[0]}</div>
                        <span>{r.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleNext} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>{t('home.modal.transfer.recipient')}</label>
                    {loadingUsers ? (
                      <div className={styles.loadingUsers}>
                        <SpinnerGap size={20} className={styles.spinner} />
                        <span>{t('home.modal.transfer.loadingUsers')}</span>
                      </div>
                    ) : (
                      <select
                        className={styles.userSelect}
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        disabled={isProcessing}
                      >
                        <option value="">{t('home.modal.transfer.selectRecipient')}</option>
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
                    <label>{t('home.modal.transfer.amount')}</label>
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
                    {t('common.continue')}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className={styles.modalTitle}>{t('home.modal.transfer.confirmTitle')}</h2>
                <div className={styles.confirmBox}>
                  <div className={styles.confirmRow}>
                    <span>{t('home.modal.transfer.recipientLabel')}</span>
                    <strong>{selectedUser?.name}</strong>
                  </div>
                  <div className={styles.confirmRow}>
                    <span>{t('home.modal.transfer.amountLabel')}</span>
                    <strong className={styles.confirmAmount}>${amount}</strong>
                  </div>
                  <div className={styles.confirmRow}>
                    <span>{t('home.modal.transfer.commission')}</span>
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
                  {isProcessing ? t('common.processing') : t('home.modal.transfer.confirmAndSend')}
                </button>
                <button className={styles.backBtn} onClick={() => setStep('form')} disabled={isProcessing}>{t('common.back')}</button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={styles.successIconWrapper}>
                  <Trophy size={60} weight="fill" color="#ffd700" />
                </div>
                <h2 className={styles.modalTitle}>{t('home.modal.transfer.successTitle')}</h2>
                <p className={styles.modalDesc}>
                  {t('home.modal.transfer.successDesc', { amount, name: selectedUser?.name || 'la cuenta destino' })}
                </p>
                <div className={styles.rewardBanner}>
                  <Sparkle size={20} weight="fill" />
                  <span>{t('home.modal.transfer.earnedMiles', { miles: 250 })}</span>
                </div>
                <button className={styles.submitBtn} onClick={onClose}>{t('common.understood')}</button>
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
  const { t } = useTranslation();

  const categories = [
    { id: 'elec', name: t('home.modal.services.electricity'), icon: Lightning, color: '#f59e0b' },
    { id: 'water', name: t('home.modal.services.water'), icon: Drop, color: '#3b82f6' },
    { id: 'internet', name: t('home.modal.services.internet'), icon: WifiHigh, color: '#6366f1' },
    { id: 'tv', name: t('home.modal.services.streaming'), icon: Television, color: '#ec4899' },
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
                <h2 className={styles.modalTitle}>{t('home.modal.services.title')}</h2>
                <p className={styles.modalDesc}>{t('home.modal.services.desc')}</p>
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
                <p className={styles.modalDesc}>{t('home.modal.services.invoiceDesc')}</p>
                <div className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>{t('home.modal.services.refNumber')}</label>
                    <input 
                      type="text" 
                      placeholder={t('home.modal.services.refPlaceholder')} 
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                    />
                  </div>
                  <div className={styles.paymentInfo}>
                    <div className={styles.paymentRow}>
                      <span>{t('home.modal.services.estimatedAmount')}</span>
                      <strong>$24.50</strong>
                    </div>
                  </div>
                  <button className={styles.submitBtn} onClick={handlePay} disabled={isProcessing || !refNumber}>
                    {isProcessing ? t('common.processing') : t('home.modal.services.payNow')}
                  </button>
                  <button className={styles.backBtn} onClick={() => setStep('categories')} disabled={isProcessing}>{t('common.back')}</button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={styles.successIconWrapper}>
                  <Trophy size={60} weight="fill" color="#ffd700" />
                </div>
                <h2 className={styles.modalTitle}>{t('home.modal.services.successTitle')}</h2>
                <p className={styles.modalDesc}>{t('home.modal.services.successDesc', { service: selectedService.name })}</p>
                <div className={styles.rewardBanner}>
                  <Sparkle size={20} weight="fill" />
                  <span>{t('home.modal.services.earnedMiles', { miles: 150 })}</span>
                </div>
                <button className={styles.submitBtn} onClick={resetAndClose}>{t('common.next')}</button>
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
  const { t } = useTranslation();

  const transactions = [
    { id: 1, title: 'Netflix Subscription', date: t('home.modal.cards.today') + ', 10:20 AM', amount: -15.99, icon: Television },
    { id: 2, title: 'Starbucks Coffee', date: t('home.modal.cards.yesterday') + ', 4:15 PM', amount: -6.50, icon: Coffee },
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
          
          <h2 className={styles.modalTitle}>{t('home.modal.cards.title')}</h2>
          <p className={styles.modalDesc}>{t('home.modal.cards.desc')}</p>

          <div className={`${styles.digitalCard} ${isLocked ? styles.cardLocked : ''}`} style={{ background: 'linear-gradient(135deg, #0f172a, #334155)' }}>
            <div className={styles.cardGlass} />
            <div className={styles.cardTop}>
              <div className={styles.cardBrand}>AIBank <span>Platinum</span></div>
              <ShieldCheck size={28} weight="fill" color="rgba(0, 230, 118, 0.8)" />
            </div>
            <div className={styles.cardNumber}>•••• •••• •••• 4567</div>
            <div className={styles.cardBottom}>
              <div className={styles.cardInfo}>
                <span className={styles.cardLabel}>{t('home.modal.cards.expires')}</span>
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
                <span>{t('home.modal.cards.frozen')}</span>
              </div>
            )}
          </div>

          <div className={styles.cardActionsGrid}>
            <button className={styles.cardActionItem} onClick={() => setShowCvv(!showCvv)}>
              {showCvv ? <EyeSlash size={22} /> : <Eye size={22} />}
              <span>{showCvv ? t('home.modal.cards.hideData') : t('home.modal.cards.showData')}</span>
            </button>
            <button className={styles.cardActionItem} onClick={() => setIsLocked(!isLocked)}>
              <Lock size={22} color={isLocked ? 'var(--accent-red)' : 'inherit'} />
              <span>{isLocked ? t('home.modal.cards.unfreeze') : t('home.modal.cards.freeze')}</span>
            </button>
          </div>

          <div className={styles.transactionsSection}>
            <h3 className={styles.sectionTitleSmall}>{t('home.modal.cards.recentActivity')}</h3>
            <div className={styles.transList}>
              {transactions.map(tx => (
                <div key={tx.id} className={styles.transItem}>
                  <div className={styles.transIcon}>
                    <tx.icon size={20} />
                  </div>
                  <div className={styles.transDetails}>
                    <p className={styles.transTitle}>{tx.title}</p>
                    <p className={styles.transDate}>{tx.date}</p>
                  </div>
                  <div className={`${styles.transAmount} ${tx.amount > 0 ? styles.pos : ''}`}>
                    {tx.amount > 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
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
  const { t } = useTranslation();
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
          
          <h2 className={styles.modalTitle}>{t('home.modal.hub.title')}</h2>
          <p className={styles.modalDesc}>{t('home.modal.hub.desc')}</p>

          <div className={styles.hubGrid}>
            <div className={styles.hubItem}>
              <div className={styles.hubIcon} style={{ background: 'rgba(var(--gold-primary-rgba), 0.1)', color: 'var(--gold-primary)' }}>
                <Trophy size={22} weight="fill" />
              </div>
              <div className={styles.hubInfo}>
                <p className={styles.hubLabel}>{t('home.modal.hub.clientLevel')}</p>
                <p className={styles.hubValue}>Gold Member</p>
              </div>
            </div>
            <div className={styles.hubItem}>
              <div className={styles.hubIcon} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                <MapPin size={22} weight="fill" />
              </div>
              <div className={styles.hubInfo}>
                <p className={styles.hubLabel}>{t('home.modal.hub.branches')}</p>
                <p className={styles.hubValue}>{t('home.modal.hub.nearYou')}</p>
              </div>
            </div>
          </div>

          <div className={styles.supportContact}>
             <button className={styles.supportBtn}>
               <ChatCircleDots size={20} />
               <span>{t('home.modal.hub.humanSupport')}</span>
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
  const { t } = useTranslation();
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
          <h2 className={styles.modalTitle} style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '12px' }}>{t('home.modal.feature.title')}</h2>
          <p className={styles.modalDesc} style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
            {t('home.modal.feature.desc')} <br /><br />
            {t('home.modal.feature.descDetail')}
          </p>
          <button
            onClick={handlePlayNow}
            style={{ background: '#d500f9', color: 'white', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%', marginTop: '20px', fontSize: '1rem', boxShadow: '0 4px 15px rgba(213,0,249,0.4)' }}
          >
            {t('home.modal.feature.playNow')}
          </button>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', padding: '8px 24px', borderRadius: '24px', fontWeight: '500', border: 'none', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '0.9rem', transition: 'color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
          >
            {t('common.skipForNow')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function CardActivationModal({ isOpen, onClose, onActivate }) {
  const [step, setStep] = useState('terms');
  const { t } = useTranslation();
  
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
                <h2 className={styles.modalTitle}>{t('home.modal.activation.title')}</h2>
                <p className={styles.modalDesc}>{t('home.modal.activation.desc')}</p>
                
                <div style={{ textAlign: 'left', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <CheckCircle size={18} color="#00e676" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('home.modal.activation.benefit1')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <CheckCircle size={18} color="#00e676" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('home.modal.activation.benefit2')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <CheckCircle size={18} color="#00e676" style={{ marginTop: '2px' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('home.modal.activation.benefit3')}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  {t('home.modal.activation.termsNotice')}
                </p>

                <button className={styles.submitBtn} onClick={handleAccept}>{t('home.modal.activation.acceptAndActivate')}</button>
                <button className={styles.backBtn} onClick={resetAndClose}>{t('home.modal.activation.maybeLater')}</button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={styles.successIconWrapper}>
                  <Trophy size={60} weight="fill" color="#ffd700" />
                </div>
                <h2 className={styles.modalTitle}>{t('home.modal.activation.successTitle')}</h2>
                <p className={styles.modalDesc}>{t('home.modal.activation.successDesc')} <br /> {t('home.modal.activation.successMiles', { miles: 450 })}</p>
                <div className={styles.rewardBanner}>
                  <Sparkle size={20} weight="fill" />
                  <span>{t('home.modal.activation.newBenefits')}</span>
                </div>
                <button className={styles.submitBtn} onClick={resetAndClose}>{t('common.understood')}</button>
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
  const { t } = useTranslation();
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
      title: t('home.missions.digitalCard'),
      description: t('home.missions.digitalCardDesc'),
      reward: 450,
      icon: CreditCard,
      actionLabel: isCardActivated ? t('home.missions.manage') : t('home.missions.activate'),
      action: isCardActivated ? () => setIsCardsModalOpen(true) : () => setIsActivationModalOpen(true),
      isExclusive: true,
    },
    {
      id: 'ai_savings',
      title: t('home.missions.savingsAccount'),
      description: t('home.missions.savingsAccountDesc'),
      reward: 600,
      icon: Bank,
      actionLabel: t('home.missions.save'),
      action: () => {
        handleTransactionSuccess(600);
      },
      isExclusive: true,
    },
    {
      id: 'ai_qr',
      title: t('home.missions.qrPay'),
      description: t('home.missions.qrPayDesc'),
      reward: 200,
      icon: QrCode,
      actionLabel: t('home.missions.scan'),
      action: () => handleTransactionSuccess(200),
    },
    {
      id: 'ai_salary',
      title: t('home.missions.payroll'),
      description: t('home.missions.payrollDesc'),
      reward: 1200,
      icon: HandCoins,
      actionLabel: t('home.missions.link'),
      action: () => handleTransactionSuccess(1200),
      isExclusive: true,
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      {/* Saludo */}
      <header className={styles.header}>
        <h1 className={styles.greeting}>{t('home.greeting')}</h1>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
      </header>

      {/* Cuentas y Tarjetas - Scroll Horizontal */}
      <section className={styles.accountsScroll}>
        <motion.div
          className={styles.accountCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={styles.cardHeader}>
            <span className={styles.accountType}>{t('home.savingsAccount')}</span>
            <span className={styles.accountNumber}>**** 8901</span>
          </div>
          <div className={styles.cardBalance}>
            <span className={styles.currency}>$</span>
            <span className={styles.amount}>{user?.balance ?? '4,250'}</span>
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
              <span className={styles.accountType}>{t('home.creditCard')}</span>
              <span className={styles.accountNumber}>**** 4567</span>
            </div>
            <div className={styles.cardBalance}>
              <span className={styles.label}>{t('home.availableCredit')}</span>
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
            <span>{t('home.transfer')}</span>
          </button>
          <button className={styles.actionBtn} onClick={() => setIsServicesModalOpen(true)}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
              <Receipt size={24} weight="fill" />
            </div>
            <span>{t('home.services')}</span>
          </button>
          {isCardActivated && (
            <button className={styles.actionBtn} onClick={() => setIsCardsModalOpen(true)}>
              <div className={styles.actionIconWrapper} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                <CreditCard size={24} weight="fill" />
              </div>
              <span>{t('home.cards')}</span>
            </button>
          )}
          <button className={styles.actionBtn} onClick={() => setIsHubModalOpen(true)}>
            <div className={styles.actionIconWrapper} style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <Bank size={24} weight="fill" />
            </div>
            <span>{t('home.myBank')}</span>
          </button>
        </div>
      </section>

      <h3 className={styles.sectionTitle}>{t('home.benefitsAndMissions')}</h3>

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
            <span className={styles.seasonTag}>{t('home.exclusiveModule')}</span>
            <h3 className={styles.bannerTitle}>{t('home.worldCupSeason')}</h3>
            <p className={styles.bannerDesc}>{t('home.availableMiles', { miles: currentMAIis })} </p>
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
                {mission.isExclusive && <span className={styles.exclusiveTag}>{t('home.missions.exclusive')}</span>}
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
            <span className={styles.toastText}>{t('home.missionComplete', { miles: successMessage })}</span>
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
