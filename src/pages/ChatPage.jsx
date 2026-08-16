import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';
import { useUser } from '../context/UserContext.jsx';
import { DB, estimateTokens, tokensToCredits } from '../services/db.js';
import { chat } from '../services/gateway.js';

const SUGGESTIONS = [
  '帮我写一段小红书种草文案',
  '用简单的话解释什么是区块链',
  '给我 5 个短视频选题灵感',
  '写一封请假邮件',
];

export default function ChatPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, refresh } = useUser();
  const [messages, setMessages] = useState([
    { role: 'ai', content: '你好！我是 Nova，你问我答。无论是写东西、查知识还是出点子，都可以直接告诉我～' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    // 登录与积分校验（真实扣费）
    if (!user) {
      toast('请先登录后使用 AI 对话', 'warning');
      navigate('/login');
      return;
    }
    const cost = 2; // AI 对话基础消耗
    if (user.credits < cost) {
      toast('积分不足，请前往钱包充值', 'error');
      navigate('/wallet');
      return;
    }

    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      // 走聚合网关：自动故障转移，返回真实文本与命中的 provider
      const history = [...messages.slice(-8), { role: 'user', content: q }].map((m) => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content,
      }));
      const result = await chat(
        [{ role: 'system', content: '你是 Nova，一个友好、简洁的中文 AI 助手。回答清晰、自然、有帮助。' }, ...history],
        { temperature: 0.7 }
      );

      // 按真实 Token 消耗扣积分
      const tokens = estimateTokens(q + result.text);
      const credits = Math.max(cost, tokensToCredits(tokens));
      DB.addCredits(user.id, -credits, `AI 对话消耗（${tokens} Token）`);
      DB.logCall({ userId: user.id, service: 'AI 对话', provider: result.provider, tokens, credits, ok: true });
      refresh();

      setMessages((m) => [...m, { role: 'ai', content: result.text, provider: result.provider }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', content: '所有 AI 节点暂时不可用：' + e.message }]);
      toast('调用失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部栏 */}
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl btn-primary flex items-center justify-center">
          <span className="text-white text-sm">✦</span>
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-base">Nova 对话</h1>
          <p className="text-[11px] text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulseDot" />
            在线 · 真实 AI
          </p>
        </div>
      </header>

      {/* 消息区 */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeUp`}>
            <div
              className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'btn-primary text-white rounded-br-lg'
                  : 'glass-light text-slate-700 rounded-bl-lg shadow-[0_4px_16px_rgba(30,40,90,0.06)]'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fadeUp">
            <div className="glass-light rounded-3xl rounded-bl-lg px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4d6bfe] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#4d6bfe] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#4d6bfe] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* 推荐问题 */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="press shrink-0 glass-light rounded-full px-3.5 py-2 text-xs text-slate-600"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 输入区 */}
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom,0px)+88px)] pt-1">
        <div className="glass-light rounded-3xl p-2 flex items-center gap-2 shadow-[0_4px_20px_rgba(30,40,90,0.08)]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="输入你的问题…"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-slate-300"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="press btn-primary w-10 h-10 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
