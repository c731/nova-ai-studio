import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// 读取全部设置
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await prisma.siteSettings.findMany();
  const settings: Record<string, string> = {};
  rows.forEach((r) => (settings[r.key] = r.value));
  return NextResponse.json({ settings });
}

// 保存设置
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { settings } = await req.json();
  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  return NextResponse.json({ ok: true });
}
