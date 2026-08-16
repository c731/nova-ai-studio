# Nova AI Studio - AI 内容生成 SaaS

一个可上线运营的 AI 内容生成平台：一键生成短句、小说、代码、AI 聊天。内置会员订阅（Stripe）、管理员后台、暗色模式。

## 技术栈

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma 6 + PostgreSQL + NextAuth + Stripe

## 功能清单

**普通用户**
- 一键生成：短句 / 小说 / 代码 / AI 聊天（OpenAI 兼容接口，支持任意模型端点）
- 会员体系：免费版（10 次/天）、Pro $9.9/月（500 次/天）、企业版 $49.9/月（5000 次/天）
- Stripe Checkout 订阅支付 + Webhook 自动升级
- 暗色/亮色主题切换，响应式（手机可用）

**管理员**（默认 admin@example.com / admin123）
- 数据统计：用户数、订阅数、生成次数、累计收入
- 用户管理：搜索、改计划、改角色、删除
- 订单管理：全部 Stripe 订单与状态
- 系统设置：站点名、公告、各档每日额度

## 快速开始（本地）

```bash
npm install
cp .env.example .env        # 填入 DATABASE_URL 等
npx prisma db push          # 建表
npm run seed                # 写入管理员账号与默认设置
npm run dev                 # http://localhost:3000
```

## 部署到 Vercel（手机可操作）

1. **建数据库（免费）**：注册 [Supabase](https://supabase.com) 或 [Neon](https://neon.tech)，新建 PostgreSQL 项目，复制连接串。
2. **推代码到 GitHub**：把本项目推到你的 GitHub 仓库。
3. **Vercel 导入**：打开 [vercel.com](https://vercel.com) → Add New Project → 选仓库 → Framework 自动识别为 Next.js。
4. **填环境变量**：在 Vercel 项目 Settings → Environment Variables 中，按 `.env.example` 逐项填入（`NEXTAUTH_URL` 和 `NEXT_PUBLIC_APP_URL` 填部署后的 https 域名）。
5. **Build 命令**设置为：`npx prisma generate && npx prisma db push && next build`
6. 部署成功后，用 Vercel 的 Build Logs 或本地执行一次 `npm run seed` 写入管理员账号（或在 Supabase SQL Editor 手动插入）。

## Stripe：测试模式 → 真实收款切换步骤

当前代码测试/真实通用，切换只需换环境变量：

1. **测试模式**（已就绪）：使用 `sk_test_` 密钥 + 测试价格 ID，测试卡 `4242 4242 4242 4242`。
2. **切换真实收款**：
   - 在 [Stripe Dashboard](https://dashboard.stripe.com)（右上角切到 **Live mode**）完成企业/个人主体认证；
   - 创建两个订阅产品：Pro $9.9/月、企业版 $49.9/月（recurring），复制 Live 模式的 `price_xxx`；
   - 把 Vercel 环境变量替换为：`STRIPE_SECRET_KEY=sk_live_...`、`STRIPE_PRICE_PRO`、`STRIPE_PRICE_ENTERPRISE` 换成 Live 价格 ID；
   - 在 Dashboard → Developers → Webhooks 添加 endpoint：`https://你的域名/api/stripe/webhook`，勾选 `checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted`，把签名密钥填入 `STRIPE_WEBHOOK_SECRET`；
   - 重新部署。此后用户付款为真实扣款，收入进你的 Stripe 账户（可提现到银行卡）。

> 注意：Stripe 支持中国大陆主体注册（需营业执照），也支持个人开发者所在的国家/地区，具体以 Stripe 官方要求为准。

## 默认账号

- 管理员：`admin@example.com` / `admin123`（seed 生成，登录后请及时改密码）

## 目录结构

```
prisma/schema.prisma      数据模型
prisma/seed.js            种子数据（管理员+默认设置）
src/lib/                  prisma/auth/stripe/plans/ai 核心库
src/app/api/              REST API（auth/generate/stripe/admin）
src/app/(pages)           首页/登录/注册/创作台/定价/账单/管理后台
```
