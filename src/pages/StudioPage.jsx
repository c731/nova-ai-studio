import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../components/Toast.jsx';

const MODES = [
  { id: 'article', label: '文章', icon: '📄' },
  { id: 'novel', label: '小说', icon: '📖' },
  { id: 'copy', label: '文案', icon: '💬' },
  { id: 'code', label: '代码', icon: '⌨️' },
  { id: 'social', label: '社交媒体', icon: '📱' },
];

const QUICK = [
  { label: 'AI与未来工作', prompt: '写一篇深度文章，探讨AI如何改变未来5年的工作方式' },
  { label: '短视频脚本', prompt: '撰写一篇爆款短视频脚本，主题是副业赚钱的5个方法' },
  { label: '商务邮件', prompt: '写一封专业的商务邮件，向客户介绍我们的SaaS产品' },
];

export default function StudioPage() {
  const { state, update } = useApp();
  const toast = useToast();
  const [mode, setMode] = useState('article');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const generate = async () => {
    if (!prompt.trim()) {
      toast('请先输入创作主题', 'warning');
      return;
    }
    setLoading(true);
    setOutput('');
    toast('AI 开始创作…', 'info');
    try {
      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: '你是一位专业的中文内容创作者，输出结构清晰、语言自然的高质量内容。' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '（本次生成未返回内容，请重试）';
      setOutput(text);
      const work = {
        id: Date.now(),
        type: MODES.find((m) => m.id === mode)?.label || '文章',
        title: prompt.slice(0, 24),
        time: '刚刚',
        words: text.length,
        earning: +(Math.random() * 3 + 0.5).toFixed(2),
      };
      update((s) => ({ works: [work, ...s.works] }));
      toast('创作完成，已存入作品库', 'success');
    } catch (e) {
      setOutput('网络异常，请稍后重试。');
      toast('生成失败，请检查网络', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">AI 创作台</h1>
        <p className="text-white/45 text-sm">选择模板，输入灵感，AI 即刻生成</p>
      </header>

      {/* Mode chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              toast(`已切换到「${m.label}」模式`, 'info');
            }}
            className={`press shrink-0 rounded-full px-4 py-2 text-sm flex items-center gap-1.5 ${
              mode === m.id ? 'btn-grad text-white font-medium' : 'glass text-white/60'
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* Prompt input */}
      <div className="glass rounded-3xl p-4 mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="例如：写一篇关于 AI 改变未来的深度文章…"
          className="w-full bg-transparent resize-none outline-none text-sm text-white/90 placeholder:text-white/25"
        />
        <div className="flex items-center justify-between text-[11px] text-white/35 pt-2 border-t border-white/5">
          <span>{prompt.length} 字 · 建议 20-200 字</span>
          <button
            onClick={() => {
              setPrompt('');
              toast('已清空', 'info');
            }}
            className="press text-white/50"
          >
            清空
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-5">
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => {
              setPrompt(q.prompt);
              toast('已填入模板', 'success');
            }}
            className="press glass rounded-full px-3.5 py-1.5 text-xs text-white/65"
          >
            ✨ {q.label}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={loading}
        className="press btn-grad w-full rounded-2xl py-4 text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            AI 正在创作…
          </>
        ) : (
          <>✦ 立即生成</>
        )}
      </button>

      {/* Output */}
      {output && (
        <div className="glass rounded-3xl p-5 mt-5 animate-fadeUp">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">生成结果</h2>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(output);
                toast('已复制到剪贴板', 'success');
              }}
              className="press text-xs text-violet-300"
            >
              复制
            </button>
          </div>
          <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{output}</p>
        </div>
      )}
    </div>
  );
}
