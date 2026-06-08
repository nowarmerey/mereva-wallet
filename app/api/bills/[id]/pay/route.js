import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function POST(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const bill = await prisma.bill.findFirst({ where: { id, userId } });
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });

    const body = await request.json();
    const period = body.period || currentPeriod();
    const paid = body.paid !== false;
    const note = `Bill: ${bill.name} (${period})`;

    if (paid) {
      const existing = await prisma.billPayment.findUnique({
        where: { billId_period: { billId: id, period } },
      });
      if (!existing) {
        const [y, m] = period.split("-").map(Number);
        const day = Math.min(bill.dueDay || 1, 28);
        await prisma.billPayment.create({ data: { billId: id, period } });
        await prisma.transaction.create({
          data: {
            userId,
            type: "expense",
            category: bill.category || "Bills",
            amount: bill.amount,
            note,
            walletId: bill.walletId || null,
            createdAt: new Date(y, m - 1, day),
          },
        });
      }
    } else {
      await prisma.billPayment.deleteMany({ where: { billId: id, period } });
      await prisma.transaction.deleteMany({ where: { userId, note } });
    }
    return NextResponse.json({ success: true, paid });
  } catch (error) {
    console.error("POST /api/bills/[id]/pay failed:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
