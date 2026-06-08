// Shared constants. Categories here are only the DEFAULT seed values — the
// source of truth at runtime is the Category table (editable by the user).

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food", icon: "🍔" },
  { name: "Transport", icon: "🚌" },
  { name: "Rent", icon: "🏠" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Health", icon: "💊" },
  { name: "Bills", icon: "🧾" },
  { name: "Education", icon: "📚" },
  { name: "Subscriptions", icon: "🔁" },
  { name: "Other", icon: "📦" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", icon: "💼" },
  { name: "Freelance", icon: "💻" },
  { name: "Gift", icon: "🎁" },
  { name: "Investment", icon: "📈" },
  { name: "Other Income", icon: "➕" },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar (USD)" },
  { code: "EUR", symbol: "€", label: "Euro (EUR)" },
  { code: "SYP", symbol: "£S", label: "Syrian Pound (SYP)" },
  { code: "SAR", symbol: "﷼", label: "Saudi Riyal (SAR)" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham (AED)" },
  { code: "GBP", symbol: "£", label: "British Pound (GBP)" },
  { code: "TRY", symbol: "₺", label: "Turkish Lira (TRY)" },
];

export const WALLET_ICONS = ["👛", "💵", "✈️", "🏠", "💼", "🎓", "🚗", "🏦", "💳", "🐖"];
export const CATEGORY_ICONS = [
  "🏷️", "🍔", "🚌", "🏠", "🎬", "🛍️", "💊", "🧾", "📚", "🔁",
  "📦", "💼", "💻", "🎁", "📈", "➕", "☕", "⛽", "🎮", "🍿",
];

export const FREQUENCIES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];
