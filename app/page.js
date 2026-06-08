"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo, { LogoMark } from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useI18n();
  const { status } = useSession();
  const authed = status === "authenticated";

  // Approved reviews (fall back to sample testimonials when none yet).
  const [reviews, setReviews] = useState(null);
  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => setReviews([]));
  }, []);
  const sampleReviews = [
    { name: "Lina", rating: 5, message: "Finally I know where my money goes every month. So simple!" },
    { name: "Omar", rating: 5, message: "The budgets and reminders keep me on track. Love the clean design." },
    { name: "Sophie", rating: 5, message: "Multiple wallets and the forecast are exactly what I needed." },
  ];
  const shownReviews = reviews && reviews.length > 0 ? reviews : sampleReviews;

  const features = [
    { icon: "🎯", title: t("land.f1Title"), desc: t("land.f1Desc") },
    { icon: "👛", title: t("land.f2Title"), desc: t("land.f2Desc") },
    { icon: "🧾", title: t("land.f3Title"), desc: t("land.f3Desc") },
    { icon: "📈", title: t("land.f4Title"), desc: t("land.f4Desc") },
    { icon: "📊", title: t("land.f5Title"), desc: t("land.f5Desc") },
    { icon: "🔒", title: t("land.f6Title"), desc: t("land.f6Desc") },
  ];

  const steps = [
    { n: "1", title: t("land.s1Title"), desc: t("land.s1Desc") },
    { n: "2", title: t("land.s2Title"), desc: t("land.s2Desc") },
    { n: "3", title: t("land.s3Title"), desc: t("land.s3Desc") },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo size={30} />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/about"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("nav.about")}
            </Link>
            <LanguageSelector />
            {authed ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {t("land.openApp")}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t("common.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {t("land.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-950/30" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              ✨ {t("land.heroBadge")}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {t("land.heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              {t("land.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={authed ? "/dashboard" : "/register"}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                {authed ? t("land.openApp") : t("land.heroCta")}
              </Link>
              <Link
                href="#features"
                className="rounded-xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("nav.help")}
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-400">{t("land.heroNote")}</p>
          </div>

          {/* Hero mock card */}
          <div className="relative">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-400/30 blur-2xl animate-blob" />
            <div className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-emerald-400/30 blur-2xl animate-blob" style={{ animationDelay: "3s" }} />
            <div className="relative animate-float rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <LogoMark size={24} /> {t("nav.dashboard")}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  {t("billing.active")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label={t("dash.income")} value="$2,115" accent="text-emerald-600" />
                <MiniStat label={t("dash.expense")} value="$1,171" accent="text-rose-600" />
                <MiniStat label={t("dash.balance")} value="$943" accent="text-indigo-600" />
              </div>
              <div className="mt-4 space-y-2">
                {[["🍔", "Food", "-$95"], ["💼", "Salary", "+$3,200"], ["🏠", "Rent", "-$950"]].map(
                  ([ic, name, amt], i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
                    >
                      <span>{ic} {name}</span>
                      <span className={amt.startsWith("+") ? "text-emerald-600" : "text-rose-600"}>
                        {amt}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t("land.featuresTitle")}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{t("land.featuresSub")}</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="animate-fadeup rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-2xl dark:bg-indigo-500/15">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">{t("land.howTitle")}</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / reviews */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t("land.reviewsTitle")}</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{t("land.reviewsSub")}</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shownReviews.slice(0, 6).map((r, i) => (
            <figure
              key={r.id || i}
              className="animate-fadeup rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="text-amber-400">
                {"⭐".repeat(Math.min(5, Math.max(1, r.rating || 5)))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                “{r.message}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-500/20">
                  {(r.name || "?")[0]?.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {r.name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pricing teaser / CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight">{t("land.ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">{t("land.ctaSub")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={authed ? "/dashboard" : "/register"}
              className="rounded-xl bg-white px-6 py-3 text-base font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              {authed ? t("land.openApp") : t("land.heroCta")}
            </Link>
            <Link
              href="/billing"
              className="rounded-xl border border-white/40 px-6 py-3 text-base font-semibold text-white hover:bg-white/10"
            >
              {t("land.viewPlans")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Logo size={26} />
              <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                {t("app.tagline")}
              </p>
            </div>

            {/* Company */}
            <div>
              <p className="mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {t("footer.company")}
              </p>
              <nav className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("nav.about")}</Link>
                <Link href="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("nav.help")}</Link>
                <Link href="/billing" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("nav.billing")}</Link>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {t("legal.title")}
              </p>
              <nav className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/legal/impressum" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("legal.impressum")}</Link>
                <Link href="/legal/agb" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("legal.agb")}</Link>
                <Link href="/legal/widerruf" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("legal.widerruf")}</Link>
                <Link href="/legal/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("legal.privacy")}</Link>
                <Link href="/legal/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("legal.terms")}</Link>
                <Link href="/legal/security" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t("legal.security")}</Link>
              </nav>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-slate-400 sm:text-start">
            © {new Date().getFullYear()} Mereva Wallet — {t("land.footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}
