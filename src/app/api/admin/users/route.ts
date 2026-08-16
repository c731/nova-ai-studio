import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// 用户列表
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = 20;
  const q = searchParams.get("q") || "";

  const where = q
    ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, name: true, email: true, role: true, plan: true, subscriptionStatus: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);
  return NextResponse.json({ users, total, page, pageSize });
}

// 修改用户角色/计划
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id, role, plan } = await req.json();
  if (!id) return NextResponse.json({ error: "缺少用户 id" }, { status: 400 });
  const data: any = {};
  if (role && ["USER", "ADMIN"].includes(role)) data.role = role;
  if (plan && ["FREE", "PRO", "ENTERPRISE"].includes(plan)) data.plan = plan;
  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role, plan: user.plan } });
}

// 删除用户
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少用户 id" }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
