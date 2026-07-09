"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney, formatDate, getCurrency } from "@/lib/format";
import { useActiveWallet } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";
import { IncomeExpenseBar } from "@/components/Charts";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function Stat({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent || "text-slate-800 dark:text-slate-100"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useI18n();
  const activeWallet = useActiveWallet();
  const [transactions, setTransactions] = useState([]);
  const [subs, setSubs] = useState([]);
  const [bills, setBills] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrency(getCurrency());
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeWallet) params.set("walletId", String(activeWallet));
    Promise.all([
      fetch(`/api/transactions?${params.toString()}`).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/subscriptions").then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/bills`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([t, s, b]) => {
        setTransactions(Array.isArray(t) ? t : []);
        setSubs(Array.isArray(s) ? s : []);
        setBills(Array.isArray(b) ? b : []);
      })
      .finally(() => setLoading(false));
  }, [activeWallet]);

  const analytics = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const incomes = transactions.filter((t) => t.type === "income");

    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);

    // Highest spending day
    const byDay = {};
    for (const t of expenses) {
      const key = new Date(t.createdAt).toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + t.amount;
    }
    let topDay = null;
    let topDayAmt = 0;
    for (const [k, v] of Object.entries(byDay)) {
      if (v > topDayAmt) {
        topDay = k;
        topDayAmt = v;
      }
    }

    // Average daily spend (across the span of days that have expenses)
    const days = Object.keys(byDay).length || 1;
    const avgDaily = totalExpense / days;

    // Per-month net (income - expense) -> best saving month
    const byMonth = {}; // "YYYY-MM" -> {income, expense}
    for (const t of transactions) {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 };
      if (t.type === "income") byMonth[key].income += t.amount;
      else byMonth[key].expense += t.amount;
    }
    let bestMonth = null;
    let bestNet = -Infinity;
    for (const [k, v] of Object.entries(byMonth)) {
      const net = v.income - v.expense;
      if (net > bestNet) {
        bestNet = net;
        bestMonth = k;
      }
    }

    const ratio = totalExpense > 0 ? totalIncome / totalExpense : 0;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // Chart: last 6 months income vs expense
    const monthKeys = Object.keys(byMonth).sort();
    const recent = monthKeys.slice(-6);
    const chart = {
      labels: recent.map((k) => {
        const [y, m] = k.split("-");
        return `${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
      }),
      income: recent.map((k) => byMonth[k].income),
      expense: recent.map((k) => byMonth[k].expense),
    };

    return {
      totalExpense,
      totalIncome,
      topDay,
      topDayAmt,
      avgDaily,
      bestMonth,
      bestNet,
      ratio,
      savingsRate,
      chart,
    };
  }, [transactions]);

  // Cash-flow forecast for the current month.
  const forecast = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const remainingDays = daysInMonth - today;

    // Current balance (respecting active wallet via fetched transactions).
    let balance = 0;
    for (const t of transactions) {
      balance += t.type === "income" ? t.amount : -t.amount;
    }

    // This-month expense so far -> average daily expense for the month.
    const monthExpenses = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === year && d.getMonth() === month && t.type === "expense";
    });
    const spentThisMonth = monthExpenses.reduce((s, t) => s + t.amount, 0);
    const avgDailyThisMonth = today > 0 ? spentThisMonth / today : 0;
    const projectedDiscretionary = avgDailyThisMonth * remainingDays;

    // Upcoming subscriptions due before month end.
    const upcomingSubs = subs
      .filter((s) => {
        const d = new Date(s.nextDate);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() >= today;
      })
      .reduce((sum, s) => sum + s.amount, 0);

    // Unpaid bills due later this month.
    const unpaidBills = bills
      .filter((b) => !b.paid && b.dueDay >= today)
      .reduce((sum, b) => sum + b.amount, 0);

    const projectedOutflow = projectedDiscretionary + upcomingSubs + unpaidBills;
    const projectedEnd = balance - projectedOutflow;

    return {
      balance,
      remainingDays,
      avgDailyThisMonth,
      projectedDiscretionary,
      upcomingSubs,
      unpaidBills,
      projectedOutflow,
      projectedEnd,
    };
  }, [transactions, subs, bills]);

  if (loading) return <p className="text-slate-500">{t("common.loading")}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {t("an.title")}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t("an.highestDay")}
          value={analytics.topDay ? formatMoney(analytics.topDayAmt, currency) : "—"}
          sub={analytics.topDay ? formatDate(analytics.topDay) : t("an.noData")}
          accent="text-rose-600 dark:text-rose-400"
        />
        <Stat
          label={t("an.avgDaily")}
          value={formatMoney(analytics.avgDaily, currency)}
          sub={t("an.onDays")}
        />
        <Stat
          label={t("an.bestMonth")}
          value={
            analytics.bestMonth
              ? `${MONTHS[Number(analytics.bestMonth.split("-")[1]) - 1]} ${
                  analytics.bestMonth.split("-")[0]
                }`
              : "—"
          }
          sub={
            analytics.bestMonth
              ? `${t("an.net")} ${formatMoney(analytics.bestNet, currency)}`
              : t("an.noData")
          }
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          label={t("an.ratio")}
          value={analytics.ratio ? `${analytics.ratio.toFixed(2)}×` : "—"}
          sub={t("an.savingsRate", { n: analytics.savingsRate.toFixed(0) })}
          accent={
            analytics.ratio >= 1
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }
        />
      </div>

      {/* Cash-flow forecast */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card">
        <h3 className="mb-1 text-base font-semibold text-slate-800 dark:text-slate-100">
          {t("an.forecast")}
        </h3>
        <p className="mb-4 text-xs text-slate-400">
          {t("an.forecastDesc", { n: forecast.remainingDays })}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-sm">
            <Row label={t("an.currentBalance")} value={formatMoney(forecast.balance, currency)} />
            <Row
              label={t("an.projDaily")}
              value={`- ${formatMoney(forecast.projectedDiscretionary, currency)}`}
              neg
            />
            <Row
              label={t("an.upcomingSubs")}
              value={`- ${formatMoney(forecast.upcomingSubs, currency)}`}
              neg
            />
            <Row
              label={t("an.unpaidBills")}
              value={`- ${formatMoney(forecast.unpaidBills, currency)}`}
              neg
            />
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-5 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("an.projBalance")}
            </p>
            <p
              className={`mt-1 text-3xl font-bold ${
                forecast.projectedEnd >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatMoney(forecast.projectedEnd, currency)}
            </p>
            {forecast.projectedEnd < 0 && (
              <p className="mt-2 text-center text-xs text-rose-500">
                {t("an.mayRunShort")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Trend chart */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card">
        <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
          {t("an.trend")}
        </h3>
        <IncomeExpenseBar
          labels={analytics.chart.labels}
          income={analytics.chart.income}
          expense={analytics.chart.expense}
        />
      </section>
    </div>
  );
}

function Row({ label, value, neg }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span
        className={`font-medium ${
          neg ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
