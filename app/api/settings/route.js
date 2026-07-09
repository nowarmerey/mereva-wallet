import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

async function getOrCreateSettings(userId) {
  let s = await prisma.settings.findUnique({ where: { userId } });
  if (!s) s = await prisma.settings.create({ data: { userId } });
  return s;
}

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const s = await getOrCreateSettings(userId);
    return NextResponse.json({
      currency: s.currency,
      theme: s.theme,
      locale: s.locale,
      autoLockMinutes: s.autoLockMinutes,
      hasPin: !!s.pinHash,
      salaryAmount: s.salaryAmount,
      salaryDay: s.salaryDay,
      salaryWalletId: s.salaryWalletId,
    });
  } catch (error) {
    console.error("GET /api/settings failed:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { currency, theme, autoLockMinutes, locale, salaryAmount, salaryDay, salaryWalletId } = body;

    // Salary validation: amount null/0 disables it; day is clamped to 1-31;
    // the wallet must belong to the current user.
    const salaryData = {};
    if (salaryAmount !== undefined) {
      const amount = salaryAmount === null || salaryAmount === "" ? null : Number(salaryAmount);
      if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
        return NextResponse.json({ error: "Invalid salary amount" }, { status: 400 });
      }
      salaryData.salaryAmount = amount;
    }
    if (salaryDay !== undefined) {
      const day = Number(salaryDay);
      if (!Number.isInteger(day) || day < 1 || day > 31) {
        return NextResponse.json({ error: "Salary day must be 1-31" }, { status: 400 });
      }
      salaryData.salaryDay = day;
    }
    if (salaryWalletId !== undefined) {
      if (salaryWalletId === null || salaryWalletId === "") {
        salaryData.salaryWalletId = null;
      } else {
        const wallet = await prisma.wallet.findFirst({
          where: { id: Number(salaryWalletId), userId },
        });
        if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 400 });
        salaryData.salaryWalletId = wallet.id;
      }
    }

    const s = await getOrCreateSettings(userId);
    const updated = await prisma.settings.update({
      where: { id: s.id },
      data: {
        ...(currency !== undefined ? { currency } : {}),
        ...(theme !== undefined ? { theme } : {}),
        ...(locale !== undefined ? { locale } : {}),
        ...(autoLockMinutes !== undefined ? { autoLockMinutes: Number(autoLockMinutes) } : {}),
        ...salaryData,
      },
    });

    // Keep the user's preferred locale on the user row too (for SSR defaults).
    if (locale !== undefined) {
      await prisma.user.update({ where: { id: userId }, data: { locale } }).catch(() => {});
    }

    return NextResponse.json({
      currency: updated.currency,
      theme: updated.theme,
      locale: updated.locale,
      autoLockMinutes: updated.autoLockMinutes,
      hasPin: !!updated.pinHash,
      salaryAmount: updated.salaryAmount,
      salaryDay: updated.salaryDay,
      salaryWalletId: updated.salaryWalletId,
    });
  } catch (error) {
    console.error("PUT /api/settings failed:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
