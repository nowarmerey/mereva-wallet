import { google } from "googleapis";
import { prisma } from "./prisma";

// Build an authenticated Google Drive client for a user from their stored
// OAuth tokens (requires the user to have signed in with Google).
export async function getDriveClient(userId) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account?.access_token) {
    throw new Error("No Google account linked. Sign in with Google first.");
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token || undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Persist refreshed tokens back to the DB.
  oauth2.on("tokens", async (tokens) => {
    try {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token ?? account.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : account.expires_at,
          ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
        },
      });
    } catch (e) {
      console.error("Failed to persist refreshed Google tokens:", e);
    }
  });

  return google.drive({ version: "v3", auth: oauth2 });
}
