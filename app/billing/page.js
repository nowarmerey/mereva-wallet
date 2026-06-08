"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

function planFeatures(plan) {
  if (!plan.features) return [];
  try {
    const parsed = JSON.parse(plan.features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(plan.features).split("\n").filter(Boolean);
  }
}

export default function BillingPage() {
  const { t } = useI18n();
  const [plans, setPlans] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [p, m] = await Promise.all([
      fetch("/api/plans").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
    ]);
    setPlans(Array.isArray(p) ? p : []);
    setMe(m);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function subscribe(planId) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function manage() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open portal");
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <p className="text-slate-500">{t("common.loading")}</p>;

  const membership = me?.membership;
  const status = membership?.status || "none";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {t("billing.title")}
      </h2>

      {/* Current status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("billing.current")}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-lg font-semibold capitalize text-slate-800 dark:text-slate-100">
            {membership?.plan?.name || (status === "trialing" ? t("billing.trial") : status)}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              ["active", "trialing"].includes(status)
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {status}
          </span>
        </div>
        {membership?.currentPeriodEnd && (
          <p className="mt-1 text-xs text-slate-400">
            {t("billing.renews")}: {new Date(membership.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        {membership?.stripeCustomerId && (
          <button
            onClick={manage}
            disabled={busy}
            className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("billing.manage")}
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {/* Plans */}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {t("billing.choosePlan")}
      </h3>
      {plans.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          {t("billing.noPlans")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${
                plan.isFeatured
                  ? "border-indigo-500 ring-2 ring-indigo-500/30"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {plan.isFeatured && (
                <span className="mb-2 w-fit rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-medium text-white">
                  {t("billing.popular")}
                </span>
              )}
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {plan.name}
              </h4>
              {plan.description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {plan.description}
                </p>
              )}
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {plan.priceCents === 0
                    ? t("billing.free")
                    : `${(plan.priceCents / 100).toFixed(2)} ${plan.currency.toUpperCase()}`}
                </span>
                {plan.priceCents > 0 && (
                  <span className="text-sm text-slate-400">
                    {" "}
                    / {plan.interval === "year" ? t("billing.year") : t("billing.month")}
                  </span>
                )}
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {planFeatures(plan).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(plan.id)}
                disabled={busy}
                className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {plan.trialDays > 0
                  ? t("billing.startTrial", { n: plan.trialDays })
                  : t("billing.subscribe")}
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">{t("billing.note")}</p>
    </div>
  );
}
