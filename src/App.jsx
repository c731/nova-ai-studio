import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import { AppProvider } from './context/AppContext.jsx';
import BottomNav from './components/BottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import StudioPage from './pages/StudioPage.jsx';
import EarningsPage from './pages/EarningsPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  const [display, setDisplay] = useState(location);
  const [phase, setPhase] = useState('in'); // in | out

  useEffect(() => {
    if (location.pathname !== display.pathname) {
      setPhase('out');
      const t = setTimeout(() => {
        setDisplay(location);
        setPhase('in');
        window.scrollTo(0, 0);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [location]);

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        phase === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Routes location={display}>
        <Route path="/" element={<HomePage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <HashRouter>
          <div className="app-bg" />
          <div className="min-h-screen max-w-lg mx-auto relative">
            <AnimatedRoutes />
            <BottomNav />
          </div>
        </HashRouter>
      </AppProvider>
    </ToastProvider>
  );
}
