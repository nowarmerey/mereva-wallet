"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

// Wraps the app. If a PIN is set, shows a full-screen lock until the correct
// PIN is entered, and re-locks automatically after a period of inactivity.
export default function SecurityGate({ children }) {
  const { t } = useI18n();
  const [hasPin, setHasPin] = useState(false);
  const [autoLock, setAutoLock] = useState(5);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const timer = useRef(null);

  // Load security config on first mount.
  useEffect(() => {
    fetch("/api/security")
      .then((r) => (r.ok ? r.json() : { hasPin: false }))
      .then((d) => {
        setHasPin(!!d.hasPin);
        setAutoLock(d.autoLockMinutes || 5);
        // Lock on load if a PIN exists and this session wasn't unlocked.
        if (d.hasPin && sessionStorage.getItem("unlocked") !== "yes") {
          setLocked(true);
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  // Inactivity auto-lock.
  useEffect(() => {
    if (!hasPin) return;
    const reset = () => {
      clearTimeout(timer.current);
      if (!locked) {
        timer.current = setTimeout(() => {
          sessionStorage.removeItem("unlocked");
          setLocked(true);
        }, autoLock * 60 * 1000);
      }
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [hasPin, autoLock, locked]);

  async function unlock(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", pin }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem("unlocked", "yes");
        setLocked(false);
        setPin("");
      } else {
        setError(t("lock.incorrect"));
        setPin("");
      }
    } catch {
      setError("Something went wrong.");
    }
  }

  // Avoid a flash of content before we know the lock state.
  if (!ready && hasPin) return null;

  return (
    <>
      {children}
      {locked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur">
          <form
            onSubmit={unlock}
            className="w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl"
          >
            <div className="mb-2 text-4xl">🔒</div>
            <h2 className="mb-1 text-lg font-semibold text-slate-100">
              {t("lock.title")}
            </h2>
            <p className="mb-5 text-sm text-slate-400">{t("lock.body")}</p>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-lg tracking-[0.4em] text-slate-100 outline-none focus:border-indigo-500"
            />
            {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t("lock.unlock")}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
