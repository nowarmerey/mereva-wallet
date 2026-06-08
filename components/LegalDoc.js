"use client";

import { useI18n } from "@/lib/i18n";

// Consistent wrapper for legal/privacy documents.
export default function LegalDoc({ title, date = "June 2026", children }) {
  const { t } = useI18n();
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        {t("legal.lastUpdated")}: {date}
      </p>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
        ⚠ {t("legal.disclaimer")}
      </div>

      <div className="mt-6 space-y-4 leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </article>
  );
}

export function H2({ children }) {
  return (
    <h2 className="mt-8 text-xl font-semibold text-slate-900 dark:text-white">
      {children}
    </h2>
  );
}

export function P({ children }) {
  return <p>{children}</p>;
}

export function UL({ items }) {
  return (
    <ul className="list-disc space-y-1 ps-6">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
