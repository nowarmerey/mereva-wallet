"use client";

import { useEffect, useState } from "react";
import { formatMoney, getCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

function periodOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function BillsPage() {
  const { t } = useI18n();
  const now = new Date();
  const [period, setPeriod] = useState(periodOf(now));
  const [bills, setBills] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "Bills",
    dueDay: "1",
    walletId: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bills?period=${period}`);
      setBills(res.ok ? await res.json() : []);
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
  }, []);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  async function addBill(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    const res = await fetch("/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed to add bill");
    }
    setForm({ name: "", amount: "", category: "Bills", dueDay: "1", walletId: "" });
    load();
  }

  async function togglePaid(bill) {
    await fetch(`/api/bills/${bill.id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period, paid: !bill.paid }),
    });
    load();
  }

  async function removeBill(bill) {
    if (!confirm(t("bills.deleteConfirm"))) return;
    await fetch(`/api/bills/${bill.id}`, { method: "DELETE" });
    load();
  }

  const totalDue = bills.reduce((s, b) => s + (b.paid ? 0 : b.amount), 0);
  const totalPaid = bills.reduce((s, b) => s + (b.paid ? b.amount : 0), 0);
  const todayDay = now.getDate();
  const isCurrentMonth = period === periodOf(now);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {t("bills.title")}
        </h2>
        <input
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={inputClass + " w-auto"}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("bills.unpaid")}</p>
          <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(totalDue, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("bills.paid")}</p>
          <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalPaid, currency)}
          </p>
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
          {bills.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              {t("bills.none")}
            </p>
          )}
          {bills.map((b) => {
            const dueSoon =
              isCurrentMonth && !b.paid && b.dueDay - todayDay >= 0 && b.dueDay - todayDay <= 3;
            const overdue = isCurrentMonth && !b.paid && b.dueDay < todayDay;
            return (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={b.paid}
                    onChange={() => togglePaid(b)}
                    className="h-5 w-5 rounded accent-indigo-600"
                  />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {b.name}
                      {b.paid && (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          {t("bills.paidBadge")}
                        </span>
                      )}
                      {overdue && (
                        <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                          ⚠ {t("bills.overdue")}
                        </span>
                      )}
                      {dueSoon && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          ⏰ {t("bills.dueSoon")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t("bills.dueDayShort")} {b.dueDay} · {b.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatMoney(b.amount, currency)}
                  </span>
                  <button
                    onClick={() => removeBill(b)}
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

      {/* Add bill */}
      <form
        onSubmit={addBill}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("bills.addBill")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("bills.name")}</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Internet"
            />
          </div>
          <div>
            <label className={labelClass}>{t("bills.amount")}</label>
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
            <label className={labelClass}>{t("bills.dueDay")}</label>
            <input
              type="number"
              min="1"
              max="31"
              className={inputClass}
              value={form.dueDay}
              onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>{t("bills.wallet")}</label>
            <select
              className={inputClass}
              value={form.walletId}
              onChange={(e) => setForm({ ...form, walletId: e.target.value })}
            >
              <option value="">{t("common.none")}</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t("bills.addBill")}
        </button>
      </form>
    </div>
  );
}
