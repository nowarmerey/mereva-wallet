import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function PUT(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const current = await prisma.goal.findFirst({ where: { id, userId } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { name, target, saved, addAmount, deadline, icon } = body;

    const data = {};
    if (name !== undefined && name.trim()) data.name = name.trim();
    if (target !== undefined) data.target = Number(target);
    if (icon !== undefined) data.icon = icon;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (saved !== undefined) data.saved = Math.max(0, Number(saved));
    if (addAmount !== undefined) data.saved = Math.max(0, current.saved + Number(addAmount));

    const updated = await prisma.goal.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/goals/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.goal.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/goals/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
