import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error("GET /api/goals failed:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, target, saved, deadline, icon } = body;
    if (!name || !name.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const t = Number(target);
    if (!t || t <= 0) return NextResponse.json({ error: "target must be > 0" }, { status: 400 });

    const created = await prisma.goal.create({
      data: {
        userId,
        name: name.trim(),
        target: t,
        saved: saved ? Number(saved) : 0,
        icon: icon || "🎯",
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/goals failed:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
