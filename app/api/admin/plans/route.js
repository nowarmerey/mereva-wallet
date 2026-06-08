import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET /api/admin/plans -> all plans (incl. inactive)
export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(plans);
}

// POST /api/admin/plans -> create a plan / offer
export async function POST(request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = await request.json();
  if (!b.name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const plan = await prisma.plan.create({
    data: {
      name: b.name.trim(),
      description: b.description || null,
      priceCents: Math.round(Number(b.price || 0) * 100),
      currency: (b.currency || "usd").toLowerCase(),
      interval: b.interval || "month",
      features: Array.isArray(b.features) ? JSON.stringify(b.features) : b.features || null,
      stripePriceId: b.stripePriceId || null,
      trialDays: Number(b.trialDays || 0),
      isFeatured: !!b.isFeatured,
      active: b.active !== false,
      sortOrder: Number(b.sortOrder || 0),
    },
  });
  return NextResponse.json(plan, { status: 201 });
}
