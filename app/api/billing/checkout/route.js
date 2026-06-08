import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe, stripeEnabled } from "@/lib/stripe";

// POST /api/billing/checkout { planId } -> { url } Stripe Checkout session.
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!stripeEnabled) {
      return NextResponse.json(
        { error: "Online payments are not configured yet. Please contact the admin." },
        { status: 400 }
      );
    }

    const { planId } = await request.json();
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json({ error: "This plan is not available for online checkout." }, { status: 400 });
    }

    // Reuse or create a Stripe customer for this user.
    let membership = await prisma.userSubscription.findUnique({ where: { userId: user.id } });
    let customerId = membership?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      membership = await prisma.userSubscription.upsert({
        where: { userId: user.id },
        update: { stripeCustomerId: customerId },
        create: { userId: user.id, stripeCustomerId: customerId, status: "none" },
      });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      ...(plan.trialDays > 0
        ? { subscription_data: { trial_period_days: plan.trialDays } }
        : {}),
      success_url: `${base}/billing?status=success`,
      cancel_url: `${base}/billing?status=cancelled`,
      metadata: { userId: user.id, planId: plan.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("POST /api/billing/checkout failed:", error);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
