import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { fromId, toId, amount, note } = body;
    const from = Number(fromId);
    const to = Number(toId);
    const value = Number(amount);

    if (!from || !to || from === to) {
      return NextResponse.json({ error: "Choose two different wallets." }, { status: 400 });
    }
    if (!value || value <= 0) {
      return NextResponse.json({ error: "amount must be greater than 0" }, { status: 400 });
    }

    const [fromWallet, toWallet] = await Promise.all([
      prisma.wallet.findFirst({ where: { id: from, userId } }),
      prisma.wallet.findFirst({ where: { id: to, userId } }),
    ]);
    if (!fromWallet || !toWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const group = `tr_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    const now = new Date();

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          type: "expense",
          category: "Transfer",
          amount: value,
          note: note?.trim() || `Transfer to ${toWallet.name}`,
          walletId: from,
          isTransfer: true,
          transferGroup: group,
          createdAt: now,
        },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: "income",
          category: "Transfer",
          amount: value,
          note: note?.trim() || `Transfer from ${fromWallet.name}`,
          walletId: to,
          isTransfer: true,
          transferGroup: group,
          createdAt: now,
        },
      }),
    ]);
    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (error) {
    console.error("POST /api/wallets/transfer failed:", error);
    return NextResponse.json({ error: "Failed to transfer" }, { status: 500 });
  }
}
