"use client";

import { formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

// Shows a progress bar per category that has a monthly limit.
// items: [{ name, icon, limit, spent }]
export default function BudgetProgress({ items, currency }) {
  const { t } = useI18n();
  if (!items || items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        {t("dash.noBudgets")}
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((it) => {
        const pct = it.limit > 0 ? (it.spent / it.limit) * 100 : 0;
        const over = it.spent > it.limit;
        const near = !over && pct >= 80;
        const barColor = over
          ? "bg-rose-500"
          : near
          ? "bg-amber-500"
          : "bg-emerald-500";

        return (
          <li key={it.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {it.icon} {it.name}
                {over && (
                  <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                    {t("budget.over")}
                  </span>
                )}
                {near && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                    {t("budget.near")}
                  </span>
                )}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {formatMoney(it.spent, currency)} / {formatMoney(it.limit, currency)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
