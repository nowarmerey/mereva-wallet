import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, userHasAccess } from "@/lib/session";

// GET /api/me -> current user, membership and computed access flag.
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ user: null });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      locale: true,
      passwordHash: true,
    },
  });

  const membership = await prisma.userSubscription.findUnique({
    where: { userId: user.id },
    include: { plan: true },
  });

  const hasGoogle = !!(await prisma.account.findFirst({
    where: { userId: user.id, provider: "google" },
    select: { id: true },
  }));

  const access = await userHasAccess(user.id, dbUser?.role);

  // Never expose the hash — only whether a password is set.
  const hasPassword = !!dbUser?.passwordHash;
  if (dbUser) delete dbUser.passwordHash;

  return NextResponse.json({ user: dbUser, membership, access, hasGoogle, hasPassword });
}
