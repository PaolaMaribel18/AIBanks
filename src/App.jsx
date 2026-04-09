import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContextBase';
import { ThemeProvider } from './context/ThemeContext';
import TopBar from './components/TopBar/TopBar';
import BottomNav from './components/BottomNav/BottomNav';
import PageTransition from './components/PageTransition/PageTransition';
import SplashScreen from './components/SplashScreen/SplashScreen';
import Home from './pages/Home/Home';
import WorldCupSeason from './pages/WorldCupSeason/WorldCupSeason';
import Predictions from './pages/Predictions/Predictions';
import Rewards from './pages/Rewards/Rewards';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Questionnaire from './pages/Questionnaire/Questionnaire';
import AuthCallback from './pages/AuthCallback/AuthCallback';

function AppContent() {
  const { user, hasCompletedOnboarding } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Questionnaire />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <NavigationProvider>
        <TopBar />
        <main style={{ paddingTop: 0 }}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route element={<PageTransition />}>
              <Route path="/" element={<Home />} />
              <Route path="/season" element={<WorldCupSeason />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            {/* Catch any stale/unknown route (e.g. /login after auth) → Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </NavigationProvider>
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AnimatePresence mode="wait">
            <AppContent />
          </AnimatePresence>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
