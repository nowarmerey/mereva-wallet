"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function FeedbackModal({ open, onClose }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!message.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setMessage("");
        setRating(5);
        onClose?.();
      }, 1800);
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {t("fb.title")}
        </h2>

        {done ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            {t("fb.thanks")}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("fb.rating")}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-2xl ${n <= rating ? "opacity-100" : "opacity-30"}`}
                    aria-label={`${n} stars`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("fb.message")}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("fb.placeholder")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {busy ? "…" : t("fb.submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
