import webpush from "web-push";
import { prisma } from "./prisma";

let configured = false;
export const pushEnabled = !!(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
);

function ensureConfigured() {
  if (configured || !pushEnabled) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  configured = true;
}

// Send a push notification to all of a user's subscribed devices.
// Safe no-op if push isn't configured.
export async function sendPushToUser(userId, payload) {
  if (!pushEnabled) return;
  ensureConfigured();
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const body = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
      } catch (e) {
        // Subscription expired/invalid -> remove it.
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}
