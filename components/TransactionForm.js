"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

function toDateInput(value) {
  const d = value ? new Date(value) : new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Modal form to create / edit a transaction.
 * Props: open, initial, onClose(), onSaved(), defaultWalletId
 */
export default function TransactionForm({
  open,
  initial,
  onClose,
  onSaved,
  defaultWalletId = 0,
}) {
  const { t } = useI18n();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [categoryTouched, setCategoryTouched] = useState(false);
  const suggestTimer = useRef(null);

  // Load wallets once.
  useEffect(() => {
    fetch("/api/wallets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setWallets(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Initialise the form whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setError("");
    setSuggestion(null);
    setCategoryTouched(false);
    if (initial) {
      setForm({
        type: initial.type,
        category: initial.category,
        amount: String(initial.amount),
        note: initial.note || "",
        date: toDateInput(initial.createdAt),
        walletId: initial.walletId || defaultWalletId || "",
        receipt: initial.receipt || "",
      });
    } else {
      setForm({
        type: "expense",
        category: "",
        amount: "",
        note: "",
        date: toDateInput(),
        walletId: defaultWalletId || "",
        receipt: "",
      });
    }
  }, [open, initial, defaultWalletId]);

  // Load categories for the chosen type.
  useEffect(() => {
    if (!open || !form) return;
    fetch(`/api/categories?type=${form.type}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        setCategories(Array.isArray(list) ? list : []);
        // Default the category if none chosen yet.
        setForm((f) => {
          if (!f) return f;
          if (f.category && list.some((c) => c.name === f.category)) return f;
          return { ...f, category: list[0]?.name || "" };
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, form?.type]);

  // Smart categorization: suggest a category from past notes (debounced).
  useEffect(() => {
    if (!open || !form || categoryTouched) return;
    const note = form.note.trim();
    if (note.length < 2) {
      setSuggestion(null);
      return;
    }
    clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => {
      fetch(
        `/api/transactions/suggest?type=${form.type}&note=${encodeURIComponent(note)}`
      )
        .then((r) => (r.ok ? r.json() : {}))
        .then((d) => {
          if (d.category && d.category !== form.category) setSuggestion(d.category);
          else setSuggestion(null);
        })
        .catch(() => {});
    }, 400);
    return () => clearTimeout(suggestTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.note, form?.type, open, categoryTouched]);

  if (!open || !form) return null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      update("receipt", data.path);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const amount = Number(form.amount);
    if (!form.category) return setError(t("form.errCategory"));
    if (!amount || amount <= 0) return setError(t("form.errAmount"));

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        category: form.category,
        amount,
        note: form.note.trim() || null,
        receipt: form.receipt || null,
        walletId: form.walletId ? Number(form.walletId) : null,
        createdAt: new Date(form.date).toISOString(),
      };
      const url = initial
        ? `/api/transactions/${initial.id}`
        : "/api/transactions";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-900";
  const labelClass =
    "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {initial ? t("form.editTitle") : t("form.addTitle")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["expense", "income"].map((tp) => (
              <button
                type="button"
                key={tp}
                onClick={() => update("type", tp)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  form.type === tp
                    ? tp === "income"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                    : "border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {tp === "income" ? t("form.income") : t("form.expense")}
              </button>
            ))}
          </div>

          {wallets.length > 0 && (
            <div>
              <label className={labelClass}>{t("form.wallet")}</label>
              <select
                className={inputClass}
                value={form.walletId}
                onChange={(e) => update("walletId", e.target.value)}
              >
                <option value="">{t("common.none")}</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.icon} {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>{t("form.category")}</label>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => {
                setCategoryTouched(true);
                update("category", e.target.value);
              }}
            >
              {categories.length === 0 && <option value="">—</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            {suggestion && (
              <button
                type="button"
                onClick={() => {
                  update("category", suggestion);
                  setSuggestion(null);
                  setCategoryTouched(true);
                }}
                className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300"
              >
                💡 {t("form.suggested")}: {suggestion} — {t("form.applySuggestion")}
              </button>
            )}
          </div>

          <div>
            <label className={labelClass}>{t("form.amount")}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={inputClass}
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>{t("form.date")}</label>
            <input
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>{t("form.note")}</label>
            <input
              type="text"
              placeholder={t("form.notePlaceholder")}
              className={inputClass}
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>{t("form.receipt")}</label>
            {form.receipt ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.receipt}
                  alt="receipt"
                  className="h-16 w-16 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => update("receipt", "")}
                  className="text-xs font-medium text-rose-600 hover:underline"
                >
                  {t("form.remove")}
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-500/10 dark:file:text-indigo-300"
              />
            )}
            {uploading && (
              <p className="mt-1 text-xs text-slate-400">{t("form.uploading")}</p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? t("common.saving") : initial ? t("common.update") : t("common.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
