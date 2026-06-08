"use client";

import { useEffect, useMemo, useState } from "react";
import StatsCards from "@/components/StatsCards";
import { IncomeExpenseBar, CategoryPie } from "@/components/Charts";
import { getCurrency } from "@/lib/format";
import { useActiveWallet } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ReportsPage() {
  const { t } = useI18n();
  const now = new Date();
  const activeWallet = useActiveWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based

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
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load data");
      setTransactions(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Years available in the data (plus the current year).
  const years = useMemo(() => {
    const set = new Set([now.getFullYear()]);
    for (const t of transactions) set.add(new Date(t.createdAt).getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [transactions]);

  // Stats for the selected month.
  const monthStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const byCategory = {};
    for (const t of transactions) {
      const d = new Date(t.createdAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (t.type === "income") income += t.amount;
        else {
          expense += t.amount;
          byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        }
      }
    }
    return { income, expense, balance: income - expense, byCategory };
  }, [transactions, year, month]);

  // Income vs expense across all 12 months of the selected year.
  const yearSeries = useMemo(() => {
    const income = Array(12).fill(0);
    const expense = Array(12).fill(0);
    for (const t of transactions) {
      const d = new Date(t.createdAt);
      if (d.getFullYear() === year) {
        if (t.type === "income") income[d.getMonth()] += t.amount;
        else expense[d.getMonth()] += t.amount;
      }
    }
    return {
      labels: MONTHS.map((m) => m.slice(0, 3)),
      income,
      expense,
    };
  }, [transactions, year]);

  const selectClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {t("rep.title")}
        </h2>
        <div className="ml-auto flex gap-2">
          <select
            className={selectClass}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <a
            href={`/api/export/transactions?from=${year}-${String(month + 1).padStart(2, "0")}-01&to=${year}-${String(month + 1).padStart(2, "0")}-31${activeWallet ? `&walletId=${activeWallet}` : ""}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("rep.exportCsv")}
          </a>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 print:hidden"
          >
            {t("rep.print")}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">{t("rep.loading")}</p>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("rep.showing")}{" "}
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {MONTHS[month]} {year}
            </span>
          </p>

          <StatsCards
            income={monthStats.income}
            expense={monthStats.expense}
            balance={monthStats.balance}
            currency={currency}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
                {t("rep.incomeVsExpense")} — {year}
              </h3>
              <IncomeExpenseBar
                labels={yearSeries.labels}
                income={yearSeries.income}
                expense={yearSeries.expense}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
                {MONTHS[month]} — {t("rep.byCategory")}
              </h3>
              <CategoryPie data={monthStats.byCategory} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
