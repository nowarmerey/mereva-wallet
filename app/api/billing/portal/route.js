import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe, stripeEnabled } from "@/lib/stripe";

// POST /api/billing/portal -> { url } Stripe customer portal.
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!stripeEnabled) return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });

    const membership = await prisma.userSubscription.findUnique({ where: { userId: user.id } });
    if (!membership?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    const portal = await stripe.billingPortal.sessions.create({
      customer: membership.stripeCustomerId,
      return_url: `${base}/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("POST /api/billing/portal failed:", error);
    return NextResponse.json({ error: "Failed to open portal" }, { status: 500 });
  }
}
