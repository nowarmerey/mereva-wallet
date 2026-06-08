import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

// GET /api/transactions/suggest?note=...&type=expense  (smart categorization)
export async function GET(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ category: null });

    const { searchParams } = new URL(request.url);
    const note = (searchParams.get("note") || "").trim().toLowerCase();
    const type = searchParams.get("type") || "expense";
    if (note.length < 2) return NextResponse.json({ category: null });

    const past = await prisma.transaction.findMany({
      where: { userId, type, note: { not: null } },
      select: { category: true, note: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const tokens = note.split(/\s+/).filter((t) => t.length >= 2);
    const scores = {};
    for (const t of past) {
      const n = (t.note || "").toLowerCase();
      let score = 0;
      if (n === note) score += 10;
      else if (n.includes(note) || note.includes(n)) score += 5;
      for (const tok of tokens) if (n.includes(tok)) score += 2;
      if (score > 0) scores[t.category] = (scores[t.category] || 0) + score;
    }

    let best = null;
    let bestScore = 0;
    for (const [cat, s] of Object.entries(scores)) {
      if (s > bestScore) {
        best = cat;
        bestScore = s;
      }
    }
    return NextResponse.json({ category: best, score: bestScore });
  } catch (error) {
    console.error("GET /api/transactions/suggest failed:", error);
    return NextResponse.json({ category: null });
  }
}
