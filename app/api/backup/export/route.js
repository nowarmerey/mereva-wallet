import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { buildBackup } from "@/lib/backup";

// GET /api/backup/export -> downloads a JSON backup of the user's data.
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const backup = await buildBackup(userId);
  const json = JSON.stringify(backup, null, 2);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="wallet-backup-${date}.json"`,
    },
  });
}
