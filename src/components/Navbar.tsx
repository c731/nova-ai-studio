"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";

  const navLinks = [
    { href: "/studio", label: "创作台" },
    { href: "/pricing", label: "定价" },
    ...(isAdmin ? [{ href: "/admin", label: "管理后台" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-white">
            ✦
          </span>
          <span>Nova AI Studio</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="切换主题"
            className="rounded-lg border border-zinc-200 p-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {status === "authenticated" ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                <span className="hidden sm:inline">{user?.name || user?.email}</span>
                <span className="badge bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {user?.plan === "PRO" ? "Pro" : user?.plan === "ENTERPRISE" ? "企业" : "免费"}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <Link href="/billing" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    订阅与账单
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-secondary hidden sm:inline-flex">
                登录
              </Link>
              <Link href="/register" className="btn-primary">
                免费注册
              </Link>
            </>
          )}

          <button
            className="rounded-lg border border-zinc-200 p-2 md:hidden dark:border-zinc-800"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="菜单"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-200 px-4 py-2 md:hidden dark:border-zinc-800">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
