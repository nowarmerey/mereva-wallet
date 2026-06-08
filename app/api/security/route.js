import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

function hashPin(pin) {
  return crypto.createHash("sha256").update(String(pin)).digest("hex");
}

async function getSettings(userId) {
  let s = await prisma.settings.findUnique({ where: { userId } });
  if (!s) s = await prisma.settings.create({ data: { userId } });
  return s;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ hasPin: false, autoLockMinutes: 5 });
  const s = await getSettings(userId);
  return NextResponse.json({ hasPin: !!s.pinHash, autoLockMinutes: s.autoLockMinutes });
}

export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action, pin, current, autoLockMinutes } = body;
    const s = await getSettings(userId);

    if (action === "verify") {
      if (!s.pinHash) return NextResponse.json({ ok: true });
      return NextResponse.json({ ok: s.pinHash === hashPin(pin) });
    }

    if (action === "set") {
      if (!pin || String(pin).length < 4) {
        return NextResponse.json({ error: "PIN must be at least 4 digits" }, { status: 400 });
      }
      if (s.pinHash && s.pinHash !== hashPin(current)) {
        return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 403 });
      }
      await prisma.settings.update({
        where: { id: s.id },
        data: {
          pinHash: hashPin(pin),
          ...(autoLockMinutes !== undefined ? { autoLockMinutes: Number(autoLockMinutes) } : {}),
        },
      });
      return NextResponse.json({ ok: true, hasPin: true });
    }

    if (action === "remove") {
      if (s.pinHash && s.pinHash !== hashPin(current)) {
        return NextResponse.json({ error: "Current PIN is incorrect" }, { status: 403 });
      }
      await prisma.settings.update({ where: { id: s.id }, data: { pinHash: null } });
      return NextResponse.json({ ok: true, hasPin: false });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/security failed:", error);
    return NextResponse.json({ error: "Security request failed" }, { status: 500 });
  }
}
