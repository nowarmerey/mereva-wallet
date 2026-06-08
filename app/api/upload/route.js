import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireUserId } from "@/lib/session";

// POST /api/upload  (multipart/form-data with a "file" field) -> { path }
export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads", userId);
    await mkdir(uploadDir, { recursive: true });

    const ext = (file.name?.split(".").pop() || "png").toLowerCase();
    const safeExt = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext) ? ext : "png";
    const filename = `receipt_${Date.now()}_${Math.round(Math.random() * 1e6)}.${safeExt}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ path: `/uploads/${userId}/${filename}` });
  } catch (error) {
    console.error("POST /api/upload failed:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
