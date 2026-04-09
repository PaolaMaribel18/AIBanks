import { useState, useEffect, useCallback } from 'react';
import { USER_PROFILE, UPCOMING_MATCHES } from '../data/mockData';
import { useWorldCupMatches } from './useWorldCupMatches';

export function useMAIis() {
  const { matches } = useWorldCupMatches();
  const allMatches = matches?.length ? matches : UPCOMING_MATCHES;

  const [predictions, setPredictionsState] = useState(() => {
    try {
      const stored = window.localStorage.getItem('predictions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [redeemedRewards, setRedeemedRewards] = useState(() => {
    try {
      const stored = window.localStorage.getItem('redeemedRewards');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [earnedBankMAIis, setEarnedBankMAIisState] = useState(() => {
    try {
      const stored = window.localStorage.getItem('earnedBankMAIis');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Calcular mAIles ganados en predicciones
  const earnedPredictionMAIis = Object.entries(predictions).reduce((acc, [matchId, predData]) => {
    const match = allMatches.find((m) => String(m.id) === String(matchId));
    if (!match) return acc;
    const pts = typeof predData === 'object' ? predData.points : (match.points || 0);
    return acc + pts;
  }, 0);

  // Calcular mAIis gastados
  const spentMAIis = Object.values(redeemedRewards).reduce((acc, reward) => {
    return acc + (reward.cost || 0);
  }, 0);

  // mAIis netos (perfil + predicciones + transacciones banco - gastados)
  const currentMAIis = USER_PROFILE.points + earnedPredictionMAIis + earnedBankMAIis - spentMAIis;

  const redeemReward = useCallback((reward) => {
    if (currentMAIis >= reward.cost && !redeemedRewards[reward.id]) {
      const newRedeemed = { ...redeemedRewards, [reward.id]: reward };
      setRedeemedRewards(newRedeemed);
      window.localStorage.setItem('redeemedRewards', JSON.stringify(newRedeemed));
      window.dispatchEvent(new Event('local-storage'));
    }
  }, [currentMAIis, redeemedRewards]);

  const setPredictions = useCallback((newPredsInput) => {
    setPredictionsState((prev) => {
      const next = typeof newPredsInput === 'function' ? newPredsInput(prev) : newPredsInput;
      window.localStorage.setItem('predictions', JSON.stringify(next));
      window.dispatchEvent(new Event('local-storage'));
      return next;
    });
  }, []);

  const addBankMAIis = useCallback((amount) => {
    setEarnedBankMAIisState((prev) => {
      const next = prev + amount;
      window.localStorage.setItem('earnedBankMAIis', next.toString());
      window.dispatchEvent(new Event('local-storage'));
      return next;
    });
  }, []);

  // Escuchar eventos en la misma pestaña y entre pestañas
  useEffect(() => {
    const handleStorage = () => {
      try {
        const storedRedeemed = window.localStorage.getItem('redeemedRewards');
        if (storedRedeemed) setRedeemedRewards(JSON.parse(storedRedeemed));
        
        const storedPreds = window.localStorage.getItem('predictions');
        if (storedPreds) setPredictionsState(JSON.parse(storedPreds));

        const storedBank = window.localStorage.getItem('earnedBankMAIis');
        if (storedBank) setEarnedBankMAIisState(parseInt(storedBank, 10));
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('Failed to sync from localStorage', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('local-storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('local-storage', handleStorage);
    };
  }, []);

  return {
    currentMAIis,
    earnedPredictionMAIis,
    spentMAIis,
    earnedBankMAIis,
    redeemedRewards,
    redeemReward,
    predictions,
    setPredictions,
    addBankMAIis
  };
}
