import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// PUT /api/admin/users/:id
// Body: { role? } | { grantDays } | { unlimited:true } | { trialDays } | { revoke:true }
export async function PUT(request, { params }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = params.id;
  const body = await request.json();

  // Change role
  if (body.role) {
    if (!["USER", "ADMIN"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const u = await prisma.user.update({ where: { id }, data: { role: body.role } });
    return NextResponse.json({ success: true, role: u.role });
  }

  // Grant unlimited / lifetime access (no end date)
  if (body.unlimited) {
    const membership = await prisma.userSubscription.upsert({
      where: { userId: id },
      update: { status: "active", grantedByAdmin: true, currentPeriodEnd: null },
      create: { userId: id, status: "active", grantedByAdmin: true, currentPeriodEnd: null },
    });
    return NextResponse.json({ success: true, membership });
  }

  // Grant a trial period (status "trialing") for N days
  if (body.trialDays !== undefined) {
    const days = Math.max(1, Number(body.trialDays) || 14);
    const end = new Date();
    end.setDate(end.getDate() + days);
    const membership = await prisma.userSubscription.upsert({
      where: { userId: id },
      update: { status: "trialing", grantedByAdmin: true, currentPeriodEnd: end },
      create: { userId: id, status: "trialing", grantedByAdmin: true, currentPeriodEnd: end },
    });
    return NextResponse.json({ success: true, membership });
  }

  // Grant / extend full access for N days
  if (body.grantDays !== undefined) {
    const days = Math.max(1, Number(body.grantDays) || 30);
    const end = new Date();
    end.setDate(end.getDate() + days);
    const membership = await prisma.userSubscription.upsert({
      where: { userId: id },
      update: {
        status: "active",
        grantedByAdmin: true,
        currentPeriodEnd: end,
        planId: body.planId ?? undefined,
      },
      create: {
        userId: id,
        status: "active",
        grantedByAdmin: true,
        currentPeriodEnd: end,
        planId: body.planId ?? null,
      },
    });
    return NextResponse.json({ success: true, membership });
  }

  // Revoke access
  if (body.revoke) {
    await prisma.userSubscription.upsert({
      where: { userId: id },
      update: { status: "canceled", grantedByAdmin: false, currentPeriodEnd: new Date() },
      create: { userId: id, status: "canceled" },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "No action provided" }, { status: 400 });
}

// DELETE /api/admin/users/:id  (cannot delete yourself)
export async function DELETE(request, { params }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (params.id === adminId) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
