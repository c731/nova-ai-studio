import React from 'react';
import { DB } from '../../services/db.js';
import { useToast } from '../../components/Toast.jsx';

export default function AdminLogs() {
  const toast = useToast();
  const fails = DB.failLogs();
  const calls = DB.callLogs();

  return (
    <div className="animate-fadeUp">
      <h2 className="text-xl font-bold mb-1">调用日志与失败记录</h2>
      <p className="text-white/40 text-sm mb-6">故障转移过程中每个失败节点都会被真实记录</p>

      {/* 失败日志 */}
      <div className="glass-dark rounded-3xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-rose-300">🚨 AI 调用失败日志（{fails.length}）</h3>
        </div>
        {fails.length === 0 ? (
          <p className="text-sm text-white/40">暂无失败记录，所有节点运行正常</p>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {fails.map((f) => (
              <div key={f.id} className="bg-rose-500/8 border border-rose-500/15 rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-rose-200 font-medium">{f.provider}</span>
                  <span className="text-[10px] text-white/30">{f.time}</span>
                </div>
                <p className="text-[11px] text-rose-300/70 mt-1 font-mono">{f.error}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 全站调用流水 */}
      <div className="glass-dark rounded-3xl p-5">
        <h3 className="font-semibold mb-4">全站调用流水（{calls.length}）</h3>
        {calls.length === 0 ? (
          <p className="text-sm text-white/40">暂无调用记录</p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {calls.map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-sm">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.ok ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 truncate">{c.service} · {c.provider}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{c.time} · {c.tokens} Token</p>
                </div>
                <span className="text-rose-300 text-xs shrink-0">-{c.credits}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
