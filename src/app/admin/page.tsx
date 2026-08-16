"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Tab = "stats" | "users" | "orders" | "settings";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>("stats");
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      setDenied(true);
    }
  }, [status, session]);

  if (status === "loading") return <div className="p-20 text-center text-zinc-400">加载中...</div>;
  if (!session || denied)
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">需要管理员权限</h1>
        <Link href="/" className="btn-secondary">返回首页</Link>
      </main>
    );

  const tabs: { key: Tab; label: string }[] = [
    { key: "stats", label: "📊 数据统计" },
    { key: "users", label: "👥 用户管理" },
    { key: "orders", label: "🧾 订单管理" },
    { key: "settings", label: "⚙️ 系统设置" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">管理后台</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-brand-600 text-white"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "stats" && <StatsPanel />}
        {tab === "users" && <UsersPanel />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "settings" && <SettingsPanel />}
      </div>
    </main>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);
  if (!stats) return <div className="text-zinc-400">加载中...</div>;
  const items = [
    { label: "总用户数", value: stats.totalUsers },
    { label: "Pro 订阅", value: stats.proUsers },
    { label: "企业订阅", value: stats.entUsers },
    { label: "累计生成次数", value: stats.totalGenerations },
    { label: "累计收入", value: stats.revenueLabel },
    { label: "近 7 天新增用户", value: stats.recentUsers },
    { label: "近 7 天生成次数", value: stats.recentGens },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="card">
          <div className="text-sm text-zinc-500">{i.label}</div>
          <div className="mt-2 text-3xl font-bold">{i.value}</div>
        </div>
      ))}
    </div>
  );
}

function UsersPanel() {
  const [data, setData] = useState<any>(null);
  const [q, setQ] = useState("");

  function load(query = "") {
    fetch(`/api/admin/users?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function updateUser(id: string, patch: any) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    load(q);
  }
  async function deleteUser(id: string) {
    if (!confirm("确定删除该用户？此操作不可恢复。")) return;
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    load(q);
  }

  if (!data) return <div className="text-zinc-400">加载中...</div>;

  return (
    <div className="card overflow-x-auto p-0">
      <div className="flex items-center gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <input
          className="input-field max-w-xs"
          placeholder="搜索邮箱 / 昵称..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(q)}
        />
        <button className="btn-secondary" onClick={() => load(q)}>搜索</button>
        <span className="ml-auto text-sm text-zinc-400">共 {data.total} 个用户</span>
      </div>
      <table className="w-full">
        <thead className="border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="table-th">邮箱</th>
            <th className="table-th">计划</th>
            <th className="table-th">角色</th>
            <th className="table-th">注册时间</th>
            <th className="table-th">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.users.map((u: any) => (
            <tr key={u.id}>
              <td className="table-td">{u.email}</td>
              <td className="table-td">
                <select
                  className="input-field w-32 py-1 text-xs"
                  value={u.plan}
                  onChange={(e) => updateUser(u.id, { plan: e.target.value })}
                >
                  <option value="FREE">免费版</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">企业版</option>
                </select>
              </td>
              <td className="table-td">
                <span className={`badge ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                  {u.role}
                </span>
              </td>
              <td className="table-td text-xs">{new Date(u.createdAt).toLocaleDateString("zh-CN")}</td>
              <td className="table-td">
                <button className="btn-danger" onClick={() => deleteUser(u.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersPanel() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then(setData).catch(() => {});
  }, []);
  if (!data) return <div className="text-zinc-400">加载中...</div>;
  const statusMap: Record<string, { label: string; cls: string }> = {
    paid: { label: "已支付", cls: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" },
    pending: { label: "待支付", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
    canceled: { label: "已取消", cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" },
    refunded: { label: "已退款", cls: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
  };
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full">
        <thead className="border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="table-th">用户</th>
            <th className="table-th">计划</th>
            <th className="table-th">金额</th>
            <th className="table-th">状态</th>
            <th className="table-th">时间</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.orders.length === 0 && (
            <tr><td colSpan={5} className="table-td text-center text-zinc-400">暂无订单</td></tr>
          )}
          {data.orders.map((o: any) => {
            const s = statusMap[o.status] || statusMap.pending;
            return (
              <tr key={o.id}>
                <td className="table-td">{o.user?.email}</td>
                <td className="table-td">{o.plan}</td>
                <td className="table-td font-medium">${(o.amount / 100).toFixed(2)}</td>
                <td className="table-td"><span className={`badge ${s.cls}`}>{s.label}</span></td>
                <td className="table-td text-xs">{new Date(o.createdAt).toLocaleString("zh-CN")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SettingsPanel() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => setSettings(d.settings || {})).catch(() => {});
  }, []);

  async function save() {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = [
    { key: "site_name", label: "站点名称" },
    { key: "announcement", label: "公告内容" },
    { key: "free_daily_limit", label: "免费版每日额度" },
    { key: "pro_daily_limit", label: "Pro 版每日额度" },
    { key: "enterprise_daily_limit", label: "企业版每日额度" },
  ];

  return (
    <div className="card max-w-xl">
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-sm font-medium">{f.label}</label>
            <input
              className="input-field"
              value={settings[f.key] || ""}
              onChange={(e) => setSettings((s) => ({ ...s, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <button className="btn-primary mt-6" onClick={save}>
        {saved ? "✓ 已保存" : "保存设置"}
      </button>
    </div>
  );
}
