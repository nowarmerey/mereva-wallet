import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

// GET /api/admin/feedback -> all feedback (admin)
export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}
