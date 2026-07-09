"use client";

import { useEffect, useState } from "react";
import { CATEGORY_ICONS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

const emptyForm = { name: "", type: "expense", icon: "🏷️", monthlyLimit: "" };

export default function CategoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      setCategories(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function startEdit(c) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      type: c.type,
      icon: c.icon,
      monthlyLimit: c.monthlyLimit ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Name is required.");
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        icon: form.icon,
        monthlyLimit: form.monthlyLimit === "" ? null : Number(form.monthlyLimit),
      };
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save");
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(c) {
    if (!confirm(t("cat.deleteConfirm", { name: c.name }))) return;
    await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    load();
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 glass-input dark:text-slate-100 dark:focus:ring-indigo-900";
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {t("cat.title")}
      </h2>

      {/* Add / edit form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card"
      >
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {editingId ? t("cat.edit") : t("cat.addNew")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <label className={labelClass}>{t("cat.name")}</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("cat.namePlaceholder")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("cat.type")}</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="expense">{t("cat.expense")}</option>
              <option value="income">{t("cat.income")}</option>
              <option value="both">{t("cat.both")}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("cat.icon")}</label>
            <select
              className={inputClass}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            >
              {CATEGORY_ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("cat.monthlyLimit")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.monthlyLimit}
              onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
              placeholder={t("cat.noLimit")}
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {editingId ? t("cat.updateBtn") : t("cat.addBtn")}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("common.cancel")}
            </button>
          )}
        </div>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">{t("cat.colName")}</th>
                <th className="px-4 py-3 font-medium">{t("cat.colType")}</th>
                <th className="px-4 py-3 font-medium">{t("cat.colLimit")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("cat.colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                    {c.icon} {c.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {c.type === "income"
                      ? t("cat.income")
                      : c.type === "both"
                      ? t("cat.both")
                      : t("cat.expense")}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {c.monthlyLimit ? formatMoney(c.monthlyLimit) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(c)}
                      className="mr-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    {t("cat.none")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
