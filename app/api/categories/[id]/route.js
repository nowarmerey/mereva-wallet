import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function PUT(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const current = await prisma.category.findFirst({ where: { id, userId } });
    if (!current) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const body = await request.json();
    const { name, type, icon, monthlyLimit } = body;

    const data = {};
    if (name !== undefined && name.trim() && name.trim() !== current.name) data.name = name.trim();
    if (type !== undefined) data.type = type;
    if (icon !== undefined) data.icon = icon;
    if (monthlyLimit !== undefined) {
      data.monthlyLimit = monthlyLimit === null || monthlyLimit === "" ? null : Number(monthlyLimit);
    }

    const updated = await prisma.category.update({ where: { id }, data });

    if (data.name) {
      await prisma.transaction.updateMany({
        where: { userId, category: current.name },
        data: { category: data.name },
      });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/categories/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const owned = await prisma.category.findFirst({ where: { id, userId } });
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
