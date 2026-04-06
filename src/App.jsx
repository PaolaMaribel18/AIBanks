import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';
import TopBar from './components/TopBar/TopBar';
import BottomNav from './components/BottomNav/BottomNav';
import PageTransition from './components/PageTransition/PageTransition';
import Home from './pages/Home/Home';
import Predictions from './pages/Predictions/Predictions';
import Rewards from './pages/Rewards/Rewards';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Profile from './pages/Profile/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <NavigationProvider>
        <TopBar />
        <main style={{ paddingTop: 0 }}>
          <Routes>
            <Route element={<PageTransition />}>
              <Route path="/" element={<Home />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </main>
        <BottomNav />
      </NavigationProvider>
    </BrowserRouter>
  );
}
