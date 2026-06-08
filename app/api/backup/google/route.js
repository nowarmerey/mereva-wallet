import { NextResponse } from "next/server";
import { Readable } from "stream";
import { requireUserId } from "@/lib/session";
import { buildBackup } from "@/lib/backup";
import { getDriveClient } from "@/lib/google";

// GET /api/backup/google -> list previous backups stored on the user's Drive.
export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const drive = await getDriveClient(userId);
    const res = await drive.files.list({
      q: "name contains 'wallet-backup' and trashed = false",
      fields: "files(id, name, createdTime, size)",
      orderBy: "createdTime desc",
      pageSize: 20,
    });
    return NextResponse.json({ files: res.data.files || [] });
  } catch (error) {
    console.error("GET /api/backup/google failed:", error);
    return NextResponse.json({ error: error.message || "Drive error" }, { status: 400 });
  }
}

// POST /api/backup/google -> upload a fresh backup to the user's Google Drive.
export async function POST() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const drive = await getDriveClient(userId);
    const backup = await buildBackup(userId);
    const json = JSON.stringify(backup, null, 2);
    const date = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    const res = await drive.files.create({
      requestBody: {
        name: `wallet-backup-${date}.json`,
        mimeType: "application/json",
      },
      media: {
        mimeType: "application/json",
        body: Readable.from([json]),
      },
      fields: "id, name, createdTime",
    });

    // Keep only the newest backup: delete all older wallet-backup files.
    try {
      const list = await drive.files.list({
        q: "name contains 'wallet-backup' and trashed = false",
        fields: "files(id, name)",
        pageSize: 100,
      });
      for (const f of list.data.files || []) {
        if (f.id !== res.data.id) {
          await drive.files.delete({ fileId: f.id }).catch(() => {});
        }
      }
    } catch (e) {
      console.error("Pruning old Drive backups failed:", e);
    }

    return NextResponse.json({ success: true, file: res.data });
  } catch (error) {
    console.error("POST /api/backup/google failed:", error);
    return NextResponse.json({ error: error.message || "Failed to back up to Drive" }, { status: 400 });
  }
}
