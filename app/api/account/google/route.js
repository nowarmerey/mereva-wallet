import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

// Decode a JWT payload (no verification needed — it's our own stored id_token).
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

// GET /api/account/google -> details of the linked Google account.
export async function GET() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const account = await prisma.account.findFirst({
      where: { userId, provider: "google" },
    });
    if (!account) return NextResponse.json({ linked: false });

    const claims = account.id_token ? decodeJwt(account.id_token) : null;

    return NextResponse.json({
      linked: true,
      email: claims?.email || null,
      name: claims?.name || null,
      picture: claims?.picture || null,
      emailVerified: claims?.email_verified ?? null,
      providerAccountId: account.providerAccountId,
      scopes: account.scope ? account.scope.split(" ") : [],
      hasDriveAccess: !!(account.scope || "").includes("drive"),
    });
  } catch (error) {
    console.error("GET /api/account/google failed:", error);
    return NextResponse.json({ error: "Failed to load Google account" }, { status: 500 });
  }
}
