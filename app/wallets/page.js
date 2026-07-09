"use client";

import { useEffect, useState } from "react";
import { WALLET_ICONS } from "@/lib/constants";
import { formatMoney, getCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

export default function WalletsPage() {
  const { t } = useI18n();
  const [wallets, setWallets] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", icon: "👛", color: "#6366f1" });
  const [transfer, setTransfer] = useState({ fromId: "", toId: "", amount: "", note: "" });
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/wallets");
      setWallets(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
    window.dispatchEvent(new Event("walletschanged"));
  }
  useEffect(() => {
    setCurrency(getCurrency());
    load();
  }, []);

  async function addWallet(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Wallet name is required.");
    const res = await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed to add wallet");
    }
    setForm({ name: "", icon: "👛", color: "#6366f1" });
    load();
  }

  async function removeWallet(w) {
    if (!confirm(t("wallets.deleteConfirm"))) return;
    const res = await fetch(`/api/wallets/${w.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Failed to delete");
    }
    load();
  }

  async function doTransfer(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    const res = await fetch("/api/wallets/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transfer),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Transfer failed");
    }
    setMsg(t("wallets.transferDone"));
    setTransfer({ fromId: "", toId: "", amount: "", note: "" });
    load();
    setTimeout(() => setMsg(""), 2500);
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 glass-input dark:text-slate-100 dark:focus:ring-indigo-900";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {t("wallets.title")}
      </h2>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {/* Wallet cards */}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card"
              style={{ borderTop: `4px solid ${w.color}` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{w.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {w.name}
                    </p>
                    {w.isDefault && (
                      <span className="text-xs text-indigo-500">{t("wallets.default")}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeWallet(w)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  {t("common.delete")}
                </button>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
                {formatMoney(w.balance, currency)}
              </p>
              <div className="mt-2 flex gap-4 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400">
                  ▲ {formatMoney(w.income, currency)}
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  ▼ {formatMoney(w.expense, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Add wallet */}
        <form
          onSubmit={addWallet}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card"
        >
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("wallets.addWallet")}
          </h3>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>{t("wallets.name")}</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Travel"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t("wallets.icon")}</label>
                <select
                  className={inputClass}
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                >
                  {WALLET_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("wallets.color")}</label>
                <input
                  type="color"
                  className="h-[38px] w-full rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t("wallets.addWallet")}
            </button>
          </div>
        </form>

        {/* Transfer */}
        <form
          onSubmit={doTransfer}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card"
        >
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("wallets.transferTitle")}
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t("wallets.from")}</label>
                <select
                  className={inputClass}
                  value={transfer.fromId}
                  onChange={(e) => setTransfer({ ...transfer, fromId: e.target.value })}
                >
                  <option value="">{t("wallets.select")}</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.icon} {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("wallets.to")}</label>
                <select
                  className={inputClass}
                  value={transfer.toId}
                  onChange={(e) => setTransfer({ ...transfer, toId: e.target.value })}
                >
                  <option value="">{t("wallets.select")}</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.icon} {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>{t("wallets.amount")}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={transfer.amount}
                onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelClass}>{t("wallets.note")}</label>
              <input
                className={inputClass}
                value={transfer.note}
                onChange={(e) => setTransfer({ ...transfer, note: e.target.value })}
                placeholder="e.g. Move savings"
              />
            </div>
            {msg && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                {msg}
              </p>
            )}
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t("wallets.transfer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
