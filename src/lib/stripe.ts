import Stripe from "stripe";

// Stripe 客户端：测试模式与真实模式用同一套代码，只换密钥
// 测试密钥以 sk_test_ 开头，真实密钥以 sk_live_ 开头
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("缺少 STRIPE_SECRET_KEY 环境变量");
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: "2025-03-31.basil" as any });
  }
  return stripeClient;
}

export function isStripeTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_");
}
