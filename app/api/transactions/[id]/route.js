import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function PUT(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { type, category, amount, note, createdAt, walletId, receipt } = body;

    const data = {};
    if (type !== undefined) {
      if (type !== "income" && type !== "expense") {
        return NextResponse.json({ error: "type must be 'income' or 'expense'" }, { status: 400 });
      }
      data.type = type;
    }
    if (category !== undefined) {
      if (!category) return NextResponse.json({ error: "category is required" }, { status: 400 });
      data.category = category;
    }
    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (!numericAmount || numericAmount <= 0) {
        return NextResponse.json({ error: "amount must be a number greater than 0" }, { status: 400 });
      }
      data.amount = numericAmount;
    }
    if (note !== undefined) data.note = note || null;
    if (receipt !== undefined) data.receipt = receipt || null;
    if (walletId !== undefined) data.walletId = walletId ? Number(walletId) : null;
    if (createdAt !== undefined) data.createdAt = new Date(createdAt);

    const updated = await prisma.transaction.update({
      where: { id },
      data,
      include: { wallet: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/transactions/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/transactions/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
