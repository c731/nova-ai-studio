import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB, CREDITS_PER_TOKEN } from '../services/db.js';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../components/Toast.jsx';

// 充值档位（真实运营方式：线下收款后，管理员发放兑换码给用户）
const PLANS = [
  { credits: 100000, price: '1元', tag: '体验' },
  { credits: 1000000, price: '10元', tag: '热门' },
  { credits: 5000000, price: '45元', tag: '超值' },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, refresh } = useUser();
  const toast = useToast();
  const [code, setCode] = useState('');

  if (!user) {
    return (
      <div className="pb-safe px-5 pt-16 animate-fadeUp flex flex-col items-center">
        <p className="text-slate-500 text-sm mb-5">请先登录后使用钱包</p>
        <button onClick={() => navigate('/login')} className="press btn-primary rounded-2xl px-8 py-3 text-white font-semibold">
          去登录
        </button>
      </div>
    );
  }

  const ledger = DB.ledgerOf(user.id);
  const calls = DB.callLogs().filter((c) => c.userId === user.id);

  const doRedeem = () => {
    if (!code.trim()) {
      toast('请输入兑换码', 'warning');
      return;
    }
    const r = DB.redeem(user.id, code);
    toast(r.msg, r.ok ? 'success' : 'error');
    if (r.ok) {
      setCode('');
      refresh();
    }
  };

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">我的钱包</h1>
        <p className="text-slate-400 text-sm">积分余额 · 充值 · 服务记录</p>
      </header>

      {/* 余额卡片 */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-5 text-white" style={{ background: 'linear-gradient(135deg,#4d6bfe 0%,#8b7cf6 100%)' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-white/70 text-xs mb-1.5">可用积分（1 积分 = {CREDITS_PER_TOKEN} Token）</p>
        <p className="text-4xl font-bold mb-3">{user.credits.toLocaleString()}</p>
        <p className="text-[11px] text-white/60">约可支撑 {(user.credits * CREDITS_PER_TOKEN).toLocaleString()} Token 的 AI 调用</p>
      </div>

      {/* 充值档位 */}
      <div className="glass-light rounded-3xl p-5 mb-5">
        <h2 className="font-semibold text-slate-800 mb-1">购买积分</h2>
        <p className="text-[11px] text-slate-400 mb-4">付款后联系管理员获取兑换码，输入即可到账（真实到账流水可查）</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {PLANS.map((p) => (
            <button
              key={p.credits}
              onClick={() => toast(`选择 ${p.price} 档位：${(p.credits / 10000).toFixed(0)}万积分，付款后凭兑换码到账`, 'info')}
              className="press bg-slate-50 border border-slate-100 rounded-2xl py-3.5 text-center relative"
            >
              {p.tag === '热门' && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-[#4d6bfe] text-white px-2 py-0.5 rounded-full">热门</span>
              )}
              <p className="text-sm font-bold text-slate-800">{(p.credits / 10000).toFixed(0)}万</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{p.price}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="输入兑换码 NOVA-XXXXXX"
            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#4d6bfe]/50"
          />
          <button onClick={doRedeem} className="press btn-primary rounded-2xl px-5 text-white text-sm font-semibold">
            兑换
          </button>
        </div>
      </div>

      {/* 服务记录 */}
      <div className="glass-light rounded-3xl p-5 mb-5">
        <h2 className="font-semibold text-slate-800 mb-4">服务记录（真实调用）</h2>
        {calls.length === 0 ? (
          <p className="text-xs text-slate-400">暂无调用记录，去试试 AI 对话吧</p>
        ) : (
          <div className="space-y-3">
            {calls.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">{c.service}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {c.time} · {c.provider} · {c.tokens} Token
                  </p>
                </div>
                <span className="text-sm font-semibold text-rose-500">-{c.credits} 积分</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 积分流水 */}
      <div className="glass-light rounded-3xl p-5">
        <h2 className="font-semibold text-slate-800 mb-4">积分流水</h2>
        <div className="space-y-3">
          {ledger.slice(0, 10).map((l) => (
            <div key={l.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-700">{l.reason}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{l.time}</p>
              </div>
              <span className={`text-sm font-semibold ${l.delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {l.delta >= 0 ? '+' : ''}
                {l.delta.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
