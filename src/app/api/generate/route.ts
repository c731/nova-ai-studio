import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generate } from "@/lib/ai";
import { getDailyLimit } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    const userId = (session.user as any).id as string;
    const { type, prompt } = await req.json();
    if (!["short", "novel", "code", "chat"].includes(type)) {
      return NextResponse.json({ error: "不支持的生成类型" }, { status: 400 });
    }

    // 配额检查（按用户当前 plan 的每日上限）
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 401 });
    const limit = getDailyLimit(user.plan);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const usedToday = await prisma.generation.count({
      where: { userId, createdAt: { gte: todayStart } },
    });
    if (usedToday >= limit) {
      return NextResponse.json(
        {
          error: `今日免费额度已用完（${usedToday}/${limit}）。升级 Pro 版可获得每日 500 次。`,
          needUpgrade: true,
        },
        { status: 429 }
      );
    }

    const result = await generate(type, String(prompt));
    await prisma.generation.create({
      data: { userId, type, prompt: String(prompt), output: result.output, engine: result.engine },
    });

    return NextResponse.json({
      ok: true,
      output: result.output,
      engine: result.engine,
      usage: { used: usedToday + 1, limit },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
