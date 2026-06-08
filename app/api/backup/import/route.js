import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { restoreBackup } from "@/lib/backup";

// POST /api/backup/import { backup } -> replaces the user's data with the backup.
export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const backup = body.backup || body;
    await restoreBackup(userId, backup);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/backup/import failed:", error);
    return NextResponse.json({ error: error.message || "Failed to import backup" }, { status: 500 });
  }
}
