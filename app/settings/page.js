"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { CURRENCIES } from "@/lib/constants";
import { useI18n, LOCALES } from "@/lib/i18n";
import PushToggle from "@/components/PushToggle";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { t, locale, setLocale } = useI18n();

  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("light");
  const [autoLock, setAutoLock] = useState(5);
  const [hasPin, setHasPin] = useState(false);

  // Automatic monthly salary
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryDay, setSalaryDay] = useState(1);
  const [salaryWalletId, setSalaryWalletId] = useState("");
  const [wallets, setWallets] = useState([]);
  const [salaryMsg, setSalaryMsg] = useState("");
  const [salaryErr, setSalaryErr] = useState("");
  const [hasGoogle, setHasGoogle] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [pin, setPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [pinErr, setPinErr] = useState("");

  const [backupMsg, setBackupMsg] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [driveFiles, setDriveFiles] = useState(null); // null = not loaded yet
  const fileRef = useRef(null);

  // Account sign-in / linked accounts
  const [hasPassword, setHasPassword] = useState(false);
  const [googleInfo, setGoogleInfo] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [curPw, setCurPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [linkMsg, setLinkMsg] = useState("");
  const [linkErr, setLinkErr] = useState("");

  function loadMe() {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const g = !!d?.hasGoogle;
        setHasGoogle(g);
        setHasPassword(!!d?.hasPassword);
        if (g) {
          loadDriveFiles();
          fetch("/api/account/google")
            .then((r) => (r.ok ? r.json() : null))
            .then((info) => setGoogleInfo(info?.linked ? info : null))
            .catch(() => {});
        } else {
          setGoogleInfo(null);
        }
      })
      .catch(() => {});
  }

  function loadDriveFiles() {
    fetch("/api/backup/google")
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((d) => setDriveFiles(Array.isArray(d.files) ? d.files : []))
      .catch(() => setDriveFiles([]));
  }

  useEffect(() => {
    setCurrency(localStorage.getItem("currency") || "USD");
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setCurrency(d.currency || "USD");
          setAutoLock(d.autoLockMinutes ?? 5);
          setHasPin(!!d.hasPin);
          setSalaryAmount(d.salaryAmount ?? "");
          setSalaryDay(d.salaryDay ?? 1);
          setSalaryWalletId(d.salaryWalletId ?? "");
        }
      })
      .catch(() => {});
    fetch("/api/wallets")
      .then((r) => (r.ok ? r.json() : []))
      .then((w) => setWallets(Array.isArray(w) ? w : []))
      .catch(() => {});
    loadMe();
  }, []);

  async function saveSalary() {
    setSalaryErr("");
    setSalaryMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salaryAmount: salaryAmount === "" ? null : Number(salaryAmount),
          salaryDay: Number(salaryDay) || 1,
          salaryWalletId: salaryWalletId === "" ? null : Number(salaryWalletId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSalaryMsg(t("settings.salarySaved"));
      setTimeout(() => setSalaryMsg(""), 2500);
    } catch (err) {
      setSalaryErr(err.message);
    }
  }

  function applyTheme(value) {
    setTheme(value);
    if (value === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  async function handleSave() {
    setError("");
    setSaved(false);
    localStorage.setItem("currency", currency);
    localStorage.setItem("theme", theme);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, theme, autoLockMinutes: Number(autoLock), locale }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePin() {
    setPinErr("");
    setPinMsg("");
    if (pin.length < 4) return setPinErr(t("settings.pinErr"));
    const res = await fetch("/api/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set", pin, current: currentPin, autoLockMinutes: Number(autoLock) }),
    });
    const data = await res.json();
    if (!res.ok) return setPinErr(data.error || "Failed to set PIN");
    setHasPin(true);
    setPin("");
    setCurrentPin("");
    setPinMsg(t("settings.pinSaved"));
    setTimeout(() => setPinMsg(""), 2500);
  }

  async function removePin() {
    setPinErr("");
    setPinMsg("");
    const res = await fetch("/api/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", current: currentPin }),
    });
    const data = await res.json();
    if (!res.ok) return setPinErr(data.error || "Failed to remove PIN");
    setHasPin(false);
    setCurrentPin("");
    sessionStorage.removeItem("unlocked");
    setPinMsg(t("settings.pinRemoved"));
    setTimeout(() => setPinMsg(""), 2500);
  }

  async function backupToGoogle() {
    if (backupBusy) return;
    setBackupMsg("");
    setError("");
    setBackupBusy(true);
    try {
      const res = await fetch("/api/backup/google", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Backup failed");
      setBackupMsg(t("settings.backedUp"));
      loadDriveFiles(); // refresh the list so the new backup shows immediately
      setTimeout(() => setBackupMsg(""), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBackupBusy(false);
    }
  }

  async function restoreFromDrive(fileId) {
    if (restoreBusy) return;
    if (!confirm(t("settings.restoreConfirm"))) return;
    setError("");
    setBackupMsg("");
    setRestoreBusy(true);
    try {
      const res = await fetch("/api/backup/google/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setBackupMsg(t("settings.restored"));
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err.message);
      setRestoreBusy(false);
    }
  }

  async function savePassword() {
    setPwErr("");
    setPwMsg("");
    if (newPw.length < 6) return setPwErr(t("auth.invalid"));
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    });
    const data = await res.json();
    if (!res.ok) return setPwErr(data.error || "Failed");
    setHasPassword(true);
    setNewPw("");
    setCurPw("");
    setPwMsg(t("settings.passwordSet"));
    setTimeout(() => setPwMsg(""), 3000);
  }

  async function unlinkGoogle() {
    setLinkErr("");
    setLinkMsg("");
    if (!confirm(t("settings.unlinkConfirm"))) return;
    const res = await fetch("/api/account/unlink-google", { method: "POST" });
    const data = await res.json();
    if (!res.ok) return setLinkErr(data.error || "Failed");
    setHasGoogle(false);
    setDriveFiles(null);
    setLinkMsg(t("settings.googleUnlinked"));
    setTimeout(() => setLinkMsg(""), 3000);
  }

  async function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm(t("settings.restoreConfirm"))) {
      e.target.value = "";
      return;
    }
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const res = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup }),
      });
      if (!res.ok) throw new Error("Import failed");
      setBackupMsg(t("settings.restored"));
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = "";
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 glass-input dark:text-slate-100";
  const labelClass = "mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300";
  const card =
    "space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {t("settings.title")}
      </h2>

      {/* Account */}
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("settings.account")}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-500/15">
            {(session?.user?.name || session?.user?.email || "?")[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {session?.user?.name || "—"}
            </p>
            <p className="text-sm text-slate-400">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* General */}
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("settings.general")}
        </h3>
        <div>
          <label className={labelClass}>{t("settings.language")}</label>
          <select
            className={inputClass}
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("settings.currency")}</label>
          <select className={inputClass} value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("settings.theme")}</label>
          <div className="grid grid-cols-2 gap-2">
            {["light", "dark"].map((tk) => (
              <button
                key={tk}
                onClick={() => applyTheme(tk)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  theme === tk
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : "border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {tk === "light" ? `☀️ ${t("settings.light")}` : `🌙 ${t("settings.dark")}`}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">{t("common.save")} ✓</p>}
        <button onClick={handleSave} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          {t("common.save")}
        </button>
      </div>

      {/* Automatic monthly salary */}
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          💰 {t("settings.salary")}
        </h3>
        <p className="text-xs text-slate-400">{t("settings.salaryHint")}</p>
        <div>
          <label className={labelClass}>{t("settings.salaryAmount")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={salaryAmount}
            onChange={(e) => setSalaryAmount(e.target.value)}
            placeholder={t("settings.salaryOffPh")}
          />
        </div>
        <div>
          <label className={labelClass}>{t("settings.salaryDay")}</label>
          <input
            type="number"
            min="1"
            max="31"
            className={inputClass}
            value={salaryDay}
            onChange={(e) => setSalaryDay(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>{t("settings.salaryWallet")}</label>
          <select
            className={inputClass}
            value={salaryWalletId}
            onChange={(e) => setSalaryWalletId(e.target.value)}
          >
            <option value="">{t("settings.salaryDefaultWallet")}</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.icon} {w.name}
              </option>
            ))}
          </select>
        </div>
        {salaryErr && <p className="text-sm text-rose-600">{salaryErr}</p>}
        {salaryMsg && <p className="text-sm text-emerald-600">{salaryMsg}</p>}
        <button
          onClick={saveSalary}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t("common.save")}
        </button>
      </div>

      {/* Security */}
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          🔒 {t("settings.security")}
        </h3>
        <div>
          <label className={labelClass}>{t("settings.autoLock")}</label>
          <input type="number" min="1" max="120" className={inputClass} value={autoLock} onChange={(e) => setAutoLock(e.target.value)} />
        </div>
        {hasPin && (
          <div>
            <label className={labelClass}>{t("settings.currentPin")}</label>
            <input type="password" className={inputClass} value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} placeholder={t("settings.currentPinPh")} />
          </div>
        )}
        <div>
          <label className={labelClass}>{(hasPin ? t("settings.newPin") : t("settings.setPinLabel")) + " " + t("settings.pinMin")}</label>
          <input type="password" className={inputClass} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" />
        </div>
        {pinErr && <p className="text-sm text-rose-600">{pinErr}</p>}
        {pinMsg && <p className="text-sm text-emerald-600">{pinMsg}</p>}
        <div className="flex gap-2">
          <button onClick={savePin} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            {hasPin ? t("settings.changePin") : t("settings.setPin")}
          </button>
          {hasPin && (
            <button onClick={removePin} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:hover:bg-rose-500/10">
              {t("settings.removePin")}
            </button>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <PushToggle />
        </div>
      </div>

      {/* Sign-in & linked accounts */}
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          🔑 {t("settings.signin")}
        </h3>

        {/* Google link status */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Google
          </p>
          {hasGoogle ? (
            <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {googleInfo?.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={googleInfo.picture}
                      alt="Google"
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-700">
                      🔵
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {googleInfo?.name || t("settings.googleLinked")}
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓ {t("settings.googleLinked")}
                      </span>
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {googleInfo?.email || "—"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={unlinkGoogle}
                  className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:hover:bg-rose-500/10"
                >
                  {t("settings.unlinkGoogle")}
                </button>
              </div>
              {googleInfo?.hasDriveAccess && (
                <p className="mt-2 text-xs text-slate-400">
                  ☁️ {t("settings.cloudGroup")} — Drive
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/settings" })}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("settings.linkGoogle")}
            </button>
          )}
          <p className="mt-2 text-xs text-slate-400">{t("settings.linkNote")}</p>
          {linkMsg && <p className="mt-1 text-sm text-emerald-600">{linkMsg}</p>}
          {linkErr && <p className="mt-1 text-sm text-rose-600">{linkErr}</p>}
        </div>

        {/* Account password */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("settings.password")}
          </p>
          {hasPassword && (
            <div className="mb-2">
              <label className={labelClass}>{t("settings.currentPassword")}</label>
              <input
                type="password"
                className={inputClass}
                value={curPw}
                onChange={(e) => setCurPw(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className={labelClass}>{t("settings.newPassword")}</label>
            <input
              type="password"
              className={inputClass}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••"
            />
          </div>
          {!hasPassword && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {t("settings.passwordHint")}
            </p>
          )}
          {pwErr && <p className="mt-1 text-sm text-rose-600">{pwErr}</p>}
          {pwMsg && <p className="mt-1 text-sm text-emerald-600">{pwMsg}</p>}
          <button
            onClick={savePassword}
            className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {hasPassword ? t("settings.changePassword") : t("settings.setPassword")}
          </button>
        </div>
      </div>

      {/* Backup & restore */}
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          ☁️ {t("settings.backup")}
        </h3>
        {backupMsg && <p className="text-sm text-emerald-600">{backupMsg}</p>}

        {/* Option 1 — local file (works without Google) */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("settings.localGroup")}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/backup/export"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("settings.download")}
            </a>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("settings.restore")}
            </button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importFile} />
          </div>
        </div>

        {/* Option 2 — Google Drive */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("settings.cloudGroup")}
          </p>
          {hasGoogle ? (
            <div>
              <button
                onClick={backupToGoogle}
                disabled={backupBusy}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {backupBusy && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {backupBusy ? t("settings.backingUp") : t("settings.toGoogle")}
              </button>

              {/* List of existing backups on Drive */}
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("settings.driveBackups")}
                  </p>
                  <button
                    onClick={loadDriveFiles}
                    className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    ↻ {t("settings.refresh")}
                  </button>
                </div>
                {driveFiles === null ? (
                  <p className="text-xs text-slate-400">{t("common.loading")}</p>
                ) : driveFiles.length === 0 ? (
                  <p className="text-xs text-slate-400">{t("settings.noBackups")}</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {driveFiles.map((f, i) => (
                      <li
                        key={f.id || i}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs"
                      >
                        <span className="flex min-w-0 items-center gap-2 truncate text-slate-600 dark:text-slate-300">
                          📄 <span className="truncate">{f.name}</span>
                          {i === 0 && (
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                              {t("settings.lastBackup")}
                            </span>
                          )}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-slate-400">
                            {f.createdTime ? new Date(f.createdTime).toLocaleString() : ""}
                          </span>
                          <button
                            onClick={() => restoreFromDrive(f.id)}
                            disabled={restoreBusy}
                            className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 dark:bg-indigo-500/10 dark:text-indigo-300"
                          >
                            {restoreBusy ? t("settings.restoring") : `⬆️ ${t("settings.restoreFromDrive")}`}
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[11px] text-slate-400">{t("settings.onlyOne")}</p>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => signIn("google")}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("settings.connectGoogle")}
              </button>
              <p className="mt-2 text-xs text-slate-400">{t("settings.googleHint")}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
