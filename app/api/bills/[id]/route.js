import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function PUT(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.bill.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { name, amount, category, dueDay, walletId } = body;

    const data = {};
    if (name !== undefined && name.trim()) data.name = name.trim();
    if (amount !== undefined) {
      const v = Number(amount);
      if (!v || v <= 0) return NextResponse.json({ error: "amount must be > 0" }, { status: 400 });
      data.amount = v;
    }
    if (category !== undefined) data.category = category;
    if (dueDay !== undefined) data.dueDay = Number(dueDay);
    if (walletId !== undefined) data.walletId = walletId ? Number(walletId) : null;

    const updated = await prisma.bill.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/bills/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update bill" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.bill.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.bill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/bills/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete bill" }, { status: 500 });
  }
}
