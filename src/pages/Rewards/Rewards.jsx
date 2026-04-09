import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Coin, Check, Gift, Star, CurrencyDollar, TShirt, FilmSlate, Buildings, Bank, Sparkle, SquaresFour, List } from '@phosphor-icons/react';
import RippleButton from '../../components/RippleButton/RippleButton';
import FireworksBackground from '../../components/FireworksBackground/FireworksBackground';
import AnimatedCounter from '../../components/AnimatedCounter/AnimatedCounter';
import { useAuth } from '../../context/AuthContextBase';
import { useTheme } from '../../context/ThemeContextBase';
import { useTier } from '../../hooks/useTier';
import { useMAIis } from '../../hooks/useMAIis';
import { inferArchetypeWithGemini, isGeminiConfigured } from '../../services/gemini';
import styles from './Rewards.module.css';

const CATEGORIES = [
  { key: 'all', icon: Gift, label: 'Todos' },
  { key: 'financial', icon: Bank, label: 'Finanzas' },
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

function RewardCompactCard({ reward, currentMAIis, redeemed, onRedeem }) {
  const isRedeemed = redeemed[reward.id];
  const canAfford = currentMAIis >= reward.cost;

  return (
    <div className={`${styles.compactCard} ${isRedeemed ? styles.redeemed : ''}`}>
      <div className={styles.compactLeft}>
        <div className={styles.rewardIcon} style={{ fontSize: '1.6rem', padding: '6px', marginBottom: 0 }}>
          {reward.icon}
        </div>
        <div className={styles.compactInfo}>
          <h4 className={styles.rewardName} style={{ marginBottom: '4px' }}>{reward.name}</h4>
          <div className={styles.rewardCost} style={{ padding: '2px 6px', display: 'inline-flex', width: 'fit-content' }}>
            <Coin size={12} weight="fill" />
            <span className={styles.costValue} style={{ fontSize: '0.75rem' }}>{reward.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.compactRight}>
        {isRedeemed ? (
          <div className={styles.redeemedBadge} style={{ padding: '4px 8px', fontSize: '0.7rem' }}><Check size={14}/> Canjeado</div>
        ) : (
          <RippleButton
            variant={canAfford ? 'gold' : ''}
            className={!canAfford ? styles.missingBtn : ''}
            size="sm"
            onClick={() => onRedeem(reward)}
            disabled={!canAfford}
            style={canAfford 
              ? { padding: '6px 14px', fontSize: '0.75rem', boxShadow: '0 2px 10px rgba(255, 215, 0, 0.2)' } 
              : { padding: '6px 10px', fontSize: '0.72rem' }
            }
          >
            {canAfford ? 'Canjear' : `Faltan ${(reward.cost - currentMAIis).toLocaleString()}`}
          </RippleButton>
        )}
      </div>
    </div>
  );
}

function RewardFlatCard({ reward, currentMAIis, redeemed, onRedeem, isAiRecommend }) {
  const isRedeemed = redeemed[reward.id];
  const canAfford = currentMAIis >= reward.cost;
  const progressPercent = Math.min(100, Math.floor((currentMAIis / reward.cost) * 100));

  return (
    <div className={`${styles.rewardCard} ${isRedeemed ? styles.redeemed : ''} ${isAiRecommend ? styles.aiRewardCard : ''}`}>
      {isAiRecommend && !isRedeemed && (
        <motion.div
          className={styles.aiTag}
          animate={{ boxShadow: ['0 0 0px rgba(213,0,249,0)', '0 0 8px rgba(213,0,249,0.6)', '0 0 0px rgba(213,0,249,0)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkle size={12} weight="fill" /> AIBank Match
        </motion.div>
      )}
      {reward.popular && !isRedeemed && !isAiRecommend && (
        <motion.div
          className={styles.popularTag}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star size={14} /> Popular
        </motion.div>
      )}
      
      <div className={styles.rewardHeader}>
        <span className={styles.rewardIcon}>{reward.icon}</span>
        <div className={styles.rewardTitleArea}>
          <h4 className={styles.rewardName}>{reward.name}</h4>
          <div className={styles.rewardCost}>
            <Coin size={14} />
            <span className={styles.costValue}>{reward.cost.toLocaleString()} mAIis</span>
          </div>
        </div>
      </div>
      
      <p className={styles.rewardDesc}>{reward.description}</p>
      
      <div className={styles.rewardActions}>
        {isRedeemed ? (
          <div className={styles.redeemedBadge}><Check size={16}/> Canjeado</div>
        ) : (
          <RippleButton
            variant={canAfford ? (isAiRecommend ? 'purple' : 'gold') : ''}
            size="sm"
            onClick={() => onRedeem(reward)}
            disabled={!canAfford}
            fullWidth
            className={!canAfford ? styles.missingBtn : ''}
            style={canAfford ? {
              boxShadow: isAiRecommend ? '0 4px 15px rgba(213, 0, 249, 0.35)' : '0 4px 15px rgba(255, 215, 0, 0.25)'
            } : {}}
          >
            {canAfford ? 'Canjear Ahora' : `Faltan ${(reward.cost - currentMAIis).toLocaleString()} mAIis`}
          </RippleButton>
        )}
      </div>
    </div>
  );
}

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
  const [viewMode, setViewMode] = useState('list');
  const { currentMAIis, redeemedRewards: redeemed, redeemReward, predictions } = useMAIis();
  const [showFireworks, setShowFireworks] = useState(false);
  const [lastRedeemed, setLastRedeemed] = useState(null);

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
      q: "¿Qué te motiva más a participar en los beneficios?",
      opts: [
        { label: "Beneficios financieros a largo plazo", val: 2, t: "acumulador" },
        { label: "Premios de alta gama y tecnología", val: 2, t: "competidor" },
        { label: "Ganar algo práctico y de uso diario", val: 2, t: "practico" },
      ]
    },
    {
      q: "Cuando usas tu banco, ¿qué te gusta más?",
      opts: [
        { label: "Reducir tasas o ahorrar en mi crédito", val: 2, t: "acumulador" },
        { label: "Tener estatus VIP y los mejores seguros", val: 2, t: "competidor" },
        { label: "Cashback directo por mis compras", val: 2, t: "practico" },
      ]
    },
    {
      q: "Si tuvieras 5000 mAIis, ¿qué harías?",
      opts: [
        { label: "Rebajar mi porcentaje de préstamo", val: 1, t: "acumulador" },
        { label: "Canjear la consola del momento", val: 1, t: "competidor" },
        { label: "Canjear múltiples gift cards útiles", val: 1, t: "practico" },
      ]
    }
  ];

  const archetypeExplanations = {
    competidor: "Prefieres el reconocimiento, posición VIP y grandes premios aspiracionales (Tecnología y Exclusividad).",
    acumulador: "Prefieres metas claras y beneficios financieros profundos (-Tasa, Hipoteca, Ahorro).",
    practico: "Prefieres el beneficio inmediato que uses diariamente (Cashback, Supermercados, Cero Mantenimiento)."
  };
  return (
    <div className={styles.page}>
      {/* ONBOARDING MODAL */}
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
              <h3 className={styles.onboardingTitle}>Tu Identidad AIBank 🌟</h3>
              <p className={styles.onboardingSub}>Queremos armar un portafolio de beneficios ideal para ti. (Paso {step} de {step===3 ? '3' : '2'})</p>
              
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
      {/* Fireworks Effect */}
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
                <span className={styles.celebText}>¡Aprobado!</span>
                <span className={styles.celebName}>{lastRedeemed.name}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={styles.title}><Gift size={24} /> Beneficios AIBank</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Canjea tus mAIis por recompensas y mejoras financieras.</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        className={styles.balance}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className={styles.balanceInfo}>
          <span className={styles.balanceLabel}>Tu capital en mAIis</span>
          <div className={styles.balanceValue}>
            <Coin size={20} />
            <AnimatedCounter
              value={currentMAIis.toLocaleString()}
              className={styles.balanceNum}
            />
          </div>
        </div>
        <motion.div
          className={styles.vipTag}
          whileTap={{ scale: 0.95 }}
        >
          <Crown size={16} />
          <span>{tier}</span>
        </motion.div>
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
            <h3 className={styles.sectionTitle} style={{ marginTop: '24px' }}>Recomendados exclusivamente para ti</h3>
            <motion.div className={styles.recommendedScroll} variants={staggerContainer} initial="hidden" animate="show">
              {recommended.map((reward) => (
                <motion.div key={`rec-${reward.id}`} variants={staggerItem}>
                  <RewardFlatCard reward={reward} currentMAIis={currentMAIis} redeemed={redeemed} onRedeem={handleRedeem} isAiRecommend={true} />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : null}
      </motion.section>

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
          </motion.button>
        ))}
      </div>

      <div className={styles.catalogHeader}>
         <h3 className={styles.catalogTitle}>Catálogo</h3>
         <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeView : ''}`} onClick={() => setViewMode('list')}><List size={18}/></button>
            <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`} onClick={() => setViewMode('grid')}><SquaresFour size={18}/></button>
         </div>
      </div>

      {/* Main Catalog */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${viewMode}`}
          className={viewMode === 'list' ? styles.compactList : styles.grid}
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -10 }}
        >
          {filtered.map((reward) => (
            <motion.div key={reward.id} variants={staggerItem}>
                {viewMode === 'list' ? (
                  <RewardCompactCard reward={reward} currentMAIis={currentMAIis} redeemed={redeemed} onRedeem={handleRedeem} />
                ) : (
                  <RewardFlatCard reward={reward} currentMAIis={currentMAIis} redeemed={redeemed} onRedeem={handleRedeem} />
                )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
