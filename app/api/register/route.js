import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { seedNewUser } from "@/lib/seed-user";
import { sendVerificationEmail } from "@/lib/account-email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// POST /api/register -> { name, email, password }
export async function POST(request) {
  try {
    const rl = rateLimit(`register:${clientIp(request)}`, { limit: 5, windowMs: 15 * 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const { name, email, password } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalized,
        name: name?.trim() || normalized.split("@")[0],
        passwordHash,
        role: "USER",
      },
    });

    // Give every new user a default wallet, starter categories, settings and a trial.
    await seedNewUser(user.id);

    // Send a verification email (no-op-safe if email isn't configured).
    sendVerificationEmail(normalized).catch((e) =>
      console.error("verification email failed:", e)
    );

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/register failed:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
