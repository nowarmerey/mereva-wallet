import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

// GET /api/transactions  (scoped to the signed-in user)
export async function GET(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const walletId = searchParams.get("walletId");
    const q = searchParams.get("q");

    const where = { userId };
    if (type) where.type = type;
    if (category) where.category = category;
    if (walletId) where.walletId = Number(walletId);
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { note: { contains: term, mode: "insensitive" } },
        { category: { contains: term, mode: "insensitive" } },
        { type: { contains: term, mode: "insensitive" } },
      ];
      const num = Number(term);
      if (!Number.isNaN(num)) where.OR.push({ amount: num });
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { wallet: true },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET /api/transactions failed:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, category, amount, note, createdAt, walletId, receipt } = body;

    if (type !== "income" && type !== "expense") {
      return NextResponse.json({ error: "type must be 'income' or 'expense'" }, { status: 400 });
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: "amount must be a number greater than 0" }, { status: 400 });
    }

    const created = await prisma.transaction.create({
      data: {
        userId,
        type,
        category,
        amount: numericAmount,
        note: note || null,
        receipt: receipt || null,
        walletId: walletId ? Number(walletId) : null,
        ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
      },
      include: { wallet: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/transactions failed:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
