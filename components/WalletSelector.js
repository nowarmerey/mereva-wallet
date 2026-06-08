"use client";

import { useEffect, useState } from "react";
import { getActiveWalletId, setActiveWalletId, useActiveWallet } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";

// Dropdown in the navbar to switch the globally-active wallet (0 = All).
export default function WalletSelector() {
  const { t } = useI18n();
  const active = useActiveWallet();
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    fetch("/api/wallets")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setWallets(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Re-fetch wallet list when one is added/removed elsewhere.
  useEffect(() => {
    const handler = () =>
      fetch("/api/wallets")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setWallets(Array.isArray(data) ? data : []))
        .catch(() => {});
    window.addEventListener("walletschanged", handler);
    return () => window.removeEventListener("walletschanged", handler);
  }, []);

  if (wallets.length === 0) return null;

  return (
    <select
      value={active}
      onChange={(e) => setActiveWalletId(Number(e.target.value))}
      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      title="Active wallet"
    >
      <option value={0}>👛 {t("common.allWallets")}</option>
      {wallets.map((w) => (
        <option key={w.id} value={w.id}>
          {w.icon} {w.name}
        </option>
      ))}
    </select>
  );
}
