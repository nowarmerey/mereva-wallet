"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import AuthShell from "@/components/AuthShell";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (!code) return;
    if (code === "OAuthAccountNotLinked") setError(t("auth.errNotLinked"));
    else if (code === "CredentialsSignin") setError(t("auth.invalid"));
    else setError(t("auth.errGeneric"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError(t("auth.invalid"));
    else router.replace("/dashboard");
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {t("auth.loginTitle")}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t("auth.noAccount")}{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          {t("auth.register")}
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            {t("auth.email")}
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("auth.password")}
            </label>
            <Link
              href="/forgot"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {t("auth.forgot")}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              placeholder="••••••"
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
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "…" : t("auth.login")}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        {t("auth.or")}
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <GoogleButton onError={setError} />
    </AuthShell>
  );
}
