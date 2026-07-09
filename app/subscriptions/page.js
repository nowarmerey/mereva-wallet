"use client";

import { useEffect, useState } from "react";
import { FREQUENCIES } from "@/lib/constants";
import { formatMoney, formatDate, getCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

function daysUntil(date) {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / (1000 * 60 * 60 * 24));
}

// Rough monthly cost so the user sees their recurring burn rate.
function monthlyCost(sub) {
  if (sub.frequency === "weekly") return sub.amount * 4.33;
  if (sub.frequency === "yearly") return sub.amount / 12;
  return sub.amount;
}

export default function SubscriptionsPage() {
  const { t } = useI18n();
  const [subs, setSubs] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    frequency: "monthly",
    category: "Subscriptions",
    nextDate: new Date().toISOString().slice(0, 10),
    walletId: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions");
      setSubs(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    setCurrency(getCurrency());
    fetch("/api/wallets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setWallets(Array.isArray(d) ? d : []))
      .catch(() => {});
    load();
  }, []);

  async function addSub(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed to add subscription");
    }
    setForm({
      name: "",
      amount: "",
      frequency: "monthly",
      category: "Subscriptions",
      nextDate: new Date().toISOString().slice(0, 10),
      walletId: "",
    });
    load();
  }

  async function charge(sub) {
    await fetch(`/api/subscriptions/${sub.id}/charge`, { method: "POST" });
    load();
  }
  async function remove(sub) {
    if (!confirm(t("subs.deleteConfirm"))) return;
    await fetch(`/api/subscriptions/${sub.id}`, { method: "DELETE" });
    load();
  }

  const totalMonthly = subs.reduce((s, x) => s + monthlyCost(x), 0);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 glass-input dark:text-slate-100 dark:focus:ring-indigo-900";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {t("subs.title")}
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card">
          <span className="text-slate-500 dark:text-slate-400">{t("subs.estMonthly")}: </span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {formatMoney(totalMonthly, currency)}
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-2">
          {subs.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 glass-card">
              {t("subs.none")}
            </p>
          )}
          {subs.map((s) => {
            const days = daysUntil(s.nextDate);
            const soon = days >= 0 && days <= 3;
            const overdue = days < 0;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    🔁 {s.name}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {t(`subs.${s.frequency}`)}
                    </span>
                    {soon && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        ⏰ {t("subs.inDays", { n: days })}
                      </span>
                    )}
                    {overdue && (
                      <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        ⚠ {t("subs.overdue")}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("subs.next")}: {formatDate(s.nextDate)} · {s.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatMoney(s.amount, currency)}
                  </span>
                  <button
                    onClick={() => charge(s)}
                    className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                    title="Log a payment and move to the next date"
                  >
                    {t("subs.markPaid")}
                  </button>
                  <button
                    onClick={() => remove(s)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add subscription */}
      <form
        onSubmit={addSub}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card"
      >
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("subs.add")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("subs.name")}</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Netflix"
            />
          </div>
          <div>
            <label className={labelClass}>{t("subs.amount")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>{t("subs.frequency")}</label>
            <select
              className={inputClass}
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {t(`subs.${f.value}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("subs.nextDate")}</label>
            <input
              type="date"
              className={inputClass}
              value={form.nextDate}
              onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t("subs.add")}
        </button>
      </form>
    </div>
  );
}
