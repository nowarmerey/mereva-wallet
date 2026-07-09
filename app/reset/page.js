"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import AuthShell from "@/components/AuthShell";

export default function ResetPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Failed");
    setDone(true);
    setTimeout(() => router.replace("/login"), 1800);
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 glass-input dark:text-slate-100";

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {t("auth.resetTitle")}
      </h1>

      {done ? (
        <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {t("auth.resetDone")}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              placeholder={t("auth.password")}
              className={inputClass + " pe-16"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {showPw ? t("auth.hide") : t("auth.show")}
            </button>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "…" : t("auth.resetTitle")}
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
