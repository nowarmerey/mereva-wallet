import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/feedback -> approved reviews (public, for the landing testimonials)
export async function GET() {
  try {
    const items = await prisma.feedback.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, name: true, rating: true, message: true, createdAt: true },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/feedback failed:", error);
    return NextResponse.json([]);
  }
}

// POST /api/feedback { rating, message } -> submit a review (pending approval)
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rating, message } = await request.json();
    const r = Math.min(5, Math.max(1, Number(rating) || 5));
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await prisma.feedback.create({
      data: {
        userId: user.id,
        name: user.name || (user.email ? user.email.split("@")[0] : "User"),
        rating: r,
        message: message.trim().slice(0, 1000),
        approved: false,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/feedback failed:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
