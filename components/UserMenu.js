"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  trialing: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  past_due: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export default function UserMenu() {
  const { t } = useI18n();
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setMe)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const user = me?.user;
  const status = me?.membership?.status || "none";
  const initial = (user?.name || user?.email || "?")[0]?.toUpperCase();

  // Friendly subscription label.
  const statusLabel =
    status === "active"
      ? t("billing.active")
      : status === "trialing"
      ? t("billing.trial")
      : status;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pe-2 ps-1 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name || "user"}
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20">
            {initial}
          </span>
        )}
        <span
          className={`hidden rounded-full px-2 py-0.5 text-[11px] font-medium capitalize sm:inline ${
            STATUS_STYLES[status] || "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {statusLabel}
        </span>
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-100 p-3 dark:border-slate-700">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
              {user?.name || "—"}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                STATUS_STYLES[status] || "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {t("billing.title")}: {statusLabel}
            </span>
          </div>
          <div className="p-1">
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              💎 {t("nav.billing")}
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              ⚙️ {t("nav.settings")}
            </Link>
            {me && !me.hasGoogle && (
              <button
                onClick={() => signIn("google")}
                className="block w-full rounded-lg px-3 py-2 text-start text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                🔗 {t("settings.connectGoogle")}
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="block w-full rounded-lg px-3 py-2 text-start text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              🚪 {t("common.signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
