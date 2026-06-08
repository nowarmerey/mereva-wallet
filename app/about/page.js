"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo, { LogoMark } from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();
  const { status } = useSession();
  const authed = status === "authenticated";

  const values = [
    { icon: "✨", title: "Simplicity", desc: "Open it any day without a manual. Clean screens, no clutter — just the numbers that matter." },
    { icon: "🎮", title: "Control", desc: "Give every amount a purpose, set limits, and decide where your money goes before it disappears." },
    { icon: "🔒", title: "Privacy first", desc: "Your money data is yours. We don’t sell it and keep only what’s needed to run the app." },
    { icon: "🌍", title: "Made for newcomers too", desc: "Multiple wallets, currencies and languages — handy when you’re building a life in a new country." },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/"><Logo size={28} /></Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <Link
              href={authed ? "/dashboard" : "/register"}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {authed ? t("land.openApp") : t("land.getStarted")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="mx-auto mb-5 w-fit"><LogoMark size={48} /></div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Where did the salary go?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Mereva Wallet was built to answer that end-of-month question — and to
            turn it into calm, everyday control over your money.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-14 px-6 py-16">
        {/* Story */}
        <section>
          <h2 className="text-2xl font-bold">Our story</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-slate-600 dark:text-slate-300">
            <p>
              Mereva Wallet is built by one person: a software engineer who moved
              from Syria to Germany and had to rebuild financial life from
              scratch — new country, new currency, new systems. Like many people,
              every month ended with the same puzzled question: how did the whole
              salary melt away so fast?
            </p>
            <p>
              There’s an old saying that became the heart of this project:
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {" "}“once you know the cause, the wonder disappears.”
              </span>{" "}
              The moment you can actually see where your money goes, the
              end-of-month mystery is gone, and good decisions become easy.
            </p>
            <p>
              So in 2025, in Germany, that simple idea became a tool: a clean
              place to track income and expenses, set budgets, plan for bills and
              reach saving goals. It put its maker back on the right financial
              track — and Mereva Wallet is the result, shared so anyone can do the
              same.
            </p>
          </div>
        </section>

        {/* Philosophy / motto callout */}
        <section className="rounded-3xl bg-slate-900 px-8 py-10 text-center text-white dark:bg-slate-800/60">
          <p className="text-2xl font-bold leading-snug">
            “Once you know the cause, the wonder disappears.”
          </p>
          <p className="mt-3 text-slate-300">
            See where it goes — and the surprise turns into a plan.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="text-2xl font-bold">Our mission</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            To help anyone — wherever they’re starting from — feel in control of
            their money, through radical simplicity and a clear picture of every
            dinar, euro and dollar.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold">What we believe</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <div className="text-2xl">{v.icon}</div>
                <h3 className="mt-2 font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision */}
        <section>
          <h2 className="text-2xl font-bold">Where we’re going</h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-300">
            Mereva Wallet is independent and still growing — built and maintained
            by one engineer who uses it every day. The plan is simple: keep it
            fast, private and easy, and add only what genuinely helps people stay
            in control. Smarter forecasts, deeper insights and more are on the
            way.
          </p>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-10 text-center text-white">
          <h2 className="text-2xl font-bold">Take control of your money.</h2>
          <p className="mx-auto mt-2 max-w-md text-indigo-100">
            Start free today and finally see where your money really goes.
          </p>
          <Link
            href={authed ? "/dashboard" : "/register"}
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            {authed ? t("land.openApp") : t("land.heroCta")}
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <Logo size={22} />
          <nav className="flex flex-wrap justify-center gap-4">
            <Link href="/legal/terms" className="hover:text-indigo-600">{t("legal.terms")}</Link>
            <Link href="/legal/privacy" className="hover:text-indigo-600">{t("legal.privacy")}</Link>
            <Link href="/legal/security" className="hover:text-indigo-600">{t("legal.security")}</Link>
          </nav>
          <span>© {new Date().getFullYear()} Mereva Wallet</span>
        </div>
      </footer>
    </div>
  );
}
