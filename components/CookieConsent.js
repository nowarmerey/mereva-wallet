"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// Lightweight cookie/consent banner (TDDDG §25). Essential cookies always run;
// the choice is stored so optional integrations can check it.
export default function CookieConsent() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookieConsent")) setShow(true);
  }, []);

  function choose(value) {
    localStorage.setItem("cookieConsent", value); // "all" | "essential"
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center">
        <p className="flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          🍪 {t("cookie.text")}{" "}
          <Link href="/legal/privacy" className="font-medium text-indigo-600 underline dark:text-indigo-400">
            {t("cookie.more")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("essential")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {t("cookie.essential")}
          </button>
          <button
            onClick={() => choose("all")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
