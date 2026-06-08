import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

function csvCell(v) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// GET /api/export/transactions?from&to&type&category&walletId -> CSV download
export async function GET(request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const where = { userId };
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const walletId = searchParams.get("walletId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (type) where.type = type;
  if (category) where.category = category;
  if (walletId) where.walletId = Number(walletId);
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const rows = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { wallet: true },
  });

  const header = ["Date", "Type", "Category", "Wallet", "Amount", "Note"];
  const lines = [header.join(",")];
  for (const t of rows) {
    lines.push(
      [
        new Date(t.createdAt).toISOString().slice(0, 10),
        t.type,
        t.category,
        t.wallet?.name || "",
        t.amount,
        t.note || "",
      ]
        .map(csvCell)
        .join(",")
    );
  }
  const csv = "﻿" + lines.join("\n"); // BOM for Excel/Arabic

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
