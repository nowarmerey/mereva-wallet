// Seeds the SaaS: an admin account, default plans, and imports the previous
// single-user SQLite data (prisma/backup-sqlite.json) into the admin account.
// Idempotent. Run AFTER `prisma migrate` against Postgres:
//   node prisma/seed-saas.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function ensureAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@wallet.app").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "admin12345";

  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email,
        name: "Admin",
        role: "ADMIN",
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    console.log(`Created admin: ${email} (password: ${password})`);
  } else {
    if (admin.role !== "ADMIN") {
      admin = await prisma.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    }
    console.log(`Admin already exists: ${email}`);
  }

  // Give the admin a long-lived granted membership.
  const end = new Date();
  end.setFullYear(end.getFullYear() + 10);
  await prisma.userSubscription.upsert({
    where: { userId: admin.id },
    update: { status: "active", grantedByAdmin: true, currentPeriodEnd: end },
    create: { userId: admin.id, status: "active", grantedByAdmin: true, currentPeriodEnd: end },
  });

  // Ensure admin has settings.
  const settings = await prisma.settings.findUnique({ where: { userId: admin.id } });
  if (!settings) await prisma.settings.create({ data: { userId: admin.id } });

  return admin;
}

async function importLegacyData(adminId) {
  const file = path.join(__dirname, "backup-sqlite.json");
  if (!fs.existsSync(file)) {
    console.log("No backup-sqlite.json found — skipping legacy import.");
    return;
  }

  const existing = await prisma.transaction.count({ where: { userId: adminId } });
  if (existing > 0) {
    console.log("Admin already has transactions — skipping legacy import.");
    return;
  }

  const d = JSON.parse(fs.readFileSync(file, "utf-8"));

  // Wallets (remap id)
  const walletMap = {};
  for (const w of d.wallets || []) {
    const created = await prisma.wallet.create({
      data: {
        userId: adminId,
        name: w.name,
        icon: w.icon,
        color: w.color,
        isDefault: w.isDefault,
      },
    });
    walletMap[w.id] = created.id;
  }

  // Categories
  for (const c of d.categories || []) {
    await prisma.category
      .create({
        data: {
          userId: adminId,
          name: c.name,
          type: c.type,
          icon: c.icon,
          monthlyLimit: c.monthlyLimit,
        },
      })
      .catch(() => {});
  }

  // Transactions
  for (const t of d.transactions || []) {
    await prisma.transaction.create({
      data: {
        userId: adminId,
        type: t.type,
        category: t.category,
        amount: t.amount,
        note: t.note,
        receipt: t.receipt,
        walletId: t.walletId ? walletMap[t.walletId] ?? null : null,
        isTransfer: !!t.isTransfer,
        transferGroup: t.transferGroup,
        createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
      },
    });
  }

  // Bills + payments
  for (const b of d.bills || []) {
    const bill = await prisma.bill.create({
      data: {
        userId: adminId,
        name: b.name,
        amount: b.amount,
        category: b.category,
        dueDay: b.dueDay,
        walletId: b.walletId ? walletMap[b.walletId] ?? null : null,
      },
    });
    for (const p of (d.billPayments || []).filter((x) => x.billId === b.id)) {
      await prisma.billPayment
        .create({ data: { billId: bill.id, period: p.period } })
        .catch(() => {});
    }
  }

  // Subscriptions
  for (const s of d.subscriptions || []) {
    await prisma.subscription.create({
      data: {
        userId: adminId,
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
        userId: adminId,
        name: g.name,
        target: g.target,
        saved: g.saved,
        icon: g.icon,
        deadline: g.deadline ? new Date(g.deadline) : null,
      },
    });
  }

  // Settings (currency/theme)
  const s0 = (d.settings || [])[0];
  if (s0) {
    await prisma.settings.upsert({
      where: { userId: adminId },
      update: { currency: s0.currency, theme: s0.theme, autoLockMinutes: s0.autoLockMinutes },
      create: {
        userId: adminId,
        currency: s0.currency,
        theme: s0.theme,
        autoLockMinutes: s0.autoLockMinutes,
      },
    });
  }

  const count = await prisma.transaction.count({ where: { userId: adminId } });
  console.log(`Imported legacy data: ${count} transactions, ${Object.keys(walletMap).length} wallets.`);
}

async function ensurePlans() {
  const count = await prisma.plan.count();
  if (count > 0) {
    console.log("Plans already exist — skipping.");
    return;
  }
  await prisma.plan.createMany({
    data: [
      {
        name: "Free",
        description: "Get started and try the basics.",
        priceCents: 0,
        currency: "usd",
        interval: "month",
        features: JSON.stringify(["1 wallet", "Up to 50 transactions", "Basic reports"]),
        sortOrder: 0,
      },
      {
        name: "Pro Monthly",
        description: "Everything, billed monthly.",
        priceCents: 499,
        currency: "usd",
        interval: "month",
        trialDays: 14,
        features: JSON.stringify([
          "Unlimited wallets & transactions",
          "Bills, subscriptions & goals",
          "Advanced analytics & forecast",
          "Google Drive backup",
          "Multi-language",
        ]),
        isFeatured: true,
        sortOrder: 1,
      },
      {
        name: "Pro Yearly",
        description: "Everything, billed yearly (save ~30%).",
        priceCents: 3999,
        currency: "usd",
        interval: "year",
        trialDays: 14,
        features: JSON.stringify([
          "All Pro features",
          "2 months free",
          "Priority support",
        ]),
        sortOrder: 2,
      },
    ],
  });
  console.log("Created default plans (Free, Pro Monthly, Pro Yearly).");
}

async function main() {
  const admin = await ensureAdmin();
  await importLegacyData(admin.id);
  await ensurePlans();
  console.log("✅ seed-saas complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
