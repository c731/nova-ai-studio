import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import { AppProvider } from './context/AppContext.jsx';
import BottomNav from './components/BottomNav.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function AnimatedRoutes() {
  const location = useLocation();
  const [display, setDisplay] = useState(location);
  const [phase, setPhase] = useState('in');

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

  const isAdminRoute = display.pathname.startsWith('/admin');

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        phase === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {/* 背景随用户端/管理端切换 */}
      <div className={isAdminRoute ? 'app-bg-dark' : 'app-bg-light'} />
      <Routes location={display}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen max-w-lg mx-auto relative">
      <AnimatedRoutes />
      {!isAdminRoute && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </AppProvider>
    </ToastProvider>
  );
}
