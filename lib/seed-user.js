import { prisma } from "./prisma";

const EXPENSE = [
  ["Food", "🍔"], ["Transport", "🚌"], ["Rent", "🏠"], ["Entertainment", "🎬"],
  ["Shopping", "🛍️"], ["Health", "💊"], ["Bills", "🧾"], ["Education", "📚"],
  ["Subscriptions", "🔁"], ["Other", "📦"],
];
const INCOME = [
  ["Salary", "💼"], ["Freelance", "💻"], ["Gift", "🎁"], ["Investment", "📈"],
  ["Other Income", "➕"],
];

const TRIAL_DAYS = 14;

// Idempotently set up a brand-new user with starter data + a free trial.
export async function seedNewUser(userId) {
  // Default wallet
  const walletCount = await prisma.wallet.count({ where: { userId } });
  if (walletCount === 0) {
    await prisma.wallet.create({
      data: { userId, name: "Cash", icon: "💵", color: "#6366f1", isDefault: true },
    });
  }

  // Starter categories
  const catCount = await prisma.category.count({ where: { userId } });
  if (catCount === 0) {
    const rows = [
      ...EXPENSE.map(([name, icon]) => ({ userId, name, icon, type: "expense" })),
      ...INCOME.map(([name, icon]) => ({ userId, name, icon, type: "income" })),
    ];
    await prisma.category.createMany({ data: rows, skipDuplicates: true });
  }

  // Settings
  const settings = await prisma.settings.findUnique({ where: { userId } });
  if (!settings) await prisma.settings.create({ data: { userId } });

  // Free trial membership
  const membership = await prisma.userSubscription.findUnique({ where: { userId } });
  if (!membership) {
    const end = new Date();
    end.setDate(end.getDate() + TRIAL_DAYS);
    await prisma.userSubscription.create({
      data: { userId, status: "trialing", currentPeriodEnd: end },
    });
  }
}
