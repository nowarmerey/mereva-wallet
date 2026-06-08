import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function PUT(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { name, amount, frequency, category, nextDate, walletId, active } = body;

    const data = {};
    if (name !== undefined && name.trim()) data.name = name.trim();
    if (amount !== undefined) {
      const v = Number(amount);
      if (!v || v <= 0) return NextResponse.json({ error: "amount must be > 0" }, { status: 400 });
      data.amount = v;
    }
    if (frequency !== undefined) data.frequency = frequency;
    if (category !== undefined) data.category = category;
    if (walletId !== undefined) data.walletId = walletId ? Number(walletId) : null;
    if (nextDate !== undefined) data.nextDate = new Date(nextDate);
    if (active !== undefined) data.active = !!active;

    const updated = await prisma.subscription.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/subscriptions/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.subscription.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/subscriptions/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 });
  }
}
