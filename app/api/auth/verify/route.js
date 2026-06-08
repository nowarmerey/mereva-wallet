import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/auth/verify?token=... -> marks the email as verified, then redirects.
export async function GET(request) {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return NextResponse.redirect(`${base}/login?verify=invalid`);

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || !record.identifier.startsWith("verify:") || record.expires < new Date()) {
      return NextResponse.redirect(`${base}/login?verify=invalid`);
    }

    const email = record.identifier.slice("verify:".length);
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }).catch(() => {});
    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });

    return NextResponse.redirect(`${base}/dashboard?verified=1`);
  } catch (error) {
    console.error("GET /api/auth/verify failed:", error);
    return NextResponse.redirect(`${base}/login?verify=error`);
  }
}
