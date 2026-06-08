import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

// POST /api/account/unlink-google
// Removes the Google link from the current account. Refuses if it would lock
// the user out (no password set and Google is the only sign-in method).
export async function POST() {
  try {
    const userId = await requireUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const googleAccounts = user.accounts.filter((a) => a.provider === "google");
    if (googleAccounts.length === 0) {
      return NextResponse.json({ error: "No Google account is linked." }, { status: 400 });
    }

    const otherAccounts = user.accounts.filter((a) => a.provider !== "google");
    // Lockout guard: must keep at least one way in.
    if (!user.passwordHash && otherAccounts.length === 0) {
      return NextResponse.json(
        {
          error:
            "Set an account password first — otherwise you'd be locked out after unlinking Google.",
          code: "NEEDS_PASSWORD",
        },
        { status: 400 }
      );
    }

    await prisma.account.deleteMany({ where: { userId, provider: "google" } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/account/unlink-google failed:", error);
    return NextResponse.json({ error: "Failed to unlink Google" }, { status: 500 });
  }
}
