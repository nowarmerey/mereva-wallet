import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/auth/reset { token, password } -> sets a new password
export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token) return NextResponse.json({ error: "Invalid link" }, { status: 400 });
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || !record.identifier.startsWith("reset:")) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
    }
    if (record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return NextResponse.json({ error: "This link has expired" }, { status: 400 });
    }

    const email = record.identifier.slice("reset:".length);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(password, 10) },
    });
    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/reset failed:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
