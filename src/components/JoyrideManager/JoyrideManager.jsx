import React from 'react';
import * as reactJoyride from 'react-joyride';
const Joyride = (reactJoyride.default ? reactJoyride.default : reactJoyride.Joyride) || reactJoyride;
import { useTour } from '../../context/TourContextBase';
import { useTheme } from '../../context/ThemeContextBase';

export default function JoyrideManager() {
  const { run, tourKey, steps, handleJoyrideCallback } = useTour();
  const { theme } = useTheme();

  const primaryColor = theme === 'dark' ? '#00e676' : '#2563eb';

  if (!run) return null;

  return (
    <Joyride
      key={tourKey}
      steps={steps}
      run={run}
      continuous
      disableBeacons={true}
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleJoyrideCallback}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar tour'
      }}
      styles={{
        options: {
          primaryColor: primaryColor,
          textColor: theme === 'dark' ? '#f8fafc' : '#1e293b',
          backgroundColor: theme === 'dark' ? '#1e1b4b' : '#ffffff',
          arrowColor: theme === 'dark' ? '#1e1b4b' : '#ffffff',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        },
        buttonNext: {
          borderRadius: '12px',
          padding: '10px 20px',
          fontWeight: 'bold',
        },
        buttonBack: {
          marginRight: '10px',
          color: 'var(--text-muted)',
        },
        beacon: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        beaconInner: {
          backgroundColor: primaryColor,
        },
        beaconOuter: {
          border: `2px solid ${primaryColor}`,
          backgroundColor: `${primaryColor}22`,
        }
      }}
    />
  );
}
