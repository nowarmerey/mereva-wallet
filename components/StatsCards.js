"use client";

import { formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

function Card({ title, value, currency, accent, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${accent}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
        {formatMoney(value, currency)}
      </p>
    </div>
  );
}

export default function StatsCards({ income, expense, balance, currency }) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card
        title={t("dash.income")}
        value={income}
        currency={currency}
        accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"
        icon="⬆️"
      />
      <Card
        title={t("dash.expense")}
        value={expense}
        currency={currency}
        accent="bg-rose-100 text-rose-600 dark:bg-rose-500/15"
        icon="⬇️"
      />
      <Card
        title={t("dash.balance")}
        value={balance}
        currency={currency}
        accent="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15"
        icon="💰"
      />
    </div>
  );
}
