import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Shield, Scales, DiceFive, Money, FilmSlate } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import GlowButton from '../../components/GlowButton/GlowButton';
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

export default function Questionnaire() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (value, points) => {
    const newAnswers = { ...answers, [value]: (answers[value] || 0) + points };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      if (currentQuestion === 1) {
        // Evaluate tie-breaker need after Q2
        const sorted = Object.entries(newAnswers).sort((a,b) => b[1] - a[1]);
        if (sorted.length > 1 && sorted[0][1] !== sorted[1][1]) {
          // No tie
          finishOnboarding(sorted[0][0]);
          return;
        }
      }
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Finished all 3
      const sorted = Object.entries(newAnswers).sort((a,b) => b[1] - a[1]);
      finishOnboarding(sorted[0][0]);
    }
  };

  const finishOnboarding = (archetype) => {
    localStorage.setItem('archetype', archetype);
    completeOnboarding(archetype);
    navigate('/');
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
          Personaliza tus recomendaciones
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Pregunta {currentQuestion + 1} de {questions.length}
        </motion.p>
        <AnimatePresence mode="wait">
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
                  onClick={() => handleAnswer(option.value, option.points)}
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
        </AnimatePresence>
      </motion.div>
    </div>
  );
}