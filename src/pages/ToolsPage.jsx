import React, { useState } from 'react';
import { useToast } from '../components/Toast.jsx';

const TOOLS = [
  { id: 'article', icon: '📝', name: '文章写作', desc: '深度长文、公众号文章', sys: '你是一位资深专栏作家，用中文写出结构清晰、观点鲜明的文章。' },
  { id: 'copy', icon: '📣', name: '营销文案', desc: '种草文案、广告语', sys: '你是顶尖广告文案，用中文写有感染力、能打动人心的文案。' },
  { id: 'translate', icon: '🌐', name: '智能翻译', desc: '中英互译，信达雅', sys: '你是专业翻译。用户给中文就译成英文，给英文就译成中文，只输出译文。' },
  { id: 'idea', icon: '💡', name: '创意灵感', desc: '选题、标题、点子', sys: '你是创意总监，用中文给出新颖、具体、可执行的创意和选题，分点列出。' },
  { id: 'code', icon: '⌨️', name: '代码助手', desc: '写代码、解释代码', sys: '你是全栈工程师，输出简洁、可直接运行的代码，附简短中文说明。' },
  { id: 'summary', icon: '📋', name: '总结提炼', desc: '长文秒变要点', sys: '你是信息提炼专家，把用户给的内容总结成清晰的中文要点。' },
];

export default function ToolsPage() {
  const toast = useToast();
  const [active, setActive] = useState(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!input.trim()) {
      toast('请先输入内容', 'warning');
      return;
    }
    setLoading(true);
    setOutput('');
    try {
      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: active.sys },
            { role: 'user', content: input },
          ],
        }),
      });
      const data = await res.json();
      setOutput(data?.choices?.[0]?.message?.content || '（未生成内容，请重试）');
      toast('生成完成', 'success');
    } catch (e) {
      toast('网络异常，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">功能中心</h1>
        <p className="text-slate-400 text-sm">全部功能真实可用，免费使用</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActive(t);
              setInput('');
              setOutput('');
              toast(`已打开「${t.name}」`, 'info');
            }}
            className="press glass-light rounded-3xl p-4 text-left shadow-[0_4px_20px_rgba(30,40,90,0.06)]"
          >
            <span className="text-2xl block mb-2.5">{t.icon}</span>
            <p className="text-sm font-semibold text-slate-800">{t.name}</p>
            <p className="text-[11px] text-slate-400 mt-1">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* 工具弹层 */}
      {active && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center" onClick={() => setActive(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fadeIn" />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-[28px] p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] max-h-[85vh] overflow-y-auto animate-fadeUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <span>{active.icon}</span>
                {active.name}
              </h2>
              <button onClick={() => setActive(null)} className="press w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                ✕
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              placeholder={active.id === 'translate' ? '粘贴要翻译的内容…' : '输入你的需求或内容…'}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#4d6bfe]/50 resize-none"
            />
            <button
              onClick={run}
              disabled={loading}
              className="press btn-primary w-full rounded-2xl py-3.5 mt-3 text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  生成中…
                </>
              ) : (
                '立即生成'
              )}
            </button>

            {output && (
              <div className="mt-4 bg-slate-50 rounded-2xl p-4 animate-fadeUp">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">结果</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(output);
                      toast('已复制到剪贴板', 'success');
                    }}
                    className="press text-xs text-[#4d6bfe]"
                  >
                    复制
                  </button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{output}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
