import React, { useRef, useState } from 'react';
import { runMaintenance } from '../../services/maintainer.js';
import { DB } from '../../services/db.js';
import { useToast } from '../../components/Toast.jsx';

export default function AdminMaintainer() {
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([]);
  const [report, setReport] = useState(null);
  const logRef = useRef(null);

  const push = (step, detail) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setSteps((s) => [...s.slice(-40), `[${time}] ${step} → ${detail}`]);
    setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight }), 50);
  };

  const run = async () => {
    setRunning(true);
    setSteps([]);
    setReport(null);
    push('启动', '智能维护 AI 开始巡检（全部真实执行）');
    try {
      const r = await runMaintenance(push);
      setReport(r);
      toast(`巡检完成：新注册能力 ${r.registered.length} 个`, 'success');
    } catch (e) {
      push('错误', e.message);
      toast('巡检异常：' + e.message, 'error');
    } finally {
      setRunning(false);
    }
  };

  const capabilities = DB.capabilities();

  return (
    <div className="animate-fadeUp">
      <h2 className="text-xl font-bold mb-1">智能维护 AI</h2>
      <p className="text-white/40 text-sm mb-6">
        自动维护网站：真实健康检查 → 真实搜集免费 API → 真实探活 → 自动注册新能力（自我提升）→ AI 生成维护报告
      </p>

      <button
        onClick={run}
        disabled={running}
        className="press btn-grad w-full rounded-2xl py-4 font-semibold mb-5 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {running ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            智能 AI 巡检中…
          </>
        ) : (
          <>🤖 立即执行全站维护巡检</>
        )}
      </button>

      {/* 实时执行日志 */}
      {steps.length > 0 && (
        <div ref={logRef} className="bg-black/50 rounded-2xl p-4 h-44 overflow-y-auto font-mono text-[11px] leading-relaxed text-emerald-300/85 mb-5">
          {steps.map((s, i) => (
            <div key={i}>{s}</div>
          ))}
        </div>
      )}

      {/* 巡检报告 */}
      {report && (
        <div className="space-y-4 animate-fadeUp">
          {/* 健康检查 */}
          <div className="glass-dark rounded-3xl p-5">
            <h3 className="font-semibold mb-3">① 节点健康检查</h3>
            <div className="space-y-2">
              {report.health.map((h) => (
                <div key={h.name} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{h.name}</span>
                  <span className={h.ok ? 'text-emerald-300' : 'text-rose-300'}>
                    {h.status}{h.latency ? ` · ${h.latency}ms` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 新能力 */}
          <div className="glass-dark rounded-3xl p-5">
            <h3 className="font-semibold mb-3">② 自我提升结果（新注册能力 {report.registered.length}）</h3>
            {report.registered.length === 0 ? (
              <p className="text-sm text-white/40">本轮无新增（已注册过或无新可用 API）</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {report.registered.map((n) => (
                  <span key={n} className="text-xs bg-emerald-400/15 text-emerald-300 px-3 py-1.5 rounded-full">✓ {n}查询</span>
                ))}
              </div>
            )}
          </div>

          {/* AI 维护报告 */}
          <div className="glass-dark rounded-3xl p-5">
            <h3 className="font-semibold mb-3">③ AI 维护报告（真实 AI 生成）</h3>
            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{report.aiSummary}</p>
          </div>
        </div>
      )}

      {/* 当前站点能力 */}
      <div className="glass-dark rounded-3xl p-5 mt-4">
        <h3 className="font-semibold mb-3">当前站点能力（{capabilities.length}）</h3>
        <div className="space-y-2.5">
          {capabilities.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="text-white/85">{c.name}</p>
                {c.desc && <p className="text-[10px] text-white/35 mt-0.5">{c.desc}</p>}
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full ${c.builtin ? 'bg-white/5 text-white/40' : 'bg-emerald-400/15 text-emerald-300'}`}>
                {c.builtin ? '内置' : 'AI自动接入'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
