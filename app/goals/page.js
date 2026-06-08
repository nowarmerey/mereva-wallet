"use client";

import { useEffect, useState } from "react";
import { formatMoney, formatDate, getCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

export default function GoalsPage() {
  const { t } = useI18n();
  const [goals, setGoals] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", target: "", saved: "", deadline: "", icon: "🎯" });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      setGoals(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    setCurrency(getCurrency());
    load();
  }, []);

  async function addGoal(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed to add goal");
    }
    setForm({ name: "", target: "", saved: "", deadline: "", icon: "🎯" });
    load();
  }

  async function contribute(goal) {
    const input = prompt(t("goals.addPrompt", { name: goal.name }), "0");
    if (input === null) return;
    const addAmount = Number(input);
    if (!addAmount) return;
    await fetch(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addAmount }),
    });
    load();
  }

  async function remove(goal) {
    if (!confirm(t("goals.deleteConfirm"))) return;
    await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {t("goals.title")}
      </h2>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 sm:col-span-2">
              {t("goals.none")}
            </p>
          )}
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
            const done = g.saved >= g.target;
            return (
              <div
                key={g.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {g.icon} {g.name}
                    {done && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓ {t("goals.reached")}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => remove(g)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    {t("common.delete")}
                  </button>
                </div>

                <div className="mt-3 mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {formatMoney(g.saved, currency)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {t("goals.of")} {formatMoney(g.target, currency)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {g.deadline ? `${t("goals.by")} ${formatDate(g.deadline)}` : t("goals.noDeadline")} ·{" "}
                    {pct.toFixed(0)}%
                  </span>
                  <button
                    onClick={() => contribute(g)}
                    className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    {t("goals.addMoney")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add goal */}
      <form
        onSubmit={addGoal}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("goals.create")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className={labelClass}>{t("goals.name")}</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. New laptop"
            />
          </div>
          <div>
            <label className={labelClass}>{t("goals.target")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>{t("goals.alreadySaved")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.saved}
              onChange={(e) => setForm({ ...form, saved: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>{t("goals.deadline")}</label>
            <input
              type="date"
              className={inputClass}
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t("goals.create")}
        </button>
      </form>
    </div>
  );
}
