import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { DB } from '../services/db.js';

// 用户端菜单（对标哈基米公益站：浅灰白底 + 粉色/珊瑚高亮 + 大红徽章）
const USER_MENUS = [
  { key: 'overview', label: '概览', icon: '🏠' },
  { key: 'deals', label: '超值特惠', icon: '🎁', orange: true, hot: true },
  { key: 'services', label: '我的服务', icon: '🧰', badge: 2, expandable: true },
  { key: 'orders', label: '订单中心', icon: '📋' },
  { key: 'renew', label: '老用户续费', icon: '🔄' },
  { key: 'invite', label: '邀请活动', icon: '🤝' },
  { key: 'messages', label: '站内消息', icon: '✉️' },
  { key: 'settings', label: '账号设置', icon: '⚙️' },
  { key: 'help', label: '帮助与资源', icon: '📚', expandable: true },
];

// 管理员菜单（蓝紫色系仪表盘）
const ADMIN_MENUS = [
  { key: 'panel', label: '管理仪表盘', icon: '📊' },
  { key: 'users', label: '用户积分排行', icon: '🏆' },
  { key: 'gateway', label: '网关API健康', icon: '🛰️' },
  { key: 'logs', label: '调用失败日志', icon: '🚨' },
  { key: 'maintainer', label: '智能维护AI', icon: '🤖' },
];

export default function ServiceSidebar({ open, onClose, active, onSelect }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAdmin, logout } = useUser();
  const [expanded, setExpanded] = useState(null);

  const menus = isAdmin ? ADMIN_MENUS : USER_MENUS;

  const handleSelect = (m) => {
    if (isAdmin) {
      // 管理员菜单直接跳转独立后台
      const map = { panel: '/admin/panel', users: '/admin/panel/users', gateway: '/admin/panel/gateway', logs: '/admin/panel/logs', maintainer: '/admin/panel/maintainer' };
      navigate(map[m.key]);
      onClose();
      return;
    }
    if (m.expandable) {
      setExpanded(expanded === m.key ? null : m.key);
    }
    onSelect(m.key);
    if (m.key !== 'services' && m.key !== 'help') onClose();
  };

  const handleLogout = () => {
    logout();
    toast('已退出登录', 'info');
    onClose();
    navigate('/');
  };

  return (
    <>
      {/* 遮罩 */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* 侧边栏（右侧滑出，不覆盖全屏） */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[300px] max-w-[85vw] transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } ${isAdmin ? 'bg-[#12122a]' : 'bg-[#faf9f7]'} shadow-2xl flex flex-col`}
      >
        {/* 头部用户卡 */}
        <div className={`px-5 pt-6 pb-4 ${isAdmin ? 'bg-gradient-to-r from-indigo-900/60 to-violet-900/40' : 'bg-gradient-to-r from-rose-50 to-orange-50'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                isAdmin ? 'bg-gradient-to-br from-indigo-500 to-violet-500' : 'bg-gradient-to-br from-rose-400 to-orange-400'
              }`}
            >
              {isAdmin ? 'A' : (user?.username?.[0] || 'N').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${isAdmin ? 'text-white' : 'text-slate-800'}`}>
                {isAdmin ? '超级管理员' : user?.username || '未登录用户'}
              </p>
              <p className={`text-[11px] mt-0.5 ${isAdmin ? 'text-violet-300' : 'text-slate-400'}`}>
                {isAdmin ? '全站管理权限' : user ? `积分余额 ${user.credits.toLocaleString()}` : '登录后享受完整服务'}
              </p>
            </div>
            <button onClick={onClose} className={`press w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-white/10 text-white/60' : 'bg-white text-slate-400'}`}>
              ✕
            </button>
          </div>
        </div>

        {/* 菜单区 */}
        <div className="flex-1 overflow-y-auto py-3">
          {menus.map((m) => {
            const isActive = active === m.key && !isAdmin;
            return (
              <div key={m.key}>
                <button
                  onClick={() => handleSelect(m)}
                  className={`press w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                    isActive
                      ? isAdmin
                        ? 'bg-violet-500/20 text-violet-200'
                        : 'bg-rose-50 text-rose-600'
                      : isAdmin
                      ? 'text-slate-300 hover:bg-white/5'
                      : 'text-slate-600 hover:bg-rose-50/50'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className={`flex-1 text-sm font-medium ${m.orange && !isActive ? 'text-orange-500' : ''}`}>{m.label}</span>
                  {m.hot && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOT</span>}
                  {m.badge && <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{m.badge}</span>}
                  {m.expandable && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${expanded === m.key ? 'rotate-90' : ''}`}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
                {/* 展开子菜单 */}
                {m.expandable && expanded === m.key && (
                  <div className="animate-fadeIn">
                    {m.key === 'services' &&
                      ['AI 对话', 'AI 绘图'].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            onSelect('services');
                            onClose();
                          }}
                          className="press w-full text-left pl-14 pr-5 py-2.5 text-xs text-slate-500 hover:bg-rose-50/60 hover:text-rose-500"
                        >
                          · {s}
                        </button>
                      ))}
                    {m.key === 'help' &&
                      ['使用文档', '常见问题', '联系客服'].map((s) => (
                        <button
                          key={s}
                          onClick={() => toast(`「${s}」即将上线`, 'info')}
                          className="press w-full text-left pl-14 pr-5 py-2.5 text-xs text-slate-500 hover:bg-rose-50/60 hover:text-rose-500"
                        >
                          · {s}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 底部操作 */}
        <div className={`border-t px-5 py-4 space-y-2 ${isAdmin ? 'border-white/10' : 'border-slate-200/70'}`}>
          <button
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className={`press w-full rounded-xl py-2.5 text-sm font-medium ${isAdmin ? 'bg-white/10 text-white/80' : 'bg-white text-slate-600 border border-slate-200/70'}`}
          >
            返回首页
          </button>
          <button
            onClick={handleLogout}
            className={`press w-full rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${
              isAdmin ? 'bg-red-500/20 text-red-300' : 'bg-white text-red-500 border border-red-100'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            退出登录
          </button>
        </div>
      </aside>
    </>
  );
}
