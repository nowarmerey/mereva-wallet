import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/mail";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";

function advance(date, frequency) {
  const d = new Date(date);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-cron-secret");
  const qs = new URL(request.url).searchParams.get("secret");
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const bearer = (request.headers.get("authorization") || "").replace("Bearer ", "");
  return header === secret || qs === secret || bearer === secret;
}

async function handle(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const summary = { salaries: 0, charged: 0, reminded: 0 };

  // 0) Auto-post monthly salaries
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const salaryConfigs = await prisma.settings.findMany({
    where: {
      salaryAmount: { gt: 0 },
      OR: [{ salaryLastPaid: null }, { salaryLastPaid: { not: period } }],
    },
  });
  for (const cfg of salaryConfigs) {
    // Clamp the payday to the current month's length (e.g. day 31 in April → 30).
    const payday = Math.min(cfg.salaryDay || 1, daysInMonth);
    if (now.getDate() < payday) continue;
    await prisma.transaction.create({
      data: {
        userId: cfg.userId,
        type: "income",
        category: "Salary",
        amount: cfg.salaryAmount,
        note: `Salary (auto) — ${period}`,
        walletId: cfg.salaryWalletId || null,
        createdAt: now,
      },
    });
    await prisma.settings.update({
      where: { id: cfg.id },
      data: { salaryLastPaid: period },
    });
    await sendPushToUser(cfg.userId, {
      title: "Mereva Wallet",
      body: `Salary of ${cfg.salaryAmount} was added to your wallet.`,
      url: "/transactions",
    }).catch(() => {});
    summary.salaries++;
  }

  // 1) Auto-post due subscriptions
  const due = await prisma.subscription.findMany({
    where: { active: true, nextDate: { lte: now } },
  });
  for (const s of due) {
    await prisma.transaction.create({
      data: {
        userId: s.userId,
        type: "expense",
        category: s.category || "Subscriptions",
        amount: s.amount,
        note: `Subscription: ${s.name}`,
        walletId: s.walletId || null,
        createdAt: now,
      },
    });
    await prisma.subscription.update({
      where: { id: s.id },
      data: { nextDate: advance(s.nextDate, s.frequency) },
    });
    summary.charged++;
  }

  // 2) Build reminders per user
  const reminders = new Map(); // userId -> string[]
  const add = (uid, msg) => {
    if (!reminders.has(uid)) reminders.set(uid, []);
    reminders.get(uid).push(msg);
  };

  // Trials ending soon
  const trials = await prisma.userSubscription.findMany({
    where: { status: "trialing", currentPeriodEnd: { gte: now, lte: in3d } },
  });
  for (const m of trials) {
    add(m.userId, `Your free trial ends on ${new Date(m.currentPeriodEnd).toLocaleDateString()}. Subscribe to keep full access.`);
  }

  // Bills due soon and still unpaid this month
  const bills = await prisma.bill.findMany({ include: { payments: { where: { period } } } });
  const today = now.getDate();
  for (const b of bills) {
    const paid = b.payments.length > 0;
    if (!paid && b.dueDay >= today && b.dueDay <= today + 3) {
      add(b.userId, `Bill "${b.name}" (${b.amount}) is due on day ${b.dueDay} this month.`);
    }
  }

  // Subscriptions renewing soon
  const upcoming = await prisma.subscription.findMany({
    where: { active: true, nextDate: { gte: now, lte: in3d } },
  });
  for (const s of upcoming) {
    add(s.userId, `Subscription "${s.name}" (${s.amount}) renews on ${new Date(s.nextDate).toLocaleDateString()}.`);
  }

  // 3) Send digests
  for (const [userId, items] of reminders) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) continue;
    const list = items.map((i) => `<li>${i}</li>`).join("");
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Mereva Wallet — upcoming reminders",
        html: emailLayout(
          "Your reminders",
          `<p>Here's what's coming up:</p><ul>${list}</ul>`,
          { url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard`, label: "Open Mereva Wallet" }
        ),
      }).catch(() => {});
    }
    await sendPushToUser(userId, {
      title: "Mereva Wallet reminders",
      body: items[0] + (items.length > 1 ? ` (+${items.length - 1} more)` : ""),
      url: "/bills",
    }).catch(() => {});
    summary.reminded++;
  }

  return NextResponse.json({ ok: true, ...summary, at: now.toISOString() });
}

export async function GET(request) {
  return handle(request);
}
export async function POST(request) {
  return handle(request);
}
