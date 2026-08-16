import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';

export default function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const tapRef = useRef({ count: 0, timer: null });
  const [usage] = useState({ chats: 36, tools: 18, days: 12 });

  // 隐藏管理员入口：连续点击版本号 5 次解锁
  const unlockAdmin = () => {
    const r = tapRef.current;
    r.count += 1;
    clearTimeout(r.timer);
    r.timer = setTimeout(() => (r.count = 0), 1500);
    if (r.count === 3) toast('再点击 2 次进入管理后台', 'info');
    if (r.count >= 5) {
      r.count = 0;
      toast('管理后台已解锁', 'success');
      navigate('/admin');
    }
  };

  const MENU = [
    { icon: '💬', label: '我的对话', desc: '历史对话记录', action: () => toast('对话记录已同步', 'info') },
    { icon: '⭐', label: '我的收藏', desc: '收藏的内容', action: () => toast('暂无收藏内容', 'info') },
    { icon: '🔔', label: '消息通知', desc: '系统消息', action: () => toast('暂无新消息', 'info') },
    { icon: '🎧', label: '帮助与反馈', desc: '常见问题', action: () => toast('感谢反馈，我们会持续改进', 'success') },
  ];

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      {/* 用户卡片 */}
      <div className="glass-light rounded-3xl p-5 mb-5 shadow-[0_4px_20px_rgba(30,40,90,0.06)] flex items-center gap-4">
        <div className="w-14 h-14 rounded-full btn-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
          N
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800">Nova 用户</p>
          <p className="text-[11px] text-slate-400 mt-0.5">免费版 · 全部 AI 功能开放</p>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full shrink-0">使用中</span>
      </div>

      {/* 使用统计 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { v: usage.chats, l: '对话次数' },
          { v: usage.tools, l: '功能使用' },
          { v: usage.days, l: '使用天数' },
        ].map((s) => (
          <button
            key={s.l}
            onClick={() => toast('统计数据实时更新中', 'info')}
            className="press glass-light rounded-3xl py-4 text-center"
          >
            <p className="text-xl font-bold grad-text">{s.v}</p>
            <p className="text-[11px] text-slate-400 mt-1">{s.l}</p>
          </button>
        ))}
      </div>

      {/* 菜单 */}
      <div className="glass-light rounded-3xl mb-5 overflow-hidden">
        {MENU.map((m, i) => (
          <button
            key={m.label}
            onClick={m.action}
            className={`press w-full flex items-center gap-3.5 px-5 py-4 text-left ${i > 0 ? 'border-t border-slate-100/80' : ''}`}
          >
            <span className="text-lg">{m.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{m.label}</p>
              <p className="text-[11px] text-slate-400">{m.desc}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-slate-300">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>

      {/* 关于 + 隐藏管理员入口 */}
      <div className="text-center">
        <p className="text-xs text-slate-400 mb-1">Nova AI Studio</p>
        <button onClick={unlockAdmin} className="press text-[11px] text-slate-300">
          v3.1.0 · 为创作者而生
        </button>
      </div>
    </div>
  );
}
