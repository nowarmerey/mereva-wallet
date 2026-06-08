"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushToggle() {
  const { t } = useI18n();
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [state, setState] = useState("idle"); // idle|enabled|busy|unsupported|denied
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !vapid) {
      setState("unsupported");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "enabled" : "idle"))
      .catch(() => setState("idle"));
  }, [vapid]);

  async function enable() {
    setMsg("");
    setState("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error();
      setState("enabled");
      setMsg(t("push.enabled"));
    } catch {
      setState("idle");
      setMsg(t("push.denied"));
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t("push.title")}
      </p>
      <p className="mb-2 text-xs text-slate-400">{t("push.desc")}</p>

      {state === "unsupported" ? (
        <p className="text-sm text-slate-400">{t("push.unsupported")}</p>
      ) : state === "enabled" ? (
        <p className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {t("push.enabled")}
        </p>
      ) : (
        <button
          onClick={enable}
          disabled={state === "busy"}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {state === "busy" ? "…" : t("push.enable")}
        </button>
      )}
      {msg && state !== "enabled" && (
        <p className="mt-2 text-xs text-slate-400">{msg}</p>
      )}
    </div>
  );
}
