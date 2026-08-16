import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/db.js';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useUser();
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = () => {
    if (!username.trim() || !password.trim()) {
      toast('请填写用户名和密码', 'warning');
      return;
    }
    const r = mode === 'login' ? DB.login(username.trim(), password) : DB.register(username.trim(), password);
    if (!r.ok) {
      toast(r.msg, 'error');
      return;
    }
    refresh();
    toast(mode === 'login' ? `欢迎回来，${r.user.username}` : '注册成功，已赠送 1000 积分', 'success');
    navigate('/');
  };

  return (
    <div className="pb-safe px-5 pt-12 animate-fadeUp flex flex-col items-center min-h-screen">
      <div className="w-16 h-16 rounded-[22px] btn-primary flex items-center justify-center mb-5 shadow-lg">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-8 h-8">
          <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-1.5">{mode === 'login' ? '登录 Nova' : '注册 Nova'}</h1>
      <p className="text-slate-400 text-sm mb-8">
        {mode === 'login' ? '登录后使用 AI 服务' : '注册即送 1000 积分体验'}
      </p>

      <div className="glass-light rounded-3xl p-5 w-full shadow-[0_4px_20px_rgba(30,40,90,0.06)]">
        <label className="text-xs text-slate-400 mb-2 block">用户名</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#4d6bfe]/50 mb-4"
        />
        <label className="text-xs text-slate-400 mb-2 block">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="请输入密码"
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-[#4d6bfe]/50"
        />
        <button onClick={submit} className="press btn-primary w-full rounded-2xl py-3.5 mt-5 text-white font-semibold">
          {mode === 'login' ? '登录' : '注册并登录'}
        </button>
        <button
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
          }}
          className="press w-full text-center text-xs text-slate-400 mt-4"
        >
          {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
        </button>
      </div>

      <button onClick={() => navigate('/')} className="press text-sm text-slate-400 mt-6">
        ← 返回首页
      </button>
    </div>
  );
}
