"use client";

import { useEffect, useState } from "react";

// The "active wallet" is stored in localStorage. 0 = All wallets.
export function getActiveWalletId() {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem("activeWalletId") || 0);
}

export function setActiveWalletId(id) {
  localStorage.setItem("activeWalletId", String(id));
  // Notify every component listening (navbar selector + pages).
  window.dispatchEvent(new Event("walletchange"));
}

// React hook that re-renders when the active wallet changes anywhere.
export function useActiveWallet() {
  const [id, setId] = useState(0);
  useEffect(() => {
    setId(getActiveWalletId());
    const handler = () => setId(getActiveWalletId());
    window.addEventListener("walletchange", handler);
    return () => window.removeEventListener("walletchange", handler);
  }, []);
  return id;
}
