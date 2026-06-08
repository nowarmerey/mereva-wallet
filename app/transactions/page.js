"use client";

import { useEffect, useState, useCallback } from "react";
import TransactionsTable from "@/components/TransactionsTable";
import TransactionForm from "@/components/TransactionForm";
import { getCurrency } from "@/lib/format";
import { useActiveWallet } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";

const emptyFilters = { q: "", type: "", category: "", from: "", to: "", walletId: "" };

export default function TransactionsPage() {
  const { t } = useI18n();
  const activeWallet = useActiveWallet();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [currency, setCurrency] = useState("USD");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    setCurrency(getCurrency());
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch("/api/wallets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setWallets(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Follow the globally-active wallet by default.
  useEffect(() => {
    setFilters((f) => ({ ...f, walletId: activeWallet ? String(activeWallet) : "" }));
  }, [activeWallet]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      if (filters.type) params.set("type", filters.type);
      if (filters.category) params.set("category", filters.category);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.walletId) params.set("walletId", filters.walletId);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load transactions");
      setTransactions(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce so typing in the search box doesn't spam the API.
  useEffect(() => {
    const id = setTimeout(loadData, 250);
    return () => clearTimeout(id);
  }, [loadData]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(t) {
    setEditing(t);
    setFormOpen(true);
  }

  async function handleDelete(tx) {
    if (!confirm(t("tx.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTransactions((list) => list.filter((x) => x.id !== tx.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {t("tx.title")}
        </h2>
        <button
          onClick={openAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          + {t("tx.addTransaction")}
        </button>
      </div>

      {/* Global search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          placeholder={t("common.search")}
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          className={inputClass + " w-full pl-9"}
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <select
            className={inputClass}
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="">{t("tx.allTypes")}</option>
            <option value="income">{t("tx.income")}</option>
            <option value="expense">{t("tx.expense")}</option>
          </select>

          <select
            className={inputClass}
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">{t("tx.allCategories")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <select
            className={inputClass}
            value={filters.walletId}
            onChange={(e) => setFilters((f) => ({ ...f, walletId: e.target.value }))}
          >
            <option value="">{t("tx.allWallets")}</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.icon} {w.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className={inputClass}
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          />
          <input
            type="date"
            className={inputClass}
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />

          <button
            onClick={() => setFilters({ ...emptyFilters })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("common.reset")}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">{t("tx.loading")}</p>
      ) : (
        <TransactionsTable
          transactions={transactions}
          currency={currency}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <TransactionForm
        open={formOpen}
        initial={editing}
        defaultWalletId={activeWallet}
        onClose={() => setFormOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
