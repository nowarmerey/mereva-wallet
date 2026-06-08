import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subs = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextDate: "asc" },
    });
    return NextResponse.json(subs);
  } catch (error) {
    console.error("GET /api/subscriptions failed:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, amount, frequency, category, nextDate, walletId } = body;
    if (!name || !name.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const value = Number(amount);
    if (!value || value <= 0) return NextResponse.json({ error: "amount must be > 0" }, { status: 400 });

    const created = await prisma.subscription.create({
      data: {
        userId,
        name: name.trim(),
        amount: value,
        frequency: frequency || "monthly",
        category: category || "Subscriptions",
        walletId: walletId ? Number(walletId) : null,
        nextDate: nextDate ? new Date(nextDate) : new Date(),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/subscriptions failed:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
