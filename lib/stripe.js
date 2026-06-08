import Stripe from "stripe";

// Stripe is optional: if no secret key is set the app runs with
// admin-managed subscriptions only (no online payments).
export const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

export const stripe = stripeEnabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;
