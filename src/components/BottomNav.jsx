import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from './Toast.jsx';

const TABS = [
  {
    path: '/',
    label: '首页',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    ),
  },
  {
    path: '/studio',
    label: '创作',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z" />
      </svg>
    ),
  },
  {
    path: '/earnings',
    label: '收益',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </svg>
    ),
  },
  {
    path: '/library',
    label: '作品',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    path: '/admin',
    label: '管理',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
      <div className="glass rounded-3xl shadow-card flex items-stretch justify-around px-2 py-2">
        {TABS.map((t) => {
          const active = location.pathname === t.path;
          return (
            <button
              key={t.path}
              onClick={() => {
                if (!active) {
                  navigate(t.path);
                }
              }}
              className={`press flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl min-w-[56px] ${
                active ? 'text-white' : 'text-white/40'
              }`}
            >
              <span
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-300 ${
                  active ? 'bg-gradient-to-r from-brand-violet/30 to-brand-cyan/30 text-violet-300' : ''
                }`}
              >
                {t.icon}
              </span>
              <span className={`text-[10px] font-medium ${active ? 'text-white' : ''}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
