"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatsCards from "@/components/StatsCards";
import BudgetProgress from "@/components/BudgetProgress";
import { CategoryPie, BalanceLine } from "@/components/Charts";
import { formatMoney, formatDate, getCurrency } from "@/lib/format";
import { useActiveWallet } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";
import Onboarding from "@/components/Onboarding";

export default function DashboardPage() {
  const { t } = useI18n();
  const activeWallet = useActiveWallet();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeWallet) params.set("walletId", String(activeWallet));
      const [tx, cats] = await Promise.all([
        fetch(`/api/transactions?${params.toString()}`).then((r) =>
          r.ok ? r.json() : Promise.reject(new Error("Failed to load data"))
        ),
        fetch("/api/categories").then((r) => (r.ok ? r.json() : [])),
      ]);
      setTransactions(tx);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const byCategory = {};
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else {
        expense += t.amount;
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      }
    }
    return { income, expense, balance: income - expense, byCategory };
  }, [transactions]);

  const budgets = useMemo(() => {
    const now = new Date();
    const spent = {};
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const d = new Date(t.createdAt);
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
        spent[t.category] = (spent[t.category] || 0) + t.amount;
      }
    }
    return categories
      .filter((c) => c.monthlyLimit && c.monthlyLimit > 0)
      .map((c) => ({
        name: c.name,
        icon: c.icon,
        limit: c.monthlyLimit,
        spent: spent[c.name] || 0,
      }))
      .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
  }, [transactions, categories]);

  const balanceSeries = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    let running = 0;
    const labels = [];
    const values = [];
    for (const t of sorted) {
      running += t.type === "income" ? t.amount : -t.amount;
      labels.push(formatDate(t.createdAt));
      values.push(Number(running.toFixed(2)));
    }
    return { labels, values };
  }, [transactions]);

  const recent = transactions.slice(0, 5);

  if (loading) return <p className="text-slate-500">{t("common.loading")}</p>;

  return (
    <div className="space-y-6">
      <Onboarding />
      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      <StatsCards
        income={stats.income}
        expense={stats.expense}
        balance={stats.balance}
        currency={currency}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.byCategory")}
          </h2>
          <CategoryPie data={stats.byCategory} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.overTime")}
          </h2>
          <BalanceLine labels={balanceSeries.labels} values={balanceSeries.values} />
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.budgets")}
          </h2>
          <Link
            href="/categories"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {t("dash.manage")} →
          </Link>
        </div>
        <BudgetProgress items={budgets} currency={currency} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.recent")}
          </h2>
          <Link
            href="/transactions"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {t("dash.viewAll")} →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            {t("dash.noRecent")}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((t2) => (
              <li key={t2.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t2.category}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(t2.createdAt)} {t2.note ? `• ${t2.note}` : ""}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t2.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {t2.type === "income" ? "+" : "-"}
                  {formatMoney(t2.amount, currency)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
