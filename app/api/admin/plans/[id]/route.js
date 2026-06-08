import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export async function PUT(request, { params }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = await request.json();
  const data = {};
  if (b.name !== undefined) data.name = b.name.trim();
  if (b.description !== undefined) data.description = b.description || null;
  if (b.price !== undefined) data.priceCents = Math.round(Number(b.price) * 100);
  if (b.currency !== undefined) data.currency = b.currency.toLowerCase();
  if (b.interval !== undefined) data.interval = b.interval;
  if (b.features !== undefined)
    data.features = Array.isArray(b.features) ? JSON.stringify(b.features) : b.features;
  if (b.stripePriceId !== undefined) data.stripePriceId = b.stripePriceId || null;
  if (b.trialDays !== undefined) data.trialDays = Number(b.trialDays);
  if (b.isFeatured !== undefined) data.isFeatured = !!b.isFeatured;
  if (b.active !== undefined) data.active = !!b.active;
  if (b.sortOrder !== undefined) data.sortOrder = Number(b.sortOrder);

  const plan = await prisma.plan.update({ where: { id: params.id }, data });
  return NextResponse.json(plan);
}

export async function DELETE(request, { params }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.plan.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
