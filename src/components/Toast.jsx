import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

const STYLE = {
  success: { icon: '✓', ring: 'bg-emerald-400/15 text-emerald-300' },
  error: { icon: '✕', ring: 'bg-rose-400/15 text-rose-300' },
  info: { icon: '✦', ring: 'bg-brand-violet/20 text-violet-300' },
  warning: { icon: '!', ring: 'bg-amber-400/15 text-amber-300' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, type = 'info') => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-[92%] max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const s = STYLE[t.type] || STYLE.info;
          return (
            <div
              key={t.id}
              className="animate-toastIn glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card w-full"
            >
              <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${s.ring}`}>
                {s.icon}
              </span>
              <span className="text-sm text-white/90 leading-snug">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
