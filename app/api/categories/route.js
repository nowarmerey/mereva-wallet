import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function GET(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where = { userId };
    if (type) where.OR = [{ type }, { type: "both" }];

    const categories = await prisma.category.findMany({ where, orderBy: { name: "asc" } });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories failed:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, type, icon, monthlyLimit } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const existing = await prisma.category.findFirst({
      where: { userId, name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }

    const created = await prisma.category.create({
      data: {
        userId,
        name: name.trim(),
        type: type || "expense",
        icon: icon || "🏷️",
        monthlyLimit:
          monthlyLimit === undefined || monthlyLimit === null || monthlyLimit === ""
            ? null
            : Number(monthlyLimit),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories failed:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
