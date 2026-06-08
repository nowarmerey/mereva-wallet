"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import AuthShell from "@/components/AuthShell";

export default function ForgotPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setLoading(false);
    setSent(true);
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {t("auth.forgotTitle")}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t("auth.forgotDesc")}
      </p>

      {sent ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {t("auth.forgotSent")}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder={t("auth.email")}
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "…" : t("auth.sendLink")}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          {t("auth.backToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
