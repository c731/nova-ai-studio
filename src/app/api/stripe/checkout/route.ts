import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { PLANS, PlanKey } from "@/lib/plans";

// 创建 Stripe Checkout 会话（订阅）
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const { plan } = await req.json();
    const planKey = String(plan).toUpperCase() as PlanKey;
    if (!PLANS[planKey] || planKey === "FREE") {
      return NextResponse.json({ error: "无效的订阅计划" }, { status: 400 });
    }
    const planDef = PLANS[planKey];
    const priceId = process.env[planDef.stripePriceEnv || ""];
    if (!priceId) {
      return NextResponse.json(
        { error: `缺少 ${planDef.stripePriceEnv} 环境变量（Stripe 价格 ID）` },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 401 });

    const stripe = getStripe();
    // 复用或创建 Stripe 客户
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing?success=1`,
      cancel_url: `${baseUrl}/pricing?canceled=1`,
      metadata: { userId, plan: planKey },
      subscription_data: { metadata: { userId, plan: planKey } },
    });

    await prisma.order.create({
      data: {
        userId,
        plan: planKey,
        amount: planDef.priceCents,
        stripeSessionId: checkout.id,
        status: "pending",
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    return NextResponse.json({ error: "创建支付失败: " + (e as Error).message }, { status: 500 });
  }
}
