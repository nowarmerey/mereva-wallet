"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import WalletSelector from "./WalletSelector";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";
import { LogoMark } from "./Logo";
import { useI18n } from "@/lib/i18n";

const titleKeys = {
  "/dashboard": "nav.dashboard",
  "/transactions": "nav.transactions",
  "/wallets": "nav.wallets",
  "/bills": "nav.bills",
  "/subscriptions": "nav.subscriptions",
  "/goals": "nav.goals",
  "/analytics": "nav.analytics",
  "/reports": "nav.reports",
  "/categories": "nav.categories",
  "/help": "nav.help",
  "/billing": "nav.billing",
  "/settings": "nav.settings",
  "/admin": "nav.admin",
};

const mobileLinks = [
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/transactions", key: "nav.transactions" },
  { href: "/wallets", key: "nav.wallets" },
  { href: "/bills", key: "nav.bills" },
  { href: "/subscriptions", key: "nav.subscriptions" },
  { href: "/goals", key: "nav.goals" },
  { href: "/analytics", key: "nav.analytics" },
  { href: "/reports", key: "nav.reports" },
  { href: "/categories", key: "nav.categories" },
  { href: "/help", key: "nav.help" },
  { href: "/billing", key: "nav.billing" },
  { href: "/settings", key: "nav.settings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const links = isAdmin
    ? [...mobileLinks, { href: "/admin", key: "nav.admin" }]
    : mobileLinks;

  const title = t(titleKeys[pathname] || "app.name");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 glass-chrome">
      <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="md:hidden" title="Home">
            <LogoMark size={26} />
          </Link>
          <h1 className="truncate text-base font-semibold text-slate-800 sm:text-lg dark:text-slate-100">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <WalletSelector />
          <LanguageSelector />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden dark:border-slate-800">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {t(link.key)}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
