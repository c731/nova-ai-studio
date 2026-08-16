import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../components/Toast.jsx';

// 独立管理后台布局：暗红/蓝紫侧边栏 + 顶部全局统计，与用户端完全不同
const NAV = [
  { to: '/admin/panel', label: '仪表盘', icon: '📊', end: true },
  { to: '/admin/panel/users', label: '用户与积分', icon: '🏆' },
  { to: '/admin/panel/gateway', label: '网关健康', icon: '🛰️' },
  { to: '/admin/panel/logs', label: '失败日志', icon: '🚨' },
  { to: '/admin/panel/maintainer', label: '智能维护AI', icon: '🤖' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setIsAdmin } = useUser();

  const exit = () => {
    setIsAdmin(false);
    toast('已退出管理后台', 'info');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#0d0d1a] text-white">
      {/* 侧边栏（暗红+蓝紫渐变，区别于用户端） */}
      <aside className="w-56 shrink-0 hidden md:flex flex-col border-r border-white/8 bg-gradient-to-b from-[#1a0d14] via-[#140d1f] to-[#0d0d1a]">
        <div className="px-5 py-6">
          <h1 className="font-bold text-lg">
            Nova <span className="text-rose-400">Admin</span>
          </h1>
          <p className="text-[10px] text-white/30 mt-1">管理控制台 v3.0</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  isActive ? 'bg-gradient-to-r from-rose-500/25 to-violet-500/25 text-rose-200 font-semibold' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`
              }
            >
              <span>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 space-y-2">
          <button onClick={() => navigate('/')} className="press w-full rounded-xl py-2.5 bg-white/8 text-white/70 text-sm">
            返回用户端
          </button>
          <button onClick={exit} className="press w-full rounded-xl py-2.5 bg-rose-500/20 text-rose-300 text-sm font-medium">
            退出管理员
          </button>
        </div>
      </aside>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部全局统计条 */}
        <header className="px-5 py-4 border-b border-white/8 flex items-center gap-4 overflow-x-auto">
          <span className="text-sm font-bold shrink-0 md:hidden">Nova Admin</span>
          <div className="flex items-center gap-3 text-[11px] shrink-0">
            <span className="flex items-center gap-1.5 bg-emerald-400/10 text-emerald-300 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulseDot" />
              系统在线
            </span>
            <span className="bg-white/5 text-white/60 px-3 py-1.5 rounded-full">前端直连 + 网关双模式</span>
          </div>
          {/* 移动端横向导航 */}
          <div className="flex md:hidden gap-1 ml-auto">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => `px-2.5 py-1.5 rounded-lg text-xs ${isActive ? 'bg-rose-500/25 text-rose-200' : 'text-white/50'}`}
              >
                {n.icon}
              </NavLink>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
