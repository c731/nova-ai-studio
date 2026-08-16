import React from 'react';
import { DB } from '../../services/db.js';
import { providerStatus } from '../../services/gateway.js';

export default function AdminDashboard() {
  const users = DB.allUsers();
  const calls = DB.callLogs();
  const orders = DB.allOrders();
  const providers = providerStatus();
  const online = providers.filter((p) => p.enabled).length;
  const totalCredits = users.reduce((s, u) => s + u.credits, 0);
  const revenue = orders.filter((o) => o.status === '已完成').length;

  const stats = [
    { label: '注册用户', value: users.length, color: 'from-violet-500/20 to-violet-500/5' },
    { label: '今日调用', value: calls.length, color: 'from-cyan-500/20 to-cyan-500/5' },
    { label: 'API 在线', value: `${online}/${providers.length}`, color: 'from-emerald-500/20 to-emerald-500/5' },
    { label: '流通积分', value: totalCredits.toLocaleString(), color: 'from-amber-500/20 to-amber-500/5' },
    { label: '完成订单', value: revenue, color: 'from-rose-500/20 to-rose-500/5' },
    { label: '失败日志', value: DB.failLogs().length, color: 'from-red-500/20 to-red-500/5' },
  ];

  return (
    <div className="animate-fadeUp">
      <h2 className="text-xl font-bold mb-1">管理仪表盘</h2>
      <p className="text-white/40 text-sm mb-6">全站运行状态总览</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`glass-dark rounded-3xl p-5 bg-gradient-to-b ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-white/45 mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 最近调用 */}
      <div className="glass-dark rounded-3xl p-5">
        <h3 className="font-semibold mb-4">最近 AI 调用</h3>
        {calls.length === 0 ? (
          <p className="text-sm text-white/40">暂无调用记录</p>
        ) : (
          <div className="space-y-3">
            {calls.slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-white/85 truncate">{c.service}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">{c.time} · {c.provider}</p>
                </div>
                <span className="text-rose-300 shrink-0 ml-3">-{c.credits} 积分</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
