"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "注册失败");
      // 注册成功后自动登录
      const login = await signIn("credentials", { email, password, redirect: false });
      if (login?.error) {
        router.push("/login");
      } else {
        router.push("/studio");
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold">创建账号</h1>
        <p className="mt-1 text-sm text-zinc-500">免费版每天 10 次生成，注册即用</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">昵称（可选）</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="你的昵称" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">邮箱</label>
            <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">密码（至少 6 位）</label>
            <input type="password" required minLength={6} className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "创建中..." : "免费注册"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          已有账号？{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </main>
  );
}
