import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function HomePage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const toast = useToast();

  const quick = [
    { icon: '✍️', label: 'AI 创作', to: '/studio', color: 'from-violet-500/20 to-violet-500/5' },
    { icon: '💰', label: '收益中心', to: '/earnings', color: 'from-cyan-500/20 to-cyan-500/5' },
    { icon: '📚', label: '作品库', to: '/library', color: 'from-pink-500/20 to-pink-500/5' },
    { icon: '🛡️', label: '管理后台', to: '/admin', color: 'from-amber-500/20 to-amber-500/5' },
  ];

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/45 text-xs mb-1">Nova AI Studio</p>
          <h1 className="text-2xl font-bold">
            你好，<span className="grad-text">{state.isAdmin ? state.adminName : '创作者'}</span>
          </h1>
        </div>
        <button
          onClick={() => {
            toast('暂无新通知', 'info');
          }}
          className="press glass w-10 h-10 rounded-full flex items-center justify-center relative"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-white/70">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-brand-pink animate-pulseDot" />
        </button>
      </header>

      {/* Hero balance card */}
      <div
        className="press relative overflow-hidden rounded-3xl p-6 mb-6 shadow-glow"
        style={{ background: 'linear-gradient(135deg, rgba(139,124,246,0.35) 0%, rgba(34,211,238,0.22) 100%)' }}
        onClick={() => navigate('/earnings')}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-white/70 text-xs mb-1.5">累计收益 · 引擎运行中</p>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-bold tracking-tight">¥{state.earnings.total.toFixed(2)}</span>
          <span className="text-emerald-300 text-sm mb-1.5">今日 +{state.earnings.today.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] bg-white/15 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulseDot" />
            自动变现引擎在线
          </span>
          <span className="text-[11px] bg-white/15 rounded-full px-2.5 py-1">{state.apis.length} 个 API 已接入</span>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {quick.map((q) => (
          <button
            key={q.label}
            onClick={() => {
              navigate(q.to);
            }}
            className={`press glass rounded-2xl py-4 flex flex-col items-center gap-2 bg-gradient-to-b ${q.color}`}
          >
            <span className="text-2xl">{q.icon}</span>
            <span className="text-[11px] text-white/70">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Running tasks */}
      <div className="glass rounded-3xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">自动任务</h2>
          <button onClick={() => toast('任务引擎运行正常', 'success')} className="press text-xs text-violet-300">
            全部运行中
          </button>
        </div>
        <div className="space-y-3">
          {state.tasks.slice(0, 3).map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/85 truncate">{t.name}</p>
                <div className="h-1.5 rounded-full bg-white/8 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-all"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                  t.status === '运行中'
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : t.status === '已完成'
                    ? 'bg-white/10 text-white/50'
                    : 'bg-amber-400/15 text-amber-300'
                }`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent earnings */}
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">最新收益</h2>
          <button onClick={() => navigate('/earnings')} className="press text-xs text-violet-300">
            查看全部
          </button>
        </div>
        <div className="space-y-3">
          {state.earnings.records.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/85">{r.source}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{r.time}</p>
              </div>
              <span className="text-emerald-300 font-semibold">+¥{r.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
