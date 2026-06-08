import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

// Returns the session user ({ id, email, name, role }) or null.
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

// Returns the user id, or null if not signed in.
export async function requireUserId() {
  const user = await getCurrentUser();
  return user?.id || null;
}

// Returns the user id only if the signed-in user is an ADMIN, else null.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return null;
  return user.id;
}

// Whether a user currently has access to the paid app.
// Admins always have access. Otherwise an active/trialing membership, an
// admin-granted membership, or a still-valid period grants access.
export async function userHasAccess(userId, role) {
  if (role === "ADMIN") return true;
  const m = await prisma.userSubscription.findUnique({ where: { userId } });
  if (!m) return false;
  if (m.grantedByAdmin) {
    if (!m.currentPeriodEnd) return true;
    return new Date(m.currentPeriodEnd) > new Date();
  }
  if (["active", "trialing"].includes(m.status)) {
    if (!m.currentPeriodEnd) return true;
    return new Date(m.currentPeriodEnd) > new Date();
  }
  return false;
}
