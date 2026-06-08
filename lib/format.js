"use client";

import { CURRENCIES } from "./constants";

// Read the user's selected currency from localStorage (client only).
export function getCurrency() {
  if (typeof window === "undefined") return "USD";
  return localStorage.getItem("currency") || "USD";
}

export function currencySymbol(code) {
  const found = CURRENCIES.find((c) => c.code === code);
  return found ? found.symbol : code;
}

// Format a number as a currency string, e.g. "$1,250.00".
export function formatMoney(amount, code) {
  const currency = code || getCurrency();
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback for currencies Intl may not know (keeps the app from crashing).
    return `${currencySymbol(currency)}${value.toFixed(2)}`;
  }
}

// "2026-06-05" -> nice readable date.
export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
