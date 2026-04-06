import { createContext, useContext, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Navigation order maps path to index for directional transitions
const NAV_ORDER = {
  '/': 0,
  '/rewards': 1,
  '/predictions': 2,
  '/leaderboard': 3,
  '/profile': 4,
};

const NavigationContext = createContext({
  direction: 0,
  setDirection: () => {},
});

export function useNavigationDirection() {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef(0);

  // Calculate direction whenever path changes
  const getDirection = useCallback((newPath) => {
    const prevIndex = NAV_ORDER[prevPathRef.current] ?? 0;
    const newIndex = NAV_ORDER[newPath] ?? 0;
    const dir = newIndex > prevIndex ? 1 : newIndex < prevIndex ? -1 : 0;
    prevPathRef.current = newPath;
    directionRef.current = dir;
    return dir;
  }, []);

  return (
    <NavigationContext.Provider value={{ direction: directionRef, getDirection }}>
      {children}
    </NavigationContext.Provider>
  );
}
