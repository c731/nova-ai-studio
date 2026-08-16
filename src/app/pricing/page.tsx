"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const PLANS = [
  {
    key: "FREE",
    name: "免费版",
    price: "$0",
    period: "",
    features: ["每日 10 次生成", "短句 / 代码 / AI 聊天", "基础模型", "社区支持"],
    cta: "当前免费",
  },
  {
    key: "PRO",
    name: "Pro 版",
    price: "$9.9",
    period: "/月",
    hot: true,
    features: ["每日 500 次生成", "全部创作模式（含长篇小说）", "高级模型 + 更快响应", "历史记录云端保存", "邮件支持"],
    cta: "升级 Pro",
  },
  {
    key: "ENTERPRISE",
    name: "企业版",
    price: "$49.9",
    period: "/月",
    features: ["每日 5000 次生成", "API 接入额度", "团队协作（5 席位）", "优先模型通道", "专属客服 SLA"],
    cta: "升级企业版",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState("");
  const [msg, setMsg] = useState("");

  async function subscribe(planKey: string) {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    if (planKey === "FREE") return;
    setLoading(planKey);
    setMsg("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建支付失败");
      window.location.href = data.url; // 跳转到 Stripe Checkout
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setLoading("");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">选择适合你的方案</h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          安全支付由 Stripe 提供 · 随时可取消 · 支持测试卡 4242 4242 4242 4242
        </p>
      </div>

      {msg && (
        <div className="mx-auto mt-6 max-w-lg rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10">
          {msg}
        </div>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`card relative flex flex-col ${p.hot ? "border-brand-500 ring-2 ring-brand-500/30" : ""}`}
          >
            {p.hot && (
              <div className="badge absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white">
                最受欢迎
              </div>
            )}
            <h3 className="font-semibold">{p.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{p.price}</span>
              <span className="text-zinc-400">{p.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="mt-0.5 text-brand-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe(p.key)}
              disabled={p.key === "FREE" || loading === p.key}
              className={`${p.hot ? "btn-primary" : "btn-secondary"} mt-8 w-full`}
            >
              {loading === p.key ? "跳转支付中..." : p.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        <strong className="text-zinc-700 dark:text-zinc-200">支付说明：</strong>
        当前使用 Stripe 测试模式，可用测试卡 <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">4242 4242 4242 4242</code>（任意未来有效期 / 任意 CVC）体验完整订阅流程。
        切换真实收款只需在环境变量中替换为 Stripe 正式密钥（sk_live_）与正式价格 ID，详见 README。
        {!session && (
          <span className="ml-1">
            订阅前请先 <Link href="/register" className="text-brand-600 underline">注册账号</Link>。
          </span>
        )}
      </div>
    </main>
  );
}
