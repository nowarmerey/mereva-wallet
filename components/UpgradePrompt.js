"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";

// Shown when a user's trial/subscription has ended. A friendly "account paused"
// screen with a direct subscribe call-to-action.
export default function UpgradePrompt() {
  const { t } = useI18n();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const paid = (Array.isArray(list) ? list : [])
          .filter((p) => p.priceCents > 0)
          .sort((a, b) => a.priceCents - b.priceCents);
        setPlan(paid.find((p) => p.isFeatured) || paid[0] || null);
      })
      .catch(() => {});
  }, []);

  function features() {
    if (!plan?.features) return [];
    try {
      const f = JSON.parse(plan.features);
      return Array.isArray(f) ? f.slice(0, 4) : [];
    } catch {
      return [];
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-10 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
            🔒
          </div>
          <h2 className="text-2xl font-bold">{t("access.required")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-indigo-100">
            {t("access.body")}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          {plan && (
            <div className="mb-5 rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {plan.name} — {t("access.startingAt")}
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {(plan.priceCents / 100).toFixed(2)} {plan.currency.toUpperCase()}
                <span className="text-base font-normal text-slate-400">
                  {" "}
                  / {plan.interval === "year" ? t("billing.year") : t("billing.month")}
                </span>
              </p>
              {features().length > 0 && (
                <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-start text-sm text-slate-600 dark:text-slate-300">
                  {features().map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Link
            href="/billing"
            className="block w-full rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {t("access.cta")}
          </Link>

          <p className="mt-4 text-center text-xs text-slate-400">
            🛡️ {t("access.dataSafe")}
          </p>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-4 block w-full text-center text-xs font-medium text-slate-500 hover:underline dark:text-slate-400"
          >
            {t("common.signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}
