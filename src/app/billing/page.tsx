"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BillingContent() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const user = session?.user as any;

  if (status === "loading") return <div className="p-20 text-center text-zinc-400">加载中...</div>;
  if (!session)
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">请先登录</h1>
        <Link href="/login" className="btn-primary">去登录</Link>
      </main>
    );

  const planLabel = user?.plan === "PRO" ? "Pro 版" : user?.plan === "ENTERPRISE" ? "企业版" : "免费版";

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold">订阅与账单</h1>

      {success && (
        <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10">
          🎉 支付成功！你的订阅已生效（Webhook 确认后自动升级，通常几秒内完成）。
        </div>
      )}

      <div className="card mt-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-500">当前方案</div>
            <div className="mt-1 text-2xl font-bold">{planLabel}</div>
            <div className="mt-1 text-sm text-zinc-400">{user?.email}</div>
          </div>
          <Link href="/pricing" className="btn-primary">
            {user?.plan === "FREE" ? "升级订阅" : "管理订阅"}
          </Link>
        </div>
      </div>

      <div className="card mt-6 text-sm text-zinc-500">
        <p>· 订阅通过 Stripe 管理，支持随时取消，取消后当期结束不再扣费。</p>
        <p className="mt-2">· 测试模式下不会产生真实扣款；切换真实模式后为正式订阅。</p>
      </div>
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-zinc-400">加载中...</div>}>
      <BillingContent />
    </Suspense>
  );
}
