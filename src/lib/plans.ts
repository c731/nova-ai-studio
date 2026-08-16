// 会员体系：免费版 / Pro $9.9/月 / 企业版 $49.9/月
export type PlanKey = "FREE" | "PRO" | "ENTERPRISE";

export const PLANS: Record<
  PlanKey,
  {
    name: string;
    nameZh: string;
    priceCents: number; // 美分
    priceLabel: string;
    dailyLimit: number;
    features: string[];
    stripePriceEnv: string | null;
  }
> = {
  FREE: {
    name: "Free",
    nameZh: "免费版",
    priceCents: 0,
    priceLabel: "$0",
    dailyLimit: 10,
    features: ["每日 10 次生成", "短句 / 代码 / AI 聊天", "基础模型", "社区支持"],
    stripePriceEnv: null,
  },
  PRO: {
    name: "Pro",
    nameZh: "Pro 版",
    priceCents: 990,
    priceLabel: "$9.9",
    dailyLimit: 500,
    features: [
      "每日 500 次生成",
      "全部创作模式（含长篇小说）",
      "高级模型 + 更快响应",
      "历史记录云端保存",
      "邮件支持",
    ],
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
  ENTERPRISE: {
    name: "Enterprise",
    nameZh: "企业版",
    priceCents: 4990,
    priceLabel: "$49.9",
    dailyLimit: 5000,
    features: [
      "每日 5000 次生成",
      "API 接入额度",
      "团队协作（5 席位）",
      "优先模型通道",
      "专属客服 SLA",
    ],
    stripePriceEnv: "STRIPE_PRICE_ENTERPRISE",
  },
};

export function getDailyLimit(plan: string): number {
  const p = PLANS[(plan as PlanKey) in PLANS ? (plan as PlanKey) : "FREE"];
  return p.dailyLimit;
}
