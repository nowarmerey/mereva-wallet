import crypto from "crypto";
import { prisma } from "./prisma";
import { sendEmail, emailLayout } from "./mail";

// Creates a verification token and emails a verification link.
export async function sendVerificationEmail(email) {
  const normalized = email.toLowerCase().trim();
  const identifier = `verify:${normalized}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await prisma.verificationToken.create({ data: { identifier, token, expires } });

  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  const url = `${base}/api/auth/verify?token=${token}`;
  await sendEmail({
    to: normalized,
    subject: "Confirm your email — Mereva Wallet",
    html: emailLayout(
      "Confirm your email",
      `<p>Welcome to Mereva Wallet! Please confirm your email address to secure your account.</p>`,
      { url, label: "Confirm email" }
    ),
  });
}
