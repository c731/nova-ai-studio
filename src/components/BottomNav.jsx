import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
    path: '/chat',
    label: '对话',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1116.1-3.8z" />
      </svg>
    ),
  },
  {
    path: '/tools',
    label: '功能',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: '/me',
    label: '我的',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[22px] h-[22px]">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
      <div className="glass-light rounded-3xl shadow-[0_8px_32px_rgba(30,40,90,0.12)] flex items-stretch justify-around px-2 py-2">
        {TABS.map((t) => {
          const active = location.pathname === t.path;
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className={`press flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl min-w-[56px] ${
                active ? 'text-[#4d6bfe]' : 'text-slate-400'
              }`}
            >
              <span
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-300 ${
                  active ? 'bg-[#4d6bfe]/10' : ''
                }`}
              >
                {t.icon}
              </span>
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
