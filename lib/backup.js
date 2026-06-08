import { prisma } from "./prisma";

// Collect all of a user's data into a single portable object.
export async function buildBackup(userId) {
  const [wallets, categories, transactions, bills, subscriptions, goals, settings] =
    await Promise.all([
      prisma.wallet.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId } }),
      prisma.bill.findMany({ where: { userId }, include: { payments: true } }),
      prisma.subscription.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.settings.findUnique({ where: { userId } }),
    ]);

  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    data: { wallets, categories, transactions, bills, subscriptions, goals, settings },
  };
}

// Replace a user's data with the contents of a backup (remapping wallet ids).
export async function restoreBackup(userId, backup) {
  const d = backup?.data;
  if (!d) throw new Error("Invalid backup file");

  // Wipe existing user-scoped data (BillPayment cascades from Bill).
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.bill.deleteMany({ where: { userId } });
  await prisma.subscription.deleteMany({ where: { userId } });
  await prisma.goal.deleteMany({ where: { userId } });
  await prisma.category.deleteMany({ where: { userId } });
  await prisma.wallet.deleteMany({ where: { userId } });

  // Wallets (remap old id -> new id)
  const walletMap = {};
  for (const w of d.wallets || []) {
    const created = await prisma.wallet.create({
      data: {
        userId,
        name: w.name,
        icon: w.icon,
        color: w.color,
        isDefault: w.isDefault,
        createdAt: w.createdAt ? new Date(w.createdAt) : undefined,
      },
    });
    walletMap[w.id] = created.id;
  }

  // Categories
  for (const c of d.categories || []) {
    await prisma.category.create({
      data: {
        userId,
        name: c.name,
        type: c.type,
        icon: c.icon,
        monthlyLimit: c.monthlyLimit,
      },
    }).catch(() => {});
  }

  // Transactions
  for (const t of d.transactions || []) {
    await prisma.transaction.create({
      data: {
        userId,
        type: t.type,
        category: t.category,
        amount: t.amount,
        note: t.note,
        receipt: t.receipt,
        walletId: t.walletId ? walletMap[t.walletId] ?? null : null,
        isTransfer: t.isTransfer,
        transferGroup: t.transferGroup,
        createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
      },
    });
  }

  // Bills + payments
  for (const b of d.bills || []) {
    const bill = await prisma.bill.create({
      data: {
        userId,
        name: b.name,
        amount: b.amount,
        category: b.category,
        dueDay: b.dueDay,
        walletId: b.walletId ? walletMap[b.walletId] ?? null : null,
      },
    });
    for (const p of b.payments || []) {
      await prisma.billPayment.create({
        data: { billId: bill.id, period: p.period, paidAt: p.paidAt ? new Date(p.paidAt) : undefined },
      }).catch(() => {});
    }
  }

  // Subscriptions
  for (const s of d.subscriptions || []) {
    await prisma.subscription.create({
      data: {
        userId,
        name: s.name,
        amount: s.amount,
        frequency: s.frequency,
        category: s.category,
        walletId: s.walletId ? walletMap[s.walletId] ?? null : null,
        nextDate: s.nextDate ? new Date(s.nextDate) : new Date(),
        active: s.active,
      },
    });
  }

  // Goals
  for (const g of d.goals || []) {
    await prisma.goal.create({
      data: {
        userId,
        name: g.name,
        target: g.target,
        saved: g.saved,
        icon: g.icon,
        deadline: g.deadline ? new Date(g.deadline) : null,
      },
    });
  }

  // Settings
  if (d.settings) {
    await prisma.settings.upsert({
      where: { userId },
      update: {
        currency: d.settings.currency,
        theme: d.settings.theme,
        locale: d.settings.locale,
        autoLockMinutes: d.settings.autoLockMinutes,
      },
      create: {
        userId,
        currency: d.settings.currency,
        theme: d.settings.theme,
        locale: d.settings.locale,
        autoLockMinutes: d.settings.autoLockMinutes,
      },
    });
  }

  return true;
}
