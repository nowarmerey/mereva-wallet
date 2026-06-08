import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/plans -> active plans (public, used by the billing/pricing page).
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { priceCents: "asc" }],
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/plans failed:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
