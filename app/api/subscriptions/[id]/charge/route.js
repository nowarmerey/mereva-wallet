import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

function advance(date, frequency) {
  const d = new Date(date);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

export async function POST(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const sub = await prisma.subscription.findFirst({ where: { id, userId } });
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.transaction.create({
      data: {
        userId,
        type: "expense",
        category: sub.category || "Subscriptions",
        amount: sub.amount,
        note: `Subscription: ${sub.name}`,
        walletId: sub.walletId || null,
        createdAt: new Date(),
      },
    });

    const updated = await prisma.subscription.update({
      where: { id },
      data: { nextDate: advance(sub.nextDate, sub.frequency) },
    });
    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    console.error("POST /api/subscriptions/[id]/charge failed:", error);
    return NextResponse.json({ error: "Failed to charge" }, { status: 500 });
  }
}
