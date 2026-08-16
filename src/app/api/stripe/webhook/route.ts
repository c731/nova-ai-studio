import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Stripe Webhook：订阅成功后升级用户 plan
// 真实模式需在 Stripe Dashboard 配置此 URL: https://你的域名/api/stripe/webhook
export async function POST(req: Request) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // 本地开发无签名时直接解析（生产必须配置 STRIPE_WEBHOOK_SECRET）
      event = JSON.parse(rawBody);
    }
  } catch {
    return NextResponse.json({ error: "Webhook 签名校验失败" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId;
        const plan = s.metadata?.plan;
        if (userId && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: plan as any,
              stripeSubscriptionId: (s.subscription as string) || undefined,
              subscriptionStatus: "active",
            },
          });
          await prisma.order.updateMany({
            where: { stripeSessionId: s.id },
            data: { status: "paid", paidAt: new Date() },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: sub.status },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { plan: "FREE", subscriptionStatus: "canceled" },
          });
        }
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
