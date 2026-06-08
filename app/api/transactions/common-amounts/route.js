import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

// GET /api/transactions/common-amounts?type=&category=
// Returns the user's most frequently used amounts for that category/type
// (used for the floating "bubbles" quick-pick on the amount field).
export async function GET(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ amounts: [] });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "expense";
    const category = searchParams.get("category");
    if (!category) return NextResponse.json({ amounts: [] });

    const rows = await prisma.transaction.groupBy({
      by: ["amount"],
      where: { userId, type, category, isTransfer: false },
      _count: { amount: true },
      orderBy: [{ _count: { amount: "desc" } }, { amount: "asc" }],
      take: 6,
    });

    const amounts = rows.map((r) => r.amount).filter((a) => a > 0);
    return NextResponse.json({ amounts });
  } catch (error) {
    console.error("GET /api/transactions/common-amounts failed:", error);
    return NextResponse.json({ amounts: [] });
  }
}
