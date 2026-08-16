import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DB } from '../services/db.js';
import { imageUrl } from '../services/gateway.js';
import { useUser } from '../context/UserContext.jsx';
import { useToast } from '../components/Toast.jsx';

const DRAW_COST = 50;

const STYLES = [
  { id: '', label: '默认' },
  { id: 'digital art, vibrant', label: '数字艺术' },
  { id: 'watercolor painting', label: '水彩' },
  { id: 'cyberpunk, neon', label: '赛博朋克' },
  { id: 'studio ghibli style', label: '吉卜力' },
];

export default function DrawPage() {
  const navigate = useNavigate();
  const { user, refresh } = useUser();
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    if (!user) {
      toast('请先登录后使用 AI 绘图', 'warning');
      navigate('/login');
      return;
    }
    if (!prompt.trim()) {
      toast('请输入画面描述', 'warning');
      return;
    }
    if (user.credits < DRAW_COST) {
      toast('积分不足，请前往钱包充值', 'error');
      return;
    }
    // 真实扣积分
    const r = DB.addCredits(user.id, -DRAW_COST, `AI 绘图消耗（${DRAW_COST}积分/张）`);
    if (!r.ok) {
      toast(r.msg, 'error');
      return;
    }
    refresh();
    setLoading(true);
    const fullPrompt = style ? `${prompt.trim()}, ${style}` : prompt.trim();
    const url = imageUrl(fullPrompt);
    setImg({ url, prompt: prompt.trim() });
    toast(`已扣除 ${DRAW_COST} 积分，正在生成…`, 'info');
  };

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">AI 绘图</h1>
        <p className="text-slate-400 text-sm">真实图像生成 · 每张消耗 {DRAW_COST} 积分</p>
      </header>

      <div className="glass-light rounded-3xl p-4 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="描述你想生成的画面，例如：一只在星空下飞翔的白猫"
          className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-slate-300"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {STYLES.map((s) => (
          <button
            key={s.label}
            onClick={() => setStyle(s.id)}
            className={`press shrink-0 rounded-full px-4 py-2 text-xs ${
              style === s.id ? 'btn-primary text-white font-medium' : 'glass-light text-slate-500'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="press btn-primary w-full rounded-2xl py-4 text-white font-semibold disabled:opacity-60"
      >
        🎨 立即生成（-{DRAW_COST} 积分）
      </button>

      {img && (
        <div className="glass-light rounded-3xl p-4 mt-5 animate-fadeUp">
          {loading && (
            <div className="aspect-square rounded-2xl shimmer flex items-center justify-center mb-3">
              <span className="text-xs text-slate-400">AI 绘制中，约需 10-30 秒…</span>
            </div>
          )}
          <img
            src={img.url}
            alt={img.prompt}
            onLoad={() => {
              setLoading(false);
              DB.logCall({ userId: user.id, service: 'AI 绘图', provider: 'Pollinations图像引擎', tokens: 0, credits: DRAW_COST, ok: true });
              toast('绘图完成', 'success');
            }}
            onError={() => {
              setLoading(false);
              toast('生成失败，积分已退', 'error');
              DB.addCredits(user.id, DRAW_COST, '绘图失败退还');
              refresh();
              setImg(null);
            }}
            className={`w-full rounded-2xl ${loading ? 'hidden' : ''}`}
          />
          {!loading && <p className="text-[11px] text-slate-400 mt-3">「{img.prompt}」</p>}
        </div>
      )}
    </div>
  );
}
