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
    const { currency, theme, autoLockMinutes, locale } = body;

    const s = await getOrCreateSettings(userId);
    const updated = await prisma.settings.update({
      where: { id: s.id },
      data: {
        ...(currency !== undefined ? { currency } : {}),
        ...(theme !== undefined ? { theme } : {}),
        ...(locale !== undefined ? { locale } : {}),
        ...(autoLockMinutes !== undefined ? { autoLockMinutes: Number(autoLockMinutes) } : {}),
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
    });
  } catch (error) {
    console.error("PUT /api/settings failed:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
