import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: { transactions: { select: { type: true, amount: true } } },
    });

    const withBalance = wallets.map((w) => {
      let income = 0;
      let expense = 0;
      for (const t of w.transactions) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
      const { transactions, ...rest } = w;
      return { ...rest, income, expense, balance: income - expense };
    });
    return NextResponse.json(withBalance);
  } catch (error) {
    console.error("GET /api/wallets failed:", error);
    return NextResponse.json({ error: "Failed to fetch wallets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, icon, color } = body;
    if (!name || !name.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const count = await prisma.wallet.count({ where: { userId } });
    const created = await prisma.wallet.create({
      data: {
        userId,
        name: name.trim(),
        icon: icon || "👛",
        color: color || "#6366f1",
        isDefault: count === 0,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/wallets failed:", error);
    return NextResponse.json({ error: "Failed to create wallet" }, { status: 500 });
  }
}
