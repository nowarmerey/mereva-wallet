import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function PUT(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.wallet.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { name, icon, color, isDefault } = body;

    const data = {};
    if (name !== undefined && name.trim()) data.name = name.trim();
    if (icon !== undefined) data.icon = icon;
    if (color !== undefined) data.color = color;
    if (isDefault === true) {
      await prisma.wallet.updateMany({ where: { userId }, data: { isDefault: false } });
      data.isDefault = true;
    }

    const updated = await prisma.wallet.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/wallets/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update wallet" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.wallet.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const total = await prisma.wallet.count({ where: { userId } });
    if (total <= 1) {
      return NextResponse.json({ error: "You must keep at least one wallet." }, { status: 400 });
    }

    const fallback = await prisma.wallet.findFirst({
      where: { userId, id: { not: id } },
      orderBy: { isDefault: "desc" },
    });

    await prisma.transaction.updateMany({
      where: { userId, walletId: id },
      data: { walletId: fallback.id },
    });
    await prisma.wallet.delete({ where: { id } });

    if (owned.isDefault) {
      await prisma.wallet.update({ where: { id: fallback.id }, data: { isDefault: true } });
    }
    return NextResponse.json({ success: true, movedTo: fallback.id });
  } catch (error) {
    console.error("DELETE /api/wallets/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete wallet" }, { status: 500 });
  }
}
