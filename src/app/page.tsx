import Link from "next/link";

const features = [
  {
    icon: "✍️",
    title: "一键生成短句",
    desc: "输入主题，秒出打动人心的文案短句，适合朋友圈、小红书、短视频文案。",
    grad: "from-pink-500 to-rose-500",
  },
  {
    icon: "📖",
    title: "小说创作",
    desc: "给一个灵感，AI 帮你续写引人入胜的小说章节，长篇连载不再是梦。",
    grad: "from-violet-500 to-purple-500",
  },
  {
    icon: "💻",
    title: "代码生成",
    desc: "描述需求，生成可运行的高质量代码，附注释说明，支持多种语言。",
    grad: "from-sky-500 to-cyan-500",
  },
  {
    icon: "💬",
    title: "AI 聊天",
    desc: "随时与 AI 对话，解答问题、头脑风暴、学习辅导，7×24 小时在线。",
    grad: "from-emerald-500 to-teal-500",
  },
];

const steps = [
  { n: "01", title: "注册账号", desc: "30 秒免费注册，每天 10 次免费额度立刻到账" },
  { n: "02", title: "选择模式", desc: "短句 / 小说 / 代码 / 聊天，四种创作模式任选" },
  { n: "03", title: "一键生成", desc: "输入想法，AI 秒出结果，一键复制直接使用" },
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* ===== Hero ===== */}
      <section className="relative">
        {/* 动态光晕背景 */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-blob absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="animate-blob animation-delay-2000 absolute top-20 right-1/4 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="animate-blob animation-delay-4000 absolute top-64 left-1/2 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center sm:pt-28">
          <div className="animate-fade-up badge mx-auto mb-6 border border-brand-500/30 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            ✦ 新一代 AI 内容创作平台 · 免费开始
          </div>
          <h1 className="animate-fade-up animation-delay-100 mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            让 AI 替你
            <span className="animate-gradient-x bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 bg-[length:200%_auto] bg-clip-text text-transparent">
              写文案、写小说、写代码
            </span>
          </h1>
          <p className="animate-fade-up animation-delay-200 mx-auto mt-6 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
            输入一个想法，一键生成高质量内容。免费版每天 10 次，Pro 版每天 500 次。
          </p>
          <div className="animate-fade-up animation-delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 text-base shadow-lg shadow-brand-500/25 transition hover:shadow-brand-500/40">
              免费开始使用 →
            </Link>
            <Link href="/pricing" className="btn-secondary px-8 py-3 text-base">
              查看定价
            </Link>
          </div>
          <p className="animate-fade-up animation-delay-400 mt-5 text-xs text-zinc-400">
            无需信用卡 · 注册即用 · 支持暗色模式 · 手机电脑通用
          </p>

          {/* 演示预览窗口 */}
          <div className="animate-fade-up animation-delay-500 mx-auto mt-16 max-w-3xl">
            <div className="rounded-2xl border border-zinc-200 bg-white/70 p-2 shadow-2xl shadow-brand-500/10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-zinc-400">Nova AI Studio — 创作台</span>
              </div>
              <div className="rounded-xl bg-zinc-50 p-6 text-left dark:bg-zinc-950">
                <div className="mb-4 flex gap-2">
                  {["✍️ 短句", "📖 小说", "💻 代码", "💬 聊天"].map((t, i) => (
                    <span
                      key={t}
                      className={`rounded-lg px-3 py-1.5 text-xs ${
                        i === 0
                          ? "bg-brand-600 text-white"
                          : "border border-zinc-200 text-zinc-500 dark:border-zinc-800"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  输入：写一句关于秋天思念的短句
                </div>
                <div className="mt-3 rounded-lg bg-gradient-to-br from-brand-50 to-purple-50 p-3 text-sm leading-relaxed text-zinc-700 dark:from-brand-500/10 dark:to-purple-500/10 dark:text-zinc-200">
                  ✦ 输出：落叶是秋天写给大地的信，而你是我藏在风里的思念。
                  <span className="animate-blink ml-0.5 inline-block h-4 w-0.5 bg-brand-500 align-middle" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 数据栏 ===== */}
      <section className="border-y border-zinc-200 bg-zinc-50/50 py-10 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 text-center sm:grid-cols-4">
          {[
            { v: "4 合 1", l: "创作模式" },
            { v: "秒级", l: "生成速度" },
            { v: "10 次/天", l: "免费额度" },
            { v: "7×24h", l: "在线服务" },
          ].map((s) => (
            <div key={s.l}>
              <div className="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                {s.v}
              </div>
              <div className="mt-1 text-sm text-zinc-500">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 功能特性 ===== */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">一个平台，四种创作力</h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">无论你是创作者、学生还是开发者，都能找到趁手的工具</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group card relative overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-500/10"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.grad} opacity-0 transition group-hover:opacity-100`} />
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.grad} text-2xl shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 三步上手 ===== */}
      <section className="border-t border-zinc-200 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">三步开始创作</h2>
            <p className="mt-3 text-zinc-500 dark:text-zinc-400">无需任何学习成本</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.n} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-px w-1/2 translate-x-1/2 bg-gradient-to-r from-brand-500/40 to-transparent sm:block" />
                )}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-50 text-xl font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 定价预览 ===== */}
      <section className="border-t border-zinc-200 py-20 dark:border-zinc-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold">简单透明的定价</h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">从免费开始，按需升级</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { name: "免费版", price: "$0", desc: "每日 10 次生成" },
              { name: "Pro 版", price: "$9.9/月", desc: "每日 500 次 · 高级模型", hot: true },
              { name: "企业版", price: "$49.9/月", desc: "每日 5000 次 · API 接入" },
            ].map((p) => (
              <div
                key={p.name}
                className={`card transition hover:-translate-y-1 ${p.hot ? "border-brand-500 ring-2 ring-brand-500/30" : ""}`}
              >
                {p.hot && <div className="badge mb-2 bg-brand-600 text-white">最受欢迎</div>}
                <div className="font-semibold">{p.name}</div>
                <div className="mt-2 text-2xl font-bold">{p.price}</div>
                <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{p.desc}</div>
              </div>
            ))}
          </div>
          <Link href="/pricing" className="btn-primary mt-8">
            查看完整定价 →
          </Link>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden border-t border-zinc-200 py-20 dark:border-zinc-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)]" />
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold">准备好开始创作了吗？</h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">加入 Nova AI Studio，让灵感不再等待。</p>
          <Link href="/register" className="btn-primary mt-8 px-10 py-3 text-base shadow-lg shadow-brand-500/25">
            免费注册，立即体验 →
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400 dark:border-zinc-800">
        © {new Date().getFullYear()} Nova AI Studio · 合法合规的 AI 内容创作平台
      </footer>
    </main>
  );
}
