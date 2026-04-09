import { useState, useCallback, useMemo } from 'react';
import { TourContext } from './TourContextBase';
import * as reactJoyride from 'react-joyride';
const { STATUS } = reactJoyride;

const GLOBAL_STEPS = [
  {
    target: '.tour-step-banco',
    content: 'Bienvenido a tu Banco. Aquí puedes gestionar tus cuentas, realizar transferencias y pagar tus servicios con facilidad.',
    disableBeacons: true,
    placement: 'top',
  },
  {
    target: '.tour-step-mundial',
    content: '¡Vive la emoción del Mundial! Participa en desafíos diarios, realiza tus pronósticos impulsados por IA y gana mAIles extra.',
    placement: 'top',
  },
  {
    target: '.tour-step-recompensas',
    content: 'Explora tus Beneficios. Canjea tus mAIles acumulados por premios exclusivos y experiencias VIP.',
    placement: 'top',
  }
];

const SEASON_STEPS = [
  {
    target: '.tour-step-balance',
    content: 'Aquí verás tus mAIles exclusivos para la temporada del Mundial. ¡Úsalos para predecir y ganar!',
    disableBeacons: true,
    placement: 'bottom',
  },
  {
    target: '.tour-step-tabs',
    content: 'Cambia entre Desafíos (para ganar mAIles), Pronósticos (ver tus jugadas) y En Vivo (resultados reales).',
    placement: 'bottom',
  },
  {
    target: '.tour-step-bonus',
    content: '¡No olvides reclamar tu bono diario! Te otorgamos 50 mAIles gratis cada día para que no dejes de jugar.',
    placement: 'top',
  },
  {
    target: '.tour-step-matches',
    content: 'Estos son los partidos destacados. Haz clic para elegir quién ganará y multiplica tus mAIles con nuestra IA.',
    placement: 'top',
  }
];

export function TourProvider({ children }) {
  const [run, setRun] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeFlow, setActiveFlow] = useState('global'); // 'global' | 'season'

  const steps = useMemo(() => {
    return activeFlow === 'season' ? SEASON_STEPS : GLOBAL_STEPS;
  }, [activeFlow]);

  const handleJoyrideCallback = useCallback((data) => {
    const { status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    console.log('[Tour] Callback:', { status, type, run, activeFlow });

    if (finishedStatuses.includes(status)) {
      console.log('[Tour] Finishing tour...');
      setRun(false);
      const storageKey = activeFlow === 'season' ? 'hasSeenSeasonTour' : 'hasSeenGlobalTour';
      localStorage.setItem(storageKey, 'true');
    }
  }, [run, activeFlow]);

  const startTour = useCallback((force = false, flow = 'global') => {
    const storageKey = flow === 'season' ? 'hasSeenSeasonTour' : 'hasSeenGlobalTour';
    const hasSeen = localStorage.getItem(storageKey);
    console.log('[Tour] startTour call:', { force, hasSeen, flow });
    
    if (!hasSeen || force) {
      setActiveFlow(flow);
      setTourKey(prev => prev + 1);
      setStepIndex(0);
      setRun(true);
    }
  }, []);

  return (
    <TourContext.Provider value={{ run, tourKey, steps, stepIndex, setStepIndex, handleJoyrideCallback, startTour }}>
      {children}
    </TourContext.Provider>
  );
}
