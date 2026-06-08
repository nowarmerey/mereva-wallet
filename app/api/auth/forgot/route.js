import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/mail";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// POST /api/auth/forgot { email } -> emails a reset link (if the account exists)
export async function POST(request) {
  try {
    const ip = clientIp(request);
    const rl = rateLimit(`forgot:${ip}`, { limit: 5, windowMs: 15 * 60_000 });
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests. Try later." }, { status: 429 });
    }

    const { email } = await request.json();
    const normalized = (email || "").toLowerCase().trim();

    // Always return success to avoid leaking which emails are registered.
    if (!normalized) return NextResponse.json({ ok: true });

    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (user) {
      const identifier = `reset:${normalized}`;
      await prisma.verificationToken.deleteMany({ where: { identifier } });
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await prisma.verificationToken.create({ data: { identifier, token, expires } });

      const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
      const url = `${base}/reset?token=${token}`;
      await sendEmail({
        to: normalized,
        subject: "Reset your Mereva Wallet password",
        html: emailLayout(
          "Reset your password",
          `<p>We received a request to reset your password. This link expires in 1 hour.</p>
           <p>If you didn't request this, you can safely ignore this email.</p>`,
          { url, label: "Reset password" }
        ),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/forgot failed:", error);
    return NextResponse.json({ ok: true }); // don't leak errors
  }
}
