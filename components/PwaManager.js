"use client";

import { useEffect, useState } from "react";

// Registers the service worker and shows an "Install app" button when the
// browser allows it (Android/Chrome/Edge/desktop). iOS users add via Share menu.
export default function PwaManager() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      // Don't nag: only show if not dismissed before.
      if (localStorage.getItem("pwaDismissed") !== "1") setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem("pwaDismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <span className="text-2xl">📲</span>
      <div className="text-sm">
        <p className="font-medium text-slate-800 dark:text-slate-100">Install Mereva Wallet</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Add it to your home screen.</p>
      </div>
      <button
        onClick={install}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Install
      </button>
      <button
        onClick={dismiss}
        className="rounded-lg px-2 py-1.5 text-sm text-slate-400 hover:text-slate-600"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
