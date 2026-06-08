"use client";

import { formatMoney, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

export default function TransactionsTable({
  transactions,
  currency,
  onEdit,
  onDelete,
}) {
  const { t: tr } = useI18n();
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
        {tr("tx.none")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">{tr("tx.date")}</th>
              <th className="px-4 py-3 font-medium">{tr("tx.type")}</th>
              <th className="px-4 py-3 font-medium">{tr("tx.category")}</th>
              <th className="px-4 py-3 font-medium">{tr("tx.wallet")}</th>
              <th className="px-4 py-3 font-medium">{tr("tx.note")}</th>
              <th className="px-4 py-3 font-medium">{tr("tx.receipt")}</th>
              <th className="px-4 py-3 text-right font-medium">{tr("tx.amount")}</th>
              <th className="px-4 py-3 text-right font-medium">{tr("tx.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                  {formatDate(t.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      t.type === "income"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                    }`}
                  >
                    {t.isTransfer
                      ? tr("tx.transfer")
                      : t.type === "income"
                      ? tr("tx.income")
                      : tr("tx.expense")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {t.category}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {t.wallet ? `${t.wallet.icon} ${t.wallet.name}` : "—"}
                </td>
                <td className="max-w-[180px] truncate px-4 py-3 text-slate-500 dark:text-slate-400">
                  {t.note || "—"}
                </td>
                <td className="px-4 py-3">
                  {t.receipt ? (
                    <a href={t.receipt} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.receipt}
                        alt="receipt"
                        className="h-9 w-9 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                      />
                    </a>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600">—</span>
                  )}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                    t.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatMoney(t.amount, currency)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    onClick={() => onEdit(t)}
                    className="mr-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                  >
                    {tr("common.edit")}
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    {tr("common.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
