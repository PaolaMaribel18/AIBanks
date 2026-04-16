import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Shield, Scales, DiceFive, Money, FilmSlate, X } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContextBase';
import GlowButton from '../../components/GlowButton/GlowButton';
import useGameSounds from '../../hooks/useGameSounds';
import {
  getPrizeLibrary,
  inferArchetypeWithGemini,
  isGeminiConfigured,
} from '../../services/gemini';
import { useTranslation } from '../../i18n';
import styles from './Questionnaire.module.css';

const questions = [
  {
    id: 1,
    question: '¿Qué te motiva más a participar en los pronósticos?',
    options: [
      { text: 'Quedar arriba entre los participantes', value: 'competidor', points: 2, icon: Trophy },
      { text: 'Sumar puntos y acercarme a una meta grande', value: 'acumulador', points: 2, icon: Shield },
      { text: 'Ganar algo útil de forma rápida', value: 'practico', points: 2, icon: Money },
    ],
  },
  {
    id: 2,
    question: 'Cuando vuelves a una app como esta, ¿qué te anima más?',
    options: [
      { text: 'Ver cómo voy frente a otros', value: 'competidor', points: 2, icon: Scales },
      { text: 'Ver que mis puntos siguen creciendo', value: 'acumulador', points: 2, icon: DiceFive },
      { text: 'Encontrar un beneficio claro y fácil de usar', value: 'practico', points: 2, icon: FilmSlate },
    ],
  },
  {
    id: 3,
    question: 'Si entras hoy a la app, ¿qué te gustaría revisar primero?',
    options: [
      { text: 'Mi posición actual', value: 'competidor', points: 1, icon: Trophy },
      { text: 'Mis puntos acumulados', value: 'acumulador', points: 1, icon: Shield },
      { text: 'Qué premio o beneficio puedo obtener hoy', value: 'practico', points: 1, icon: Money },
    ],
  },
];

const ARCHETYPE_LABEL = {
  competidor: 'Competidor',
  acumulador: 'Acumulador',
  practico: 'Práctico',
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const pickWinnerFromScores = (scores) => {
  const entries = Object.entries(scores || {}).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  const top = entries[0]?.[0];
  return ['competidor', 'acumulador', 'practico'].includes(top) ? top : 'practico';
};

const buildFallbackRecommendation = (archetype, userName) => {
  const library = getPrizeLibrary();
  const rewards = (library?.[archetype] || []).slice(0, 5);

  return {
    version: 1,
    source: 'fallback',
    createdAt: new Date().toISOString(),
    arquetipo: archetype,
    premios_recomendados: rewards.map((nombre) => ({ nombre, razon: '' })),
    mensaje: {
      recomendacion: `Te recomendamos un perfil ${ARCHETYPE_LABEL[archetype] || archetype} para personalizar tus premios.`,
      motivacion:
        archetype === 'competidor'
          ? 'Sube en el ranking y desbloquea recompensas aspiracionales.'
          : archetype === 'acumulador'
            ? 'Acumula puntos con constancia y apunta a premios de mayor valor.'
            : 'Canjea rápido beneficios útiles y mantén tu racha activa.',
      retencion: userName
        ? `Vuelve mañana, ${userName.split(' ')[0]}, para seguir sumando puntos.`
        : 'Vuelve mañana para seguir sumando puntos.',
    },
    confianza: null,
  };
};

const filterAllowedRewards = (archetype, rewards) => {
  const library = getPrizeLibrary();
  const allowed = new Set((library?.[archetype] || []).map((r) => r.toLowerCase()));
  const normalized = (rewards || [])
    .filter((r) => r?.nombre)
    .filter((r) => allowed.has(String(r.nombre).toLowerCase()));
  return normalized.length ? normalized : (library?.[archetype] || []).slice(0, 5).map((nombre) => ({ nombre, razon: '' }));
};

export default function Questionnaire() {
  const navigate = useNavigate();
  const { completeOnboarding, user } = useAuth();
  const { playClick, playSuccess, playCoin, playError } = useGameSounds();
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selections, setSelections] = useState([]);

  const getStoredRecommendation = () => {
    try {
      const raw = window.localStorage.getItem('ai_recommendation');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (!['competidor', 'acumulador', 'practico'].includes(parsed.arquetipo)) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const [status, setStatus] = useState(() => (getStoredRecommendation() ? 'result' : 'quiz')); // quiz | loading | result
  const [aiRecommendation, setAiRecommendation] = useState(getStoredRecommendation);

  const progress = status === 'quiz'
    ? ((currentQuestion + 1) / questions.length) * 100
    : 100;

  const userName = useMemo(() => {
    const name = user?.name;
    if (!name) return '';
    return String(name).trim();
  }, [user?.name]);

  const inferAndFinish = async (scoresSnapshot, selectionsSnapshot) => {
    setStatus('loading');

    const fallbackArchetype = pickWinnerFromScores(scoresSnapshot);

    // Guardamos las selecciones para re-usarlas luego (p.ej. en Rewards → "Analizar").
    try {
      window.localStorage.setItem('questionnaireSelections', JSON.stringify(selectionsSnapshot || []));
    } catch {
      // ignore
    }

    const predictions = safeParse(window.localStorage.getItem('predictions'), {});
    const redeemedRewards = safeParse(window.localStorage.getItem('redeemedRewards'), {});

    const redeemedCategories = Array.from(
      new Set(
        Object.values(redeemedRewards)
          .map((r) => r?.category)
          .filter(Boolean)
      )
    );

    const geminiContext = {
      userName: userName || 'Usuario',
      currentPoints: null,
      predictionsCount: Object.keys(predictions || {}).length,
      redeemedCount: Object.keys(redeemedRewards || {}).length,
      redeemedCategories,
      financialTier: window.sessionStorage.getItem('financial_tier') || null,
      creditRating: window.sessionStorage.getItem('financial_segment') || null,
      questionnaireSelections: selectionsSnapshot,
    };

    try {
      let finalRecommendation = null;

      if (isGeminiConfigured()) {
        const llm = await inferArchetypeWithGemini(geminiContext);
        if (llm?.arquetipo) {
          finalRecommendation = {
            version: 1,
            source: 'gemini',
            createdAt: new Date().toISOString(),
            arquetipo: llm.arquetipo,
            premios_recomendados: filterAllowedRewards(llm.arquetipo, llm.premios_recomendados),
            mensaje: llm.mensaje,
            confianza: llm.confianza,
          };
        }
      }

      if (!finalRecommendation) {
        finalRecommendation = buildFallbackRecommendation(fallbackArchetype, userName);
      }

      window.localStorage.setItem('ai_recommendation', JSON.stringify(finalRecommendation));
      window.localStorage.setItem('archetype', finalRecommendation.arquetipo);
      playSuccess();
      playCoin();

      setAiRecommendation(finalRecommendation);
      setStatus('result');
    } catch (err) {
      console.error('Gemini inference failed:', err);
      playError();

      const finalRecommendation = buildFallbackRecommendation(fallbackArchetype, userName);
      window.localStorage.setItem('ai_recommendation', JSON.stringify(finalRecommendation));
      window.localStorage.setItem('archetype', finalRecommendation.arquetipo);
      setAiRecommendation(finalRecommendation);
      setStatus('result');
    }
  };

  const handleAnswer = async (value, points, optionText, questionId) => {
    playClick();
    const newAnswers = { ...answers, [value]: (answers[value] || 0) + points };
    setAnswers(newAnswers);

    const nextSelections = [
      ...selections,
      { id: questionId, value, points, text: optionText },
    ];
    setSelections(nextSelections);

    if (currentQuestion < questions.length - 1) {
      if (currentQuestion === 1) {
        // Evaluate tie-breaker need after Q2
        const sorted = Object.entries(newAnswers).sort((a,b) => b[1] - a[1]);
        if (sorted.length > 1 && sorted[0][1] !== sorted[1][1]) {
          // No tie
          await inferAndFinish(newAnswers, nextSelections);
          return;
        }
      }
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Finished all 3
      await inferAndFinish(newAnswers, nextSelections);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className={styles.progressBar}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {t('questionnaire.title')}
        </motion.h1>
        {status === 'quiz' && (
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {t('questionnaire.questionOf', { current: currentQuestion + 1, total: questions.length })}
          </motion.p>
        )}
        <AnimatePresence mode="wait">
          {status === 'loading' ? (
            <motion.div
              key="loading"
              className={styles.statusBox}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.spinner} />
              <h3 className={styles.statusTitle}>{t('questionnaire.analyzingProfile')}</h3>
              <p className={styles.statusText}>
                {isGeminiConfigured()
                  ? t('questionnaire.geminiConfigured')
                  : t('questionnaire.geminiNotConfigured')}
              </p>
            </motion.div>
          ) : status === 'result' ? (
            <motion.div
              key="result"
              className={styles.statusBox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <button
                className={styles.closeBtn}
                onClick={async () => {
                  if (aiRecommendation?.arquetipo) {
                    await completeOnboarding(aiRecommendation.arquetipo);
                  }
                  navigate('/');
                }}
                aria-label={t('questionnaire.closeAndGoBank')}
              >
                <X size={20} weight="bold" />
              </button>

              <div className={styles.resultHeader}>
                <div className={styles.checkIcon}>✅</div>
                <h3 className={styles.resultDisplayTitle}>{t('questionnaire.profileReady')}</h3>
              </div>

              <div className={styles.archetypePreview}>
                <div className={styles.archetypeIconMain}>
                  {aiRecommendation?.arquetipo === 'practico' ? '🎁' : aiRecommendation?.arquetipo === 'acumulador' ? '📈' : '🏆'}
                </div>
                <div className={styles.archetypeInfoMain}>
                  <div className={styles.archetypeLabelMain}>{t('questionnaire.archetypeLabel')}</div>
                  <div className={styles.archetypeNameMain}>
                    {aiRecommendation?.arquetipo === 'practico' ? t('profile.archetypes.practico') : aiRecommendation?.arquetipo === 'acumulador' ? t('profile.archetypes.acumulador') : t('profile.archetypes.competidor')}
                  </div>
                </div>
              </div>

              <p className={styles.resultTextCohesive}>
                {t('questionnaire.discoverBenefits')}
              </p>

              <div className={styles.ctaRow}>
                <GlowButton
                  variant="gold"
                  fullWidth
                  onClick={async () => {
                    if (aiRecommendation?.arquetipo) {
                      await completeOnboarding(aiRecommendation.arquetipo);
                    }
                    navigate('/rewards');
                  }}
                >
                  {t('questionnaire.seeBenefits')}
                </GlowButton>
                <button
                  className={styles.secondaryBtn}
                  onClick={async () => {
                    if (aiRecommendation?.arquetipo) {
                      await completeOnboarding(aiRecommendation.arquetipo);
                    }
                    navigate('/');
                  }}
                >
                  {t('questionnaire.goToBank')}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion}
              className={styles.question}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className={styles.questionText}>{question.question}</h3>
              <div className={styles.options}>
                {question.options.map((option, index) => (
                  <motion.button
                    key={option.value}
                    className={styles.optionButton}
                    onClick={() => handleAnswer(option.value, option.points, option.text, question.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={styles.optionIcon}><option.icon size={24} /></span>
                    <span className={styles.optionText}>{option.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}