import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// 数据统计
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const totalUsers = await prisma.user.count();
  const proUsers = await prisma.user.count({ where: { plan: "PRO" } });
  const entUsers = await prisma.user.count({ where: { plan: "ENTERPRISE" } });
  const totalGenerations = await prisma.generation.count();
  const paidOrders = await prisma.order.findMany({ where: { status: "paid" } });
  const revenueCents = paidOrders.reduce((s, o) => s + o.amount, 0);

  const last7 = new Date(Date.now() - 7 * 864e5);
  const recentUsers = await prisma.user.count({ where: { createdAt: { gte: last7 } } });
  const recentGens = await prisma.generation.count({ where: { createdAt: { gte: last7 } } });

  return NextResponse.json({
    totalUsers,
    proUsers,
    entUsers,
    totalGenerations,
    revenueCents,
    revenueLabel: "$" + (revenueCents / 100).toFixed(2),
    recentUsers,
    recentGens,
  });
}
