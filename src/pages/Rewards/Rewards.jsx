import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Coin, Check, Gift, Star, CurrencyDollar, TShirt, FilmSlate, Buildings, Trophy } from '@phosphor-icons/react';
import FlipCard from '../../components/FlipCard/FlipCard';
import RippleButton from '../../components/RippleButton/RippleButton';
import FireworksBackground from '../../components/FireworksBackground/FireworksBackground';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { useAuth } from '../../context/AuthContextBase';
import { useTheme } from '../../context/ThemeContextBase';
import Leaderboard from '../Leaderboard/Leaderboard';
import { useTier } from '../../hooks/useTier';
import { useMAIis } from '../../hooks/useMAIis';
import { inferArchetypeWithGemini, isGeminiConfigured } from '../../services/gemini';
import styles from './Rewards.module.css';

const CATEGORIES = [
  { key: 'all', icon: Gift, label: 'Todos' },
  { key: 'cashback', icon: CurrencyDollar, label: 'Cashback' },
  { key: 'merchandise', icon: TShirt, label: 'Merch' },
  { key: 'entertainment', icon: FilmSlate, label: 'Entreteni.' },
  { key: 'experiences', icon: Buildings, label: 'Experiencias' },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 22 } },
};

const ARCHETYPE_LABEL = {
  competidor: 'Competidor',
  acumulador: 'Acumulador',
  practico: 'Práctico',
};

const VALID_ARCHETYPES = new Set(['competidor', 'acumulador', 'practico']);

const toValidArchetype = (value) => (VALID_ARCHETYPES.has(value) ? value : null);

const readAiRecommendation = () => {
  try {
    const raw = localStorage.getItem('ai_recommendation');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!toValidArchetype(parsed.arquetipo)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const readStoredArchetype = () => toValidArchetype(localStorage.getItem('archetype'));

const readQuestionnaireSelections = () => {
  try {
    const raw = localStorage.getItem('questionnaireSelections');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const REWARDS_CATALOG = [
  // Competidor (5)
  {
    id: 'comp-worldcup-trip',
    archetype: 'competidor',
    category: 'experiences',
    name: 'Viaje al Mundial 2026',
    description: 'Vive el Mundial 2026 desde el estadio: viaje + experiencia completa.',
    cost: 15000,
    icon: '✈️',
    popular: true,
  },
  {
    id: 'comp-vip-tickets',
    archetype: 'competidor',
    category: 'experiences',
    name: 'Entradas VIP para un partido del Mundial',
    description: 'Acceso VIP para sentir el Mundial como un verdadero campeón.',
    cost: 9000,
    icon: '🎟️',
    popular: true,
  },
  {
    id: 'comp-limited-jersey',
    archetype: 'competidor',
    category: 'merchandise',
    name: 'Camiseta oficial edición limitada de selección',
    description: 'Edición limitada para hinchas que juegan por lo grande.',
    cost: 3500,
    icon: '👕',
  },
  {
    id: 'comp-card-upgrade',
    archetype: 'competidor',
    category: 'experiences',
    name: 'Upgrade de categoría de tarjeta o beneficios premium del banco',
    description: 'Más beneficios premium para que tu experiencia sea de élite.',
    cost: 7000,
    icon: '💳',
  },
  {
    id: 'comp-ps5',
    archetype: 'competidor',
    category: 'entertainment',
    name: 'PlayStation 5',
    description: 'Sube tu nivel: una PS5 puede ser tu próximo gran canje.',
    cost: 12000,
    icon: '🎮',
    popular: true,
  },

  // Acumulador (5)
  {
    id: 'acc-miles-bonus',
    archetype: 'acumulador',
    category: 'cashback',
    name: 'Bono alto de millas',
    description: 'Acumula y canjea: un impulso grande para tus próximos viajes.',
    cost: 8000,
    icon: '🧭',
    popular: true,
  },
  {
    id: 'acc-high-cashback',
    archetype: 'acumulador',
    category: 'cashback',
    name: 'Cashback acumulado de alto valor',
    description: 'Convierte tu constancia en un cashback de alto impacto.',
    cost: 10000,
    icon: '💰',
    popular: true,
  },
  {
    id: 'acc-premium-suitcase',
    archetype: 'acumulador',
    category: 'merchandise',
    name: 'Maleta de viaje premium',
    description: 'Lista para despegar: calidad premium para tus próximas metas.',
    cost: 4500,
    icon: '🧳',
  },
  {
    id: 'acc-mid-phone',
    archetype: 'acumulador',
    category: 'entertainment',
    name: 'Celular gama media',
    description: 'Un upgrade práctico para tu día a día, a punta de puntos.',
    cost: 6500,
    icon: '📱',
  },
  {
    id: 'acc-premium-headphones',
    archetype: 'acumulador',
    category: 'entertainment',
    name: 'Audífonos inalámbricos premium',
    description: 'Audio premium para acompañar tu racha de predicciones.',
    cost: 5500,
    icon: '🎧',
  },

  // Práctico (5)
  {
    id: 'prac-instant-cashback',
    archetype: 'practico',
    category: 'cashback',
    name: 'Cashback inmediato a la cuenta',
    description: 'Beneficio directo: canje rápido y sin complicaciones.',
    cost: 2000,
    icon: '⚡',
    popular: true,
  },
  {
    id: 'prac-gift-card',
    archetype: 'practico',
    category: 'cashback',
    name: 'Gift card de supermercado o retail',
    description: 'Ahorro real para compras del día a día.',
    cost: 2500,
    icon: '🛒',
    popular: true,
  },
  {
    id: 'prac-discounts',
    archetype: 'practico',
    category: 'cashback',
    name: 'Descuentos en comercios aliados',
    description: 'Descuentos listos para usar en tus marcas aliadas.',
    cost: 1500,
    icon: '🏷️',
  },
  {
    id: 'prac-speaker',
    archetype: 'practico',
    category: 'entertainment',
    name: 'Parlante portátil',
    description: 'Música a donde vayas: canje rápido, disfrute inmediato.',
    cost: 3200,
    icon: '🔊',
  },
  {
    id: 'prac-power-bank',
    archetype: 'practico',
    category: 'merchandise',
    name: 'Power bank',
    description: 'Energía extra para tu rutina: práctico y útil.',
    cost: 1800,
    icon: '🔋',
  },
];

export default function Rewards() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const tier = useTier();

  const [aiRecommendation, setAiRecommendation] = useState(readAiRecommendation);

  const [archetype, setArchetype] = useState(() => {
    const rec = readAiRecommendation();
    return toValidArchetype(rec?.arquetipo) || readStoredArchetype();
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const rec = readAiRecommendation();
    return !(toValidArchetype(rec?.arquetipo) || readStoredArchetype());
  });

  useEffect(() => {
    const sync = () => {
      const rec = readAiRecommendation();
      setAiRecommendation(rec);

      const nextArchetype = toValidArchetype(rec?.arquetipo) || readStoredArchetype();
      if (nextArchetype) {
        setArchetype(nextArchetype);
        setShowOnboarding(false);
      }
    };

    window.addEventListener('storage', sync);
    window.addEventListener('local-storage', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('local-storage', sync);
    };
  }, []);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ competidor: 0, acumulador: 0, practico: 0 });

  const [activeCategory, setActiveCategory] = useState('all');
  const { currentMAIis, redeemedRewards: redeemed, redeemReward, predictions } = useMAIis();
  const [showFireworks, setShowFireworks] = useState(false);
  const [lastRedeemed, setLastRedeemed] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // IA UI state (oculto hasta que el usuario lo pida)
  const [aiPanelState, setAiPanelState] = useState('teaser'); // teaser | thinking | shown
  const [aiThinkingStep, setAiThinkingStep] = useState(0);
  const aiThinkingTimersRef = useRef([]);
  const aiRequestControllerRef = useRef(null);

  const effectiveArchetype = toValidArchetype(aiRecommendation?.arquetipo) || archetype;

  const aiRecommendationMessage = String(aiRecommendation?.mensaje?.recomendacion || '').trim();
  const aiMotivationMessage = String(aiRecommendation?.mensaje?.motivacion || '').trim();
  const aiRetentionMessage = String(aiRecommendation?.mensaje?.retencion || '').trim();
  const showAiResult = aiPanelState === 'shown' && Boolean(effectiveArchetype);

  const userName = String(user?.name || '').trim() || 'Usuario';

  const recommended = effectiveArchetype
    ? REWARDS_CATALOG.filter((r) => r.archetype === effectiveArchetype)
    : [];
  const filtered =
    activeCategory === 'all'
      ? REWARDS_CATALOG
      : REWARDS_CATALOG.filter((r) => r.category === activeCategory);

  const handleRedeem = (reward) => {
    if (currentMAIis < reward.cost || redeemed[reward.id]) return;
    redeemReward(reward);
    setLastRedeemed(reward);
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 3500);
  };

  const handleAnswer = (pointsTo, val) => {
    const newAnswers = { ...answers, [pointsTo]: answers[pointsTo] + val };
    setAnswers(newAnswers);

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const sorted = Object.entries(newAnswers).sort((a,b) => b[1] - a[1]);
      if (sorted[0][1] === sorted[1][1]) {
        setStep(3); // Empate
      } else {
        finishOnboarding(sorted[0][0]);
      }
    } else if (step === 3) {
      const sorted = Object.entries(newAnswers).sort((a,b) => b[1] - a[1]);
      finishOnboarding(sorted[0][0]);
    }
  };

  const finishOnboarding = (winner) => {
    localStorage.setItem('archetype', winner);
    setArchetype(winner);
    setShowOnboarding(false);
  };

  useEffect(() => {
    return () => {
      aiThinkingTimersRef.current.forEach((t) => clearTimeout(t));
      aiThinkingTimersRef.current = [];
      aiRequestControllerRef.current?.abort?.();
      aiRequestControllerRef.current = null;
    };
  }, []);

  const handleAnalyze = () => {
    aiThinkingTimersRef.current.forEach((t) => clearTimeout(t));
    aiThinkingTimersRef.current = [];

    aiRequestControllerRef.current?.abort?.();
    aiRequestControllerRef.current = null;

    const analysisStart = Date.now();

    setAiPanelState('thinking');
    setAiThinkingStep(0);

    aiThinkingTimersRef.current = [
      setTimeout(() => setAiThinkingStep(1), 650),
      setTimeout(() => setAiThinkingStep(2), 1300),
    ];

    const run = async () => {
      try {
        const shouldCallGemini = !aiRecommendation || aiRecommendation?.source !== 'gemini';

        if (shouldCallGemini && isGeminiConfigured()) {
          const controller = new AbortController();
          aiRequestControllerRef.current = controller;

          const redeemedRewardsList = Object.values(redeemed || {});
          const redeemedCategories = Array.from(
            new Set(redeemedRewardsList.map((r) => r?.category).filter(Boolean))
          );

          const geminiContext = {
            userName,
            currentPoints: currentMAIis,
            predictionsCount: Object.keys(predictions || {}).length,
            redeemedCount: redeemedRewardsList.length,
            redeemedCategories,
            financialTier: tier || window.sessionStorage.getItem('financial_tier') || null,
            creditRating: window.sessionStorage.getItem('financial_segment') || null,
            questionnaireSelections: readQuestionnaireSelections(),
          };

          const llm = await inferArchetypeWithGemini(geminiContext, { signal: controller.signal });
          const archetypeFromLlm = toValidArchetype(llm?.arquetipo);
          const finalArchetype = archetypeFromLlm || effectiveArchetype || 'practico';

          const nextRecommendation = {
            version: 1,
            source: 'gemini',
            createdAt: new Date().toISOString(),
            arquetipo: finalArchetype,
            premios_recomendados: Array.isArray(llm?.premios_recomendados) ? llm.premios_recomendados : [],
            mensaje: llm?.mensaje || { recomendacion: '', motivacion: '', retencion: '' },
            confianza: llm?.confianza ?? null,
          };

          localStorage.setItem('ai_recommendation', JSON.stringify(nextRecommendation));
          localStorage.setItem('archetype', nextRecommendation.arquetipo);
          setAiRecommendation(nextRecommendation);
          setArchetype(nextRecommendation.arquetipo);
          setShowOnboarding(false);
        }

        const minDelayMs = 2000;
        const elapsed = Date.now() - analysisStart;
        if (elapsed < minDelayMs) {
          await new Promise((resolve) => setTimeout(resolve, minDelayMs - elapsed));
        }

        setAiPanelState('shown');
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setAiPanelState('shown');
      } finally {
        aiRequestControllerRef.current = null;
      }
    };

    void run();
  };

  // Preguntas del quiz
  const qData = [
    {
      q: "¿Qué te motiva más a participar en los pronósticos?",
      opts: [
        { label: "Quedar arriba entre los participantes", val: 2, t: "competidor" },
        { label: "Sumar puntos y acercarme a una meta grande", val: 2, t: "acumulador" },
        { label: "Ganar algo útil de forma rápida", val: 2, t: "practico" },
      ]
    },
    {
      q: "Cuando vuelves a una app como esta, ¿qué te anima más?",
      opts: [
        { label: "Ver cómo voy frente a otros", val: 2, t: "competidor" },
        { label: "Ver que mis puntos siguen creciendo", val: 2, t: "acumulador" },
        { label: "Encontrar un beneficio claro y fácil de usar", val: 2, t: "practico" },
      ]
    },
    {
      q: "Si entras hoy a la app, ¿qué te gustaría revisar primero?",
      opts: [
        { label: "Mi posición actual", val: 1, t: "competidor" },
        { label: "Mis puntos acumulados", val: 1, t: "acumulador" },
        { label: "Qué premio o beneficio puedo obtener hoy", val: 1, t: "practico" },
      ]
    }
  ];

  return (
    <div className={styles.page}>
      {/* ONBOARDING MODAL OVERLAY */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            className={styles.onboardingOverlay}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.onboardingBox}
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
            >
              <h3 className={styles.onboardingTitle}>Descubramos tu perfil 🧠</h3>
              <p className={styles.onboardingSub}>Queremos recomendarte los premios que mejor conectan contigo. (Paso {step} de {step===3 ? '3' : '2'})</p>
              
              <h4 className={styles.onboardingQuestion}>{qData[step - 1].q}</h4>
              <div className={styles.onboardingOpts}>
                {qData[step - 1].opts.map((o, idx) => (
                  <button 
                    key={idx} 
                    className={styles.onboardingBtn}
                    onClick={() => handleAnswer(o.t, o.val)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Fireworks Effect on Redeem! */}
      <AnimatePresence>
        {showFireworks && (
          <motion.div
            className={styles.fireworksOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FireworksBackground
              colors={theme === 'dark' ? ['#ffd700', '#ffaa00', '#00e676', '#d500f9', '#00b0ff'] : ['#b8960c', '#d4af37', '#28a745', '#6f42c1', '#007bff']}
              population={2}
              duration={3000}
            />
            {lastRedeemed && (
              <motion.div
                className={styles.redeemCelebration}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
              >
                <span className={styles.celebIcon}>{lastRedeemed.icon}</span>
                <span className={styles.celebText}>¡Canjeado!</span>
                <span className={styles.celebName}>{lastRedeemed.name}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 className={styles.title}><Gift size={24} /> Beneficios AIBank</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Canjea tus mAIis por recompensas exclusivas.</p>
        </div>
      </motion.div>

      <motion.div 
        onClick={() => setShowLeaderboard(true)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ 
          margin: '0 20px 20px 20px',
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%)',
          border: '1px solid var(--gold-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(167, 139, 250, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
        whileTap={{ scale: 0.97 }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gold-shine)', opacity: 0.1, pointerEvents: 'none', animation: 'shimmer 2.5s infinite linear' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, position: 'relative' }}>
          <div style={{ background: 'var(--gold-primary)', color: 'var(--bg-primary)', padding: '8px', borderRadius: '50%' }}>
            <Trophy size={20} weight="fill" />
          </div>
          <div>
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Ver Ranking Global</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Compara tu racha y puntaje</div>
          </div>
        </div>
        <div style={{ color: 'var(--gold-primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>›</div>
      </motion.div>

      {/* Recommended Section */}
      <motion.section
        className={styles.recommended}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className={styles.aiCard}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className={styles.aiHeader}>
            <div className={styles.aiTitleRow}>
              <span className={styles.aiMascot} aria-hidden>
                🤖
              </span>
              <div className={styles.aiTitle}>
                {aiPanelState === 'shown' ? 'Recomendación para ti' : 'Recomendación con IA'}
              </div>
            </div>

            <div className={styles.aiSource}>AI-Agent</div>
          </div>

          {aiPanelState === 'teaser' ? (
            <>
              <p className={styles.aiMessage}>
                ¿Quieres descubrir lo que nuestro AI-Agent preparó para ti? Revisa nuestros beneficios.
              </p>
              <div className={styles.aiCtaRow}>
                <RippleButton size="sm" fullWidth onClick={handleAnalyze}>
                  Analizar premios
                </RippleButton>
              </div>
            </>
          ) : null}

          {aiPanelState === 'thinking' ? (
            <div className={styles.aiThinking} aria-live="polite">
              <div className={styles.aiSpinner} aria-hidden />
              <div className={styles.aiThinkingTitle}>Analizando tus beneficios…</div>
              <div className={styles.aiThinkingSteps}>
                <div className={`${styles.aiThinkingStep} ${aiThinkingStep >= 0 ? styles.aiStepActive : ''}`}>
                  <span className={styles.aiStepDot} aria-hidden />
                  <span>Leyendo tu perfil</span>
                </div>
                <div className={`${styles.aiThinkingStep} ${aiThinkingStep >= 1 ? styles.aiStepActive : ''}`}>
                  <span className={styles.aiStepDot} aria-hidden />
                  <span>Comparando beneficios disponibles</span>
                </div>
                <div className={`${styles.aiThinkingStep} ${aiThinkingStep >= 2 ? styles.aiStepActive : ''}`}>
                  <span className={styles.aiStepDot} aria-hidden />
                  <span>Personalizando recomendaciones</span>
                </div>
              </div>
            </div>
          ) : null}

          {aiPanelState === 'shown' ? (
            <>
              <div className={styles.aiProfileLine}>
                Perfil detectado: <strong>{ARCHETYPE_LABEL[effectiveArchetype] || effectiveArchetype || '—'}</strong>
              </div>

              {aiRecommendationMessage ? (
                <p className={styles.aiMessage}>{aiRecommendationMessage}</p>
              ) : null}

              {aiMotivationMessage ? (
                <p className={styles.aiMessageMuted}>{aiMotivationMessage}</p>
              ) : (
                <p className={styles.aiMessage}>Listo. Ya personalizamos tus beneficios.</p>
              )}

              {Array.isArray(aiRecommendation?.premios_recomendados) && aiRecommendation.premios_recomendados.length ? (
                <div className={styles.aiList}>
                  {aiRecommendation.premios_recomendados.slice(0, 5).map((r) => (
                    <div key={r.nombre} className={styles.aiItem}>
                      <div className={styles.aiItemName}>{r.nombre}</div>
                      {r.razon ? <div className={styles.aiItemReason}>{r.razon}</div> : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {aiRetentionMessage ? <div className={styles.aiRetention}>{aiRetentionMessage}</div> : null}
            </>
          ) : null}
        </motion.div>

        {showAiResult ? (
          <>
            <h3 className={styles.sectionTitle}><Star size={18} /> Recomendados exclusivamente para ti</h3>
            <motion.div className={styles.recommendedGrid} variants={staggerContainer} initial="hidden" animate="show">
              {recommended.map((reward) => (
                <motion.div key={reward.id} variants={staggerItem}>
                  <FlipCard
                    front={
                      <div className={styles.rewardCard}>
                        <span className={styles.rewardIcon}>{reward.icon}</span>
                        <h4 className={styles.rewardName}>{reward.name}</h4>
                        <p className={styles.rewardDesc}>{reward.description}</p>
                        <div className={styles.rewardCost}>
                          <AnimatedCounter value={reward.cost} />
                          <span className={styles.pointsLabel}>mAIis</span>
                        </div>
                      </div>
                    }
                    back={
                      <div className={styles.rewardBack}>
                        <p>¿Canjear este premio?</p>
                        <RippleButton
                          onClick={() => handleRedeem(reward)}
                          disabled={currentMAIis < reward.cost || redeemed[reward.id]}
                          className={redeemed[reward.id] ? styles.redeemedBtn : ''}
                        >
                          {redeemed[reward.id] ? <>Canjeado <Check size={14} /></> : 'Canjear'}
                        </RippleButton>
                      </div>
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : null}
      </motion.section>

      {/* Balance Card */}
      <motion.div
        className={styles.balance}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Tu saldo disponible</span>
          <div className={styles.balanceValue}>
            <Coin size={20} />
            <AnimatedCounter
              value={currentMAIis.toLocaleString()}
              className={styles.balanceNum}
            />
            <span className={styles.balanceCurrency}>mAIis</span>
          </div>
        </div>
        <motion.div
          className={styles.vipTag}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 12px rgba(255,215,0,0.3)', '0 0 0px rgba(255,215,0,0)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Crown size={16} />
          <span>{tier}</span>
        </motion.div>
      </motion.div>

      {/* Categories */}
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.key}
            className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catActive : ''}`}
            onClick={() => setActiveCategory(cat.key)}
            whileTap={{ scale: 0.93 }}
            layout
          >
            <cat.icon size={16} /> {cat.label}
            {activeCategory === cat.key && (
              <motion.div
                className={styles.catIndicator}
                layoutId="catIndicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Rewards Grid with FlipCards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          className={styles.grid}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10 }}
        >
          {filtered.map((reward, index) => {
            const canAfford = currentMAIis >= reward.cost;
            const isRedeemed = redeemed[reward.id];

            return (
              <motion.div key={reward.id} variants={staggerItem}>
                <FlipCard
                  front={
                    <div className={`${styles.rewardCard} ${isRedeemed ? styles.redeemed : ''}`}>
                      {reward.popular && !isRedeemed && (
                        <motion.div
                          className={styles.popularTag}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Star size={14} /> Popular
                        </motion.div>
                      )}
                      <motion.span
                        className={styles.rewardIcon}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.08 }}
                      >
                        {reward.icon}
                      </motion.span>
                      <h4 className={styles.rewardName}>{reward.name}</h4>
                      <p className={styles.rewardDesc}>{reward.description}</p>
                      <div className={styles.rewardFooter}>
                        <div className={styles.rewardCost}>
                          <Coin size={16} />
                          <span className={styles.costValue}>{reward.cost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className={styles.flipHint}>Toca para más</div>
                    </div>
                  }
                  back={
                    <div className={`${styles.rewardCard} ${styles.rewardCardBack}`}>
                      <span className={styles.rewardIcon}>{reward.icon}</span>
                      <h4 className={styles.rewardName}>{reward.name}</h4>
                      <div className={styles.rewardFooter} style={{ marginTop: 12 }}>
                        {isRedeemed ? (
                          <div className={styles.redeemedBadge}>✅ Canjeado</div>
                        ) : (
                          <RippleButton
                            variant={canAfford ? 'gold' : 'outline'}
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleRedeem(reward); }}
                            disabled={!canAfford}
                            fullWidth
                          >
                            {canAfford ? <><Coin size={14} /> Canjear Ahora</> : 'Puntos Insuficientes'}
                          </RippleButton>
                        )}
                      </div>
                    </div>
                  }
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
