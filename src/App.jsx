import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import BottomNav from './components/BottomNav.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ToolsPage from './pages/ToolsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import DrawPage from './pages/DrawPage.jsx';
import ServiceCenter from './pages/ServiceCenter.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminGateway from './pages/admin/AdminGateway.jsx';
import AdminLogs from './pages/admin/AdminLogs.jsx';
import AdminMaintainer from './pages/admin/AdminMaintainer.jsx';
import { useUser } from './context/UserContext.jsx';

// 路由守卫：未通过管理员认证一律重定向到管理员认证页
function RequireAdmin({ children }) {
  const { isAdmin } = useUser();
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

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
      <div className={isAdminRoute ? 'app-bg-dark' : 'app-bg-light'} />
      <Routes location={display}>
        {/* 用户端（保持现有页面不变） */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/me" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/draw" element={<DrawPage />} />
        <Route path="/service" element={<ServiceCenter />} />

        {/* 管理员认证入口（独立，不在用户导航中） */}
        <Route path="/admin" element={<AdminPage />} />

        {/* 管理后台（独立 AdminLayout + 路由守卫） */}
        <Route
          path="/admin/panel"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="gateway" element={<AdminGateway />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="maintainer" element={<AdminMaintainer />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen mx-auto relative ${isAdminArea ? 'max-w-full' : 'max-w-lg'}`}>
      <AnimatedRoutes />
      {!isAdminArea && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <UserProvider>
          <HashRouter>
            <Shell />
          </HashRouter>
        </UserProvider>
      </AppProvider>
    </ToastProvider>
  );
}
