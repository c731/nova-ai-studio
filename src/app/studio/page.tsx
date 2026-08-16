"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const MODES = [
  {
    key: "short",
    icon: "✍️",
    label: "短句",
    grad: "from-pink-500 to-rose-500",
    placeholder: "输入一个主题，如：秋天的思念",
    examples: ["秋天的思念", "深夜加班的打工人", "周末的松弛感"],
  },
  {
    key: "novel",
    icon: "📖",
    label: "小说",
    grad: "from-violet-500 to-purple-500",
    placeholder: "输入小说设定或开头，如：一个失忆的侦探",
    examples: ["一个失忆的侦探", "末日里的最后一家书店", "穿越成反派的我"],
  },
  {
    key: "code",
    icon: "💻",
    label: "代码",
    grad: "from-sky-500 to-cyan-500",
    placeholder: "描述需求，如：用 Python 写一个快速排序",
    examples: ["Python 快速排序", "JS 防抖函数", "正则校验手机号"],
  },
  {
    key: "chat",
    icon: "💬",
    label: "AI 聊天",
    grad: "from-emerald-500 to-teal-500",
    placeholder: "问我任何问题...",
    examples: ["如何高效学习一门新语言？", "帮我想 5 个副业点子", "解释一下什么是复利"],
  },
];

export default function StudioPage() {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState("short");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [displayed, setDisplayed] = useState(""); // 打字机显示的内容
  const [engine, setEngine] = useState("");
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needUpgrade, setNeedUpgrade] = useState(false);
  const [copied, setCopied] = useState(false);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMode = MODES.find((m) => m.key === mode)!;

  // 打字机效果
  useEffect(() => {
    if (!output) {
      setDisplayed("");
      return;
    }
    setDisplayed("");
    let i = 0;
    if (typeTimer.current) clearInterval(typeTimer.current);
    typeTimer.current = setInterval(() => {
      i += 3; // 每次 3 字符，长文也不会太慢
      setDisplayed(output.slice(0, i));
      if (i >= output.length && typeTimer.current) {
        clearInterval(typeTimer.current);
      }
    }, 12);
    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current);
    };
  }, [output]);

  if (status === "loading") {
    return <main className="flex min-h-[60vh] items-center justify-center text-zinc-400">加载中...</main>;
  }
  if (!session) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="text-2xl font-bold">请先登录</h1>
        <p className="text-zinc-500">登录后即可免费使用 AI 创作功能</p>
        <div className="flex gap-3">
          <Link href="/login" className="btn-primary">去登录</Link>
          <Link href="/register" className="btn-secondary">免费注册</Link>
        </div>
      </main>
    );
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setNeedUpgrade(false);
    setOutput("");
    setCopied(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode, prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        if (data.needUpgrade) setNeedUpgrade(true);
        return;
      }
      setOutput(data.output);
      setEngine(data.engine);
      if (data.usage) setUsage(data.usage);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const usagePct = usage ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* 标题区 */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">创作台</h1>
          <p className="mt-1 text-sm text-zinc-500">选择模式，输入内容，一键生成</p>
        </div>
        <Link href="/pricing" className="btn-secondary text-xs">✨ 升级 Pro 解锁更多</Link>
      </div>

      {/* 今日额度进度条 */}
      {usage && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-zinc-500">今日额度</span>
            <span className="font-medium text-brand-500">{usage.used} / {usage.limit} 次</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>
      )}

      {/* 模式选择 */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setOutput(""); setError(""); }}
            className={`group relative overflow-hidden rounded-xl border p-4 text-left transition ${
              mode === m.key
                ? "border-transparent ring-2 ring-brand-500"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            }`}
          >
            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${m.grad} text-xl shadow`}>
              {m.icon}
            </div>
            <div className="text-sm font-medium">{m.label}</div>
            {mode === m.key && (
              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">✓</div>
            )}
          </button>
        ))}
      </div>

      {/* 输入区 */}
      <div className="card">
        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder={currentMode.placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleGenerate();
          }}
        />
        {/* 示例提示词 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400">试试：</span>
          {currentMode.examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 transition hover:border-brand-400 hover:text-brand-500 dark:border-zinc-700"
            >
              {ex}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-zinc-400">{prompt.length}/4000 字 · Ctrl+Enter 快速生成</span>
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="btn-primary px-6">
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                AI 思考中...
              </>
            ) : (
              "✦ 一键生成"
            )}
          </button>
        </div>
      </div>

      {/* 错误 / 升级提示 */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10">
          {error}
          {needUpgrade && (
            <Link href="/pricing" className="ml-2 font-medium underline">查看升级方案 →</Link>
          )}
        </div>
      )}

      {/* 输出区 */}
      {(displayed || loading) && (
        <div className="card mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              生成结果
              {loading && <span className="text-xs font-normal text-zinc-400">生成中...</span>}
            </h3>
            <div className="flex items-center gap-2">
              {engine && !loading && (
                <span className="badge bg-zinc-100 text-zinc-500 dark:bg-zinc-800">⚡ {engine}</span>
              )}
              {output && !loading && (
                <button
                  onClick={handleCopy}
                  className={`btn-secondary px-3 py-1 text-xs transition ${copied ? "!border-green-400 !text-green-600" : ""}`}
                >
                  {copied ? "✓ 已复制" : "复制"}
                </button>
              )}
            </div>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-sm leading-relaxed dark:bg-zinc-950">
            {displayed}
            {loading && <span className="inline-block h-4 w-0.5 animate-blink bg-brand-500 align-middle" />}
          </pre>
        </div>
      )}
    </main>
  );
}
