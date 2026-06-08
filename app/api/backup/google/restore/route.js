import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { getDriveClient } from "@/lib/google";
import { restoreBackup } from "@/lib/backup";

// POST /api/backup/google/restore { fileId? }
// Downloads a backup from the user's Google Drive and restores it. If no
// fileId is given, restores the most recent wallet-backup file.
export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    let fileId = body.fileId;

    const drive = await getDriveClient(userId);

    // Fall back to the newest backup if no id provided.
    if (!fileId) {
      const list = await drive.files.list({
        q: "name contains 'wallet-backup' and trashed = false",
        fields: "files(id, name, createdTime)",
        orderBy: "createdTime desc",
        pageSize: 1,
      });
      fileId = list.data.files?.[0]?.id;
      if (!fileId) {
        return NextResponse.json({ error: "No backup found on Drive." }, { status: 404 });
      }
    }

    const fileRes = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "json" }
    );

    const backup = fileRes.data;
    await restoreBackup(userId, backup);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/backup/google/restore failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to restore from Drive" },
      { status: 400 }
    );
  }
}
