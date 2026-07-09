"use client";

import { useEffect, useState } from "react";
import { CURRENCIES } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

// First-run welcome shown once per browser (localStorage flag).
export default function Onboarding() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    if (!localStorage.getItem("mereva_onboarded")) {
      setCurrency(localStorage.getItem("currency") || "USD");
      setOpen(true);
    }
  }, []);

  function finish() {
    localStorage.setItem("currency", currency);
    localStorage.setItem("mereva_onboarded", "1");
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency }),
    }).catch(() => {});
    setOpen(false);
  }

  function skip() {
    localStorage.setItem("mereva_onboarded", "1");
    setOpen(false);
  }

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 glass-modal">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-6 py-7 text-center text-white">
          <div className="text-4xl">👛</div>
          <h2 className="mt-2 text-xl font-bold">{t("onb.welcome")}</h2>
        </div>

        <div className="p-6">
          {step === 0 && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {t("onb.welcomeBody")}
            </p>
          )}

          {step === 1 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                {t("onb.currencyQ")}
              </label>
              <select
                className={inputClass}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("onb.tipsTitle")}
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>{t("onb.tip1")}</li>
                <li>{t("onb.tip2")}</li>
                <li>{t("onb.tip3")}</li>
              </ul>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={skip}
              className="text-sm font-medium text-slate-400 hover:text-slate-600"
            >
              {t("onb.skip")}
            </button>
            <button
              onClick={() => (step < 2 ? setStep(step + 1) : finish())}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {step < 2 ? t("onb.next") : t("onb.start")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
