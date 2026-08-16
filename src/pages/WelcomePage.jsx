import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';

const FEATURES = [
  { icon: '💬', title: 'AI 智能对话', desc: '你问我答，随时解答任何问题', to: '/chat' },
  { icon: '✍️', title: 'AI 写作助手', desc: '文章、文案、周报一键生成', to: '/tools' },
  { icon: '🌐', title: '实时翻译', desc: '中英互译，准确流畅', to: '/tools' },
  { icon: '💡', title: '创意灵感', desc: '标题、点子、方案源源不断', to: '/tools' },
];

const STEPS = [
  { n: '01', t: '问它任何事', d: '像和朋友聊天一样提问' },
  { n: '02', t: '让它帮你写', d: '文章、文案、代码都能写' },
  { n: '03', t: '拿去真实使用', d: '发布到平台，创造价值' },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <div className="pb-safe px-5 pt-10 animate-fadeUp">
      {/* Logo + 标语 */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-[22px] btn-primary flex items-center justify-center mb-5 shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-8 h-8">
            <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          你好，我是 <span className="grad-text">Nova</span>
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">
          你的 AI 智能助手。你问我答，帮你写作、翻译、出点子，完全免费。
        </p>
      </div>

      {/* 主按钮 */}
      <button
        onClick={() => navigate('/chat')}
        className="press btn-primary w-full rounded-2xl py-4 text-white font-semibold text-base flex items-center justify-center gap-2 mb-3"
      >
        💬 开始对话
      </button>
      <button
        onClick={() => navigate('/tools')}
        className="press glass-light w-full rounded-2xl py-3.5 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 mb-8"
      >
        探索全部功能
      </button>

      {/* 功能卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {FEATURES.map((f) => (
          <button
            key={f.title}
            onClick={() => {
              navigate(f.to);
              toast(`进入「${f.title}」`, 'info');
            }}
            className="press glass-light rounded-3xl p-4 text-left shadow-[0_4px_20px_rgba(30,40,90,0.06)]"
          >
            <span className="text-2xl block mb-2.5">{f.icon}</span>
            <p className="text-sm font-semibold text-slate-800">{f.title}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* 使用步骤 */}
      <div className="glass-light rounded-3xl p-5 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">三步开始</h2>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-center gap-4">
              <span className="grad-text text-lg font-bold w-8 shrink-0">{s.n}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{s.t}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 诚实说明 */}
      <div className="rounded-3xl p-4 bg-amber-50 border border-amber-100">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          💛 诚实说明：Nova 提供真实可用的 AI 对话与创作能力。用它产出内容后，需自行发布到头条号、公众号等真实平台才能获得收益——没有任何软件能"自动赚真钱"，请警惕此类宣传。
        </p>
      </div>
    </div>
  );
}
