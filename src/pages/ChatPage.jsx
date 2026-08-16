import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../components/Toast.jsx';

const SUGGESTIONS = [
  '帮我写一段小红书种草文案',
  '用简单的话解释什么是区块链',
  '给我 5 个短视频选题灵感',
  '写一封请假邮件',
];

export default function ChatPage() {
  const toast = useToast();
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
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: '你是 Nova，一个友好、简洁的中文 AI 助手。回答清晰、自然、有帮助。' },
            ...[...messages.slice(-8), { role: 'user', content: q }].map((m) => ({
              role: m.role === 'ai' ? 'assistant' : m.role,
              content: m.content,
            })),
          ],
        }),
      });
      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content || '抱歉，这次没有生成回答，请再试一次。';
      setMessages((m) => [...m, { role: 'ai', content: answer }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', content: '网络开小差了，请稍后再试。' }]);
      toast('网络异常，请重试', 'error');
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
