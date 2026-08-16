import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// 订单列表
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = 20;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.order.count(),
  ]);
  return NextResponse.json({ orders, total, page, pageSize });
}
