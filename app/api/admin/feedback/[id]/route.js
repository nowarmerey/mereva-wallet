import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// PUT /api/admin/feedback/:id { approved } -> approve/unapprove
export async function PUT(request, { params }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = Number(params.id);
  const { approved } = await request.json();
  const item = await prisma.feedback.update({
    where: { id },
    data: { approved: !!approved },
  });
  return NextResponse.json(item);
}

// DELETE /api/admin/feedback/:id
export async function DELETE(request, { params }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.feedback.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
}
