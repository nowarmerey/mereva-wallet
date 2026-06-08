// One-time, idempotent data initializer for v2.
// - Creates a default wallet and assigns existing transactions to it.
// - Seeds the Category table from defaults + categories already used in data.
// Safe to run multiple times. Run with:  node prisma/init-data.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_EXPENSE = [
  ["Food", "🍔"], ["Transport", "🚌"], ["Rent", "🏠"], ["Entertainment", "🎬"],
  ["Shopping", "🛍️"], ["Health", "💊"], ["Bills", "🧾"], ["Education", "📚"],
  ["Subscriptions", "🔁"], ["Other", "📦"],
];
const DEFAULT_INCOME = [
  ["Salary", "💼"], ["Freelance", "💻"], ["Gift", "🎁"], ["Investment", "📈"],
  ["Other Income", "➕"],
];

async function main() {
  // 1) Ensure a default wallet exists.
  let wallet = await prisma.wallet.findFirst({ where: { isDefault: true } });
  if (!wallet) {
    wallet = await prisma.wallet.findFirst();
  }
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { name: "Cash", icon: "💵", color: "#6366f1", isDefault: true },
    });
    console.log(`Created default wallet "${wallet.name}" (id ${wallet.id})`);
  } else if (!wallet.isDefault) {
    wallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { isDefault: true },
    });
  }

  // 2) Assign any wallet-less transactions to the default wallet.
  const orphan = await prisma.transaction.updateMany({
    where: { walletId: null },
    data: { walletId: wallet.id },
  });
  console.log(`Assigned ${orphan.count} existing transactions to "${wallet.name}".`);

  // 3) Seed categories (defaults + any already used in transactions).
  const used = await prisma.transaction.findMany({
    select: { category: true, type: true },
    distinct: ["category"],
  });

  const seed = new Map(); // name -> { type, icon }
  for (const [name, icon] of DEFAULT_EXPENSE) seed.set(name, { type: "expense", icon });
  for (const [name, icon] of DEFAULT_INCOME) {
    if (seed.has(name)) seed.set(name, { type: "both", icon: seed.get(name).icon });
    else seed.set(name, { type: "income", icon });
  }
  for (const u of used) {
    if (!seed.has(u.category)) {
      seed.set(u.category, { type: u.type || "expense", icon: "🏷️" });
    }
  }

  let created = 0;
  for (const [name, info] of seed) {
    const exists = await prisma.category.findUnique({ where: { name } });
    if (!exists) {
      await prisma.category.create({
        data: { name, type: info.type, icon: info.icon },
      });
      created++;
    }
  }
  console.log(`Seeded ${created} categories (total now in DB).`);

  // 4) Ensure a settings row exists.
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({ data: {} });
    console.log("Created default settings row.");
  }

  console.log("✅ init-data complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
