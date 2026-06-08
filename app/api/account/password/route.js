import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

// POST /api/account/password { currentPassword?, newPassword }
// Sets or changes the account password. Google-only users (no password yet)
// can set one without providing a current password.
export async function POST(request) {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If a password already exists, the current one must match.
    if (user.passwordHash) {
      const ok = await bcrypt.compare(currentPassword || "", user.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 403 }
        );
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/account/password failed:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
