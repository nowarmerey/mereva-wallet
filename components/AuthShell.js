"use client";

import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n";

// Full-page dark background with organic blobs and a single floating card.
export default function AuthShell({ children }) {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#171c3a] via-[#1e2550] to-[#141937] text-white">
      {/* Decorative organic blobs */}
      <div className="pointer-events-none absolute -left-24 -top-28 h-[28rem] w-[28rem] rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full bg-violet-700/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-44 left-1/4 h-[26rem] w-[26rem] rounded-full bg-blue-600/15 blur-3xl" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size={34} />
          <span className="text-xl font-bold">
            Mereva <span className="text-[#ff5a5f]">Wallet</span>
          </span>
        </Link>
        <LanguageSelector />
      </header>

      {/* Content: marketing text + floating card */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-12 px-6 py-8 lg:flex-row lg:justify-between">
        <div className="hidden max-w-md lg:block">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            {t("auth.panelTitle")}
          </h2>
          <p className="mt-4 text-lg text-slate-300">{t("auth.panelSubtitle")}</p>
        </div>

        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-slate-800 shadow-2xl dark:bg-slate-900 glass-modal dark:text-slate-100">
          {children}
        </div>
      </main>

      {/* Footer legal links — shown once, centered */}
      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-5 px-6 pb-6 text-xs text-slate-400">
        <Link href="/legal/terms" className="hover:text-white">{t("legal.terms")}</Link>
        <Link href="/legal/privacy" className="hover:text-white">{t("legal.privacy")}</Link>
        <Link href="/legal/choices" className="hover:text-white">{t("legal.choices")}</Link>
        <span>© {new Date().getFullYear()} Mereva Wallet</span>
      </footer>
    </div>
  );
}
