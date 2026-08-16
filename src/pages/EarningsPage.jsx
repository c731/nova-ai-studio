import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function EarningsPage() {
  const { state } = useApp();
  const toast = useToast();
  const { earnings } = state;

  const withdraw = () => {
    toast('提现申请已提交，预计 1-3 分钟到账支付宝', 'success');
  };

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">收益中心</h1>
        <p className="text-white/45 text-sm">自动运行 · 持续变现 · 实时到账</p>
      </header>

      {/* Total card */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 mb-5 shadow-glow"
        style={{ background: 'linear-gradient(135deg, rgba(139,124,246,0.35) 0%, rgba(244,114,182,0.22) 100%)' }}
      >
        <div className="absolute -bottom-12 -left-10 w-44 h-44 rounded-full bg-white/10 blur-3xl" />
        <p className="text-white/70 text-xs mb-1.5">累计收益（元）</p>
        <div className="flex items-end gap-3 mb-5">
          <span className="text-5xl font-bold tracking-tight">¥{earnings.total.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={withdraw} className="press bg-white text-ink-900 font-semibold text-sm rounded-full px-6 py-2.5">
            立即提现
          </button>
          <button
            onClick={() => toast('收益明细已同步', 'info')}
            className="press bg-white/15 text-white text-sm rounded-full px-5 py-2.5"
          >
            同步明细
          </button>
        </div>
      </div>

      {/* Today + breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="glass rounded-3xl p-4">
          <p className="text-white/45 text-[11px] mb-1">今日收益</p>
          <p className="text-xl font-bold text-emerald-300">+¥{earnings.today.toFixed(2)}</p>
        </div>
        <div className="glass rounded-3xl p-4">
          <p className="text-white/45 text-[11px] mb-1">可提现余额</p>
          <p className="text-xl font-bold">¥{earnings.total.toFixed(2)}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="glass rounded-3xl p-5 mb-5">
        <h2 className="font-semibold mb-4">收益构成</h2>
        <div className="space-y-3.5">
          {earnings.breakdown.map((b) => {
            const pct = Math.round((b.value / earnings.total) * 100);
            return (
              <div key={b.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-white/75">{b.name}</span>
                  <span className="text-white/90 font-medium">¥{b.value.toFixed(2)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Records */}
      <div className="glass rounded-3xl p-5">
        <h2 className="font-semibold mb-4">收益记录</h2>
        <div className="space-y-4">
          {earnings.records.map((r) => (
            <div key={r.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-emerald-400/12 flex items-center justify-center text-emerald-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm text-white/85">{r.source}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    {r.time} · {r.status}
                  </p>
                </div>
              </div>
              <span className="text-emerald-300 font-semibold">+¥{r.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
