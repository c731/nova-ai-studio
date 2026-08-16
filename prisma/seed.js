// 种子数据：默认管理员 admin@example.com / admin123
// 运行: npm run seed  (即 node prisma/seed.js)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@example.com",
      name: "管理员",
      passwordHash,
      role: "ADMIN",
      plan: "ENTERPRISE",
    },
  });
  console.log("✅ 管理员账号就绪:", admin.email, "/ admin123 (角色:", admin.role, ")");

  const defaults = [
    { key: "site_name", value: "Nova AI Studio" },
    { key: "announcement", value: "欢迎使用 Nova AI Studio：一键生成短句 / 小说 / 代码，AI 聊天。" },
    { key: "free_daily_limit", value: "10" },
    { key: "pro_daily_limit", value: "500" },
    { key: "enterprise_daily_limit", value: "5000" },
  ];
  for (const s of defaults) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✅ 默认站点设置已写入");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
