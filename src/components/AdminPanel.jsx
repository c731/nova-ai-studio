import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/db.js';
import { providerStatus } from '../services/gateway.js';
import { useToast } from '../components/Toast.jsx';

// 蓝紫色系管理面板（管理员在服务中心看到的仪表盘）
export default function AdminPanel() {
  const navigate = useNavigate();
  const toast = useToast();
  const users = DB.allUsers();
  const calls = DB.callLogs();
  const today = new Date().toLocaleDateString('zh-CN');
  const todayCalls = calls.filter((c) => (c.time || '').startsWith(today.split('/').join('/'))).length;
  const providers = providerStatus();
  const onlineCount = providers.filter((p) => p.enabled).length;

  return (
    <div className="space-y-4 animate-fadeUp">
      {/* 全局统计 */}
      <div className="rounded-3xl p-5 text-white bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
        <p className="text-white/70 text-xs mb-3">全站实时统计</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">{todayCalls}</p>
            <p className="text-[10px] text-white/60 mt-1">今日调用</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{onlineCount}/{providers.length}</p>
            <p className="text-[10px] text-white/60 mt-1">API 在线</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-[10px] text-white/60 mt-1">注册用户</p>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '🏆', t: '用户积分排行', d: '查看/增删积分', to: '/admin/panel/users' },
          { icon: '🛰️', t: '网关API健康', d: '节点状态监控', to: '/admin/panel/gateway' },
          { icon: '🚨', t: '失败日志', d: `${DB.failLogs().length} 条记录`, to: '/admin/panel/logs' },
          { icon: '🤖', t: '智能维护AI', d: '自动搜集免费API', to: '/admin/panel/maintainer' },
        ].map((c) => (
          <button key={c.t} onClick={() => navigate(c.to)} className="press rounded-3xl p-4 text-left bg-gradient-to-b from-indigo-50 to-violet-50 border border-violet-100">
            <span className="text-xl block mb-2">{c.icon}</span>
            <p className="text-sm font-bold text-indigo-900">{c.t}</p>
            <p className="text-[10px] text-indigo-400 mt-0.5">{c.d}</p>
          </button>
        ))}
      </div>

      {/* 积分排行榜预览 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 text-sm">🏆 积分排行榜</h2>
          <button onClick={() => navigate('/admin/panel/users')} className="press text-xs text-violet-500">管理积分</button>
        </div>
        {users.length === 0 ? (
          <p className="text-xs text-slate-400">暂无注册用户</p>
        ) : (
          <div className="space-y-2.5">
            {users.slice(0, 5).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                <span className="flex-1 text-sm text-slate-700">{u.username}</span>
                <span className="text-sm font-bold text-indigo-600">{u.credits.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => toast('完整管理功能请使用独立后台', 'info')}
        className="press w-full rounded-2xl py-3 bg-indigo-50 text-indigo-500 text-sm font-semibold"
      >
        进入完整管理后台 →
      </button>
    </div>
  );
}
