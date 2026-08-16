import React, { useState } from 'react';
import { DB } from '../../services/db.js';
import { useToast } from '../../components/Toast.jsx';

export default function AdminUsers() {
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState(null); // { user, delta }
  const [delta, setDelta] = useState('');
  const users = DB.allUsers();

  const apply = () => {
    const n = parseInt(delta, 10);
    if (!n || isNaN(n)) {
      toast('请输入有效数字（正数增加，负数扣除）', 'warning');
      return;
    }
    const r = DB.addCredits(editing.id, n, `管理员手动调整（${n > 0 ? '+' : ''}${n}）`);
    toast(r.ok ? `已${n > 0 ? '增加' : '扣除'} ${Math.abs(n)} 积分` : r.msg, r.ok ? 'success' : 'error');
    setEditing(null);
    setDelta('');
    setTick(tick + 1);
  };

  return (
    <div className="animate-fadeUp">
      <h2 className="text-xl font-bold mb-1">用户积分排行榜</h2>
      <p className="text-white/40 text-sm mb-6">点击用户可手动增加 / 扣除积分</p>

      {users.length === 0 ? (
        <div className="glass-dark rounded-3xl p-8 text-center text-white/40 text-sm">暂无注册用户</div>
      ) : (
        <div className="glass-dark rounded-3xl overflow-hidden">
          {users.map((u, i) => (
            <button
              key={u.id}
              onClick={() => setEditing(u)}
              className={`press w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 ${i > 0 ? 'border-t border-white/5' : ''}`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-400/20 text-amber-300' : i === 1 ? 'bg-slate-300/20 text-slate-200' : i === 2 ? 'bg-orange-400/20 text-orange-300' : 'bg-white/5 text-white/40'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90">{u.username}</p>
                <p className="text-[11px] text-white/35 mt-0.5">注册于 {u.createdAt}</p>
              </div>
              <span className="text-base font-bold text-violet-300">{u.credits.toLocaleString()}</span>
              <span className="text-[10px] text-white/30">积分</span>
            </button>
          ))}
        </div>
      )}

      {/* 调整积分弹窗 */}
      {editing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setEditing(null)} />
          <div className="relative glass-dark rounded-3xl p-6 w-full max-w-sm animate-fadeUp">
            <h3 className="font-bold text-center mb-1">调整积分</h3>
            <p className="text-xs text-white/40 text-center mb-4">
              {editing.username} · 当前 {editing.credits.toLocaleString()} 积分
            </p>
            <input
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
              placeholder="输入数量，如 1000 或 -500"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-violet-400/60"
            />
            <div className="flex gap-2 mt-3">
              {[1000, 5000, -1000].map((v) => (
                <button key={v} onClick={() => setDelta(String(v))} className="press flex-1 bg-white/5 rounded-xl py-2 text-xs text-white/60">
                  {v > 0 ? '+' : ''}{v}
                </button>
              ))}
            </div>
            <button onClick={apply} className="press btn-grad w-full rounded-2xl py-3 mt-4 font-semibold">
              确认调整
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
