import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../components/Toast.jsx';

const TYPE_COLOR = {
  文章: 'bg-violet-400/15 text-violet-300',
  小说: 'bg-pink-400/15 text-pink-300',
  文案: 'bg-cyan-400/15 text-cyan-300',
  代码: 'bg-emerald-400/15 text-emerald-300',
  社交媒体: 'bg-amber-400/15 text-amber-300',
};

export default function LibraryPage() {
  const { state } = useApp();
  const toast = useToast();

  return (
    <div className="pb-safe px-5 pt-8 animate-fadeUp">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">作品库</h1>
          <p className="text-white/45 text-sm">共 {state.works.length} 件 AI 作品</p>
        </div>
        <button
          onClick={() => toast('已导出全部作品', 'success')}
          className="press glass rounded-full px-4 py-2 text-xs text-white/75 flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          导出
        </button>
      </header>

      <div className="space-y-3">
        {state.works.map((w) => (
          <button
            key={w.id}
            onClick={() => toast(`打开作品「${w.title}」`, 'info')}
            className="press glass rounded-3xl p-4 w-full text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/90 truncate">{w.title}</p>
                <p className="text-[11px] text-white/40 mt-1">
                  {w.time} · {w.words} 字
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLOR[w.type] || 'bg-white/10 text-white/60'}`}>
                {w.type}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-[11px] text-white/40">已产生收益</span>
              <span className="text-emerald-300 text-sm font-semibold">+¥{w.earning.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
