"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import Logo from "./Logo";

const links = [
  { href: "/dashboard", key: "nav.dashboard", icon: "🏠" },
  { href: "/transactions", key: "nav.transactions", icon: "💳" },
  { href: "/wallets", key: "nav.wallets", icon: "👛" },
  { href: "/bills", key: "nav.bills", icon: "🧾" },
  { href: "/subscriptions", key: "nav.subscriptions", icon: "🔁" },
  { href: "/goals", key: "nav.goals", icon: "🎯" },
  { href: "/analytics", key: "nav.analytics", icon: "📈" },
  { href: "/reports", key: "nav.reports", icon: "📊" },
  { href: "/categories", key: "nav.categories", icon: "🏷️" },
  { href: "/help", key: "nav.help", icon: "❓" },
  { href: "/billing", key: "nav.billing", icon: "💎" },
  { href: "/settings", key: "nav.settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const allLinks = isAdmin
    ? [...links, { href: "/admin", key: "nav.admin", icon: "🛡️" }]
    : links;

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 glass-chrome">
      <Link href="/" className="mb-6 block px-2" title="Mereva Wallet — Home">
        <Logo size={30} />
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {allLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {t(link.key)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="truncate px-2 text-xs text-slate-400">
          {session?.user?.email}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          🚪 {t("common.signOut")}
        </button>
      </div>
    </aside>
  );
}
