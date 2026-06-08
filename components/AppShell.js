"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import SecurityGate from "./SecurityGate";
import UpgradePrompt from "./UpgradePrompt";
import { useI18n } from "@/lib/i18n";

// Pages that render without the app chrome (full-screen).
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot", "/reset"];
// Pages a signed-in user can always reach even without an active subscription.
const ALWAYS_ALLOWED = ["/billing", "/help", "/settings"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useI18n();

  const [access, setAccess] = useState(null); // null = unknown
  // Landing, auth pages and the legal/privacy pages render without app chrome.
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname === "/about" ||
    pathname.startsWith("/legal");

  // Redirect unauthenticated users to /login (except on public pages).
  useEffect(() => {
    if (status === "unauthenticated" && !isPublic) {
      router.replace("/login");
    }
  }, [status, isPublic, router]);

  // Check subscription access once signed in.
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAccess(d?.access ?? false))
      .catch(() => setAccess(false));
  }, [status, pathname]);

  // Public pages: just render children.
  if (isPublic) return <>{children}</>;

  // While auth state is resolving.
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        {t("common.loading")}
      </div>
    );
  }

  const needsUpgrade =
    access === false && !ALWAYS_ALLOWED.some((p) => pathname.startsWith(p));

  return (
    <SecurityGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {needsUpgrade ? <UpgradePrompt /> : children}
          </main>
        </div>
      </div>
    </SecurityGate>
  );
}
