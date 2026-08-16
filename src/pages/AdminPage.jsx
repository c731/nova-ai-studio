import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function AdminPage() {
  const { state, update } = useApp();
  const { isAdmin: userIsAdmin, setIsAdmin } = useUser();
  const toast = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  // 已认证则直接进入管理后台
  useEffect(() => {
    if (userIsAdmin) navigate('/admin/panel', { replace: true });
  }, [userIsAdmin]);

  const login = () => {
    if (!code.trim()) {
      toast('请输入管理员密钥', 'warning');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      if (code.trim() === 'admin888' || code.trim() === 'nova2026') {
        update({ isAdmin: true });
        setIsAdmin(true);
        toast('管理员认证成功，正在进入后台', 'success');
        navigate('/admin/panel', { replace: true });
      } else {
        toast('密钥错误，认证失败', 'error');
      }
      setBusy(false);
      setCode('');
    }, 700);
  };

  // 认证页（认证通过后自动跳转 /admin/panel 管理后台）
  return (
    <div className="px-5 pt-12 pb-10 animate-fadeUp flex flex-col items-center min-h-screen">
      <div className="w-16 h-16 rounded-3xl btn-grad flex items-center justify-center mb-5 shadow-glow">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-8 h-8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-1.5 text-white">管理员认证</h1>
      <p className="text-white/45 text-sm mb-8 text-center">此区域仅限管理员访问</p>

      <div className="glass-dark rounded-3xl p-5 w-full mb-4">
        <label className="text-xs text-white/45 mb-2 block">管理员密钥</label>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          placeholder="请输入管理员密钥"
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-brand-violet/60 transition-colors"
        />
        <button
          onClick={login}
          disabled={busy}
          className="press btn-grad w-full rounded-2xl py-3.5 mt-4 font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              验证中…
            </>
          ) : (
            '立即认证'
          )}
        </button>
        <p className="text-[11px] text-white/30 text-center mt-3">演示密钥：admin888</p>
      </div>

      <button onClick={() => navigate('/')} className="press text-sm text-white/40">
        ← 返回用户端
      </button>
    </div>
  );
}
