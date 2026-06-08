import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled } from "@/lib/stripe";

// Stripe requires the raw body for signature verification.
export const dynamic = "force-dynamic";

async function syncSubscription(sub) {
  const customerId = sub.customer;
  const membership = await prisma.userSubscription.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!membership) return;

  const priceId = sub.items?.data?.[0]?.price?.id;
  const plan = priceId
    ? await prisma.plan.findFirst({ where: { stripePriceId: priceId } })
    : null;

  await prisma.userSubscription.update({
    where: { id: membership.id },
    data: {
      status: sub.status, // active | trialing | past_due | canceled | ...
      stripeSubscriptionId: sub.id,
      planId: plan?.id ?? membership.planId,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
      grantedByAdmin: false,
    },
  });
}

export async function POST(request) {
  if (!stripeEnabled) return NextResponse.json({ received: true });

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook handling error:", e);
  }

  return NextResponse.json({ received: true });
}
