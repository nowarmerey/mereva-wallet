"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n";

const PAGES = [
  { href: "/legal/impressum", key: "legal.impressum" },
  { href: "/legal/agb", key: "legal.agb" },
  { href: "/legal/widerruf", key: "legal.widerruf" },
  { href: "/legal/terms", key: "legal.terms" },
  { href: "/legal/privacy", key: "legal.privacy" },
  { href: "/legal/security", key: "legal.security" },
  { href: "/legal/us-privacy", key: "legal.usPrivacy" },
  { href: "/legal/acceptable-use", key: "legal.aup" },
  { href: "/legal/accessibility", key: "legal.accessibility" },
  { href: "/legal/privacy-choices", key: "legal.choices" },
];

export default function LegalLayout({ children }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo size={28} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {t("legal.backHome")}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar nav */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {t("legal.title")}
          </p>
          <nav className="flex flex-col gap-1">
            {PAGES.map((p) => {
              const active = pathname === p.href;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {t(p.key)}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
