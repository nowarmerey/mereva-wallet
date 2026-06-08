"use client";

import { useI18n, LOCALES } from "@/lib/i18n";

// Quick language switcher in the navbar (also available in Settings).
export default function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  function change(code) {
    setLocale(code);
    // Persist to the account too (best-effort).
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: code }),
    }).catch(() => {});
  }

  return (
    <select
      value={locale}
      onChange={(e) => change(e.target.value)}
      title="Language"
      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
