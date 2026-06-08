import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || currentPeriod();

    const bills = await prisma.bill.findMany({
      where: { userId },
      orderBy: { dueDay: "asc" },
      include: { payments: { where: { period } } },
    });

    const result = bills.map((b) => {
      const { payments, ...rest } = b;
      return { ...rest, paid: payments.length > 0, period };
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/bills failed:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, amount, category, dueDay, walletId } = body;
    if (!name || !name.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const value = Number(amount);
    if (!value || value <= 0) return NextResponse.json({ error: "amount must be greater than 0" }, { status: 400 });

    const created = await prisma.bill.create({
      data: {
        userId,
        name: name.trim(),
        amount: value,
        category: category || "Bills",
        dueDay: dueDay ? Number(dueDay) : 1,
        walletId: walletId ? Number(walletId) : null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/bills failed:", error);
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
  }
}
