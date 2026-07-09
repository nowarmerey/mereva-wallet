"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const SECTIONS = [
  {
    icon: "🏠",
    title: { en: "Dashboard", ar: "لوحة التحكم", de: "Übersicht" },
    body: {
      en: "See your total income, expenses and net balance at a glance, plus an expenses-by-category pie chart, a balance-over-time line and your monthly budget progress.",
      ar: "اطّلع على إجمالي الدخل والمصاريف وصافي الرصيد بنظرة واحدة، مع مخطط دائري للمصاريف حسب التصنيف، ومخطط للرصيد عبر الوقت، وتقدّم ميزانياتك الشهرية.",
      de: "Sieh Einnahmen, Ausgaben und Saldo auf einen Blick – plus Kreisdiagramm, Saldoverlauf und Monatsbudgets.",
    },
    href: "/",
  },
  {
    icon: "💳",
    title: { en: "Transactions & Search", ar: "العمليات والبحث", de: "Transaktionen & Suche" },
    body: {
      en: "Add income/expenses, attach a receipt photo, filter by type, category, wallet and date, and use the global search to find anything by note, category or amount. Smart categorization suggests a category from your past notes.",
      ar: "أضف الدخل/المصاريف، أرفق صورة إيصال، فلتر حسب النوع والتصنيف والمحفظة والتاريخ، واستخدم البحث الشامل لإيجاد أي شيء عبر الملاحظة أو التصنيف أو المبلغ. والتصنيف الذكي يقترح تصنيفاً من ملاحظاتك السابقة.",
      de: "Erfasse Einnahmen/Ausgaben, hänge Belege an, filtere und nutze die globale Suche. Die smarte Kategorisierung schlägt Kategorien vor.",
    },
    href: "/transactions",
  },
  {
    icon: "👛",
    title: { en: "Wallets & Transfers", ar: "المحافظ والتحويلات", de: "Geldbörsen & Überweisungen" },
    body: {
      en: "Create separate wallets (Cash, Travel, Home, Work…), each with its own balance, and move money between them with a transfer.",
      ar: "أنشئ محافظ منفصلة (نقد، سفر، منزل، عمل…) لكل منها رصيدها الخاص، وحوّل الأموال بينها بسهولة.",
      de: "Erstelle getrennte Geldbörsen mit eigenem Saldo und überweise dazwischen.",
    },
    href: "/wallets",
  },
  {
    icon: "🧾",
    title: { en: "Bills", ar: "الفواتير", de: "Rechnungen" },
    body: {
      en: "Track recurring bills with a paid/unpaid status each month and get due-soon and overdue reminders. Marking a bill paid records the expense automatically.",
      ar: "تابع الفواتير المتكررة بحالة مدفوعة/غير مدفوعة كل شهر مع تذكيرات الاستحقاق والتأخير. تعليم الفاتورة كمدفوعة يسجّل المصروف تلقائياً.",
      de: "Verfolge wiederkehrende Rechnungen mit Bezahlt-Status und Erinnerungen.",
    },
    href: "/bills",
  },
  {
    icon: "🔁",
    title: { en: "Subscriptions", ar: "الاشتراكات", de: "Abonnements" },
    body: {
      en: "Manage weekly/monthly/yearly subscriptions, see your estimated monthly cost, and get reminders before each renewal.",
      ar: "أدر اشتراكاتك الأسبوعية/الشهرية/السنوية، وشاهد التكلفة الشهرية التقديرية، واحصل على تذكيرات قبل كل تجديد.",
      de: "Verwalte Abos, sieh die geschätzten Monatskosten und erhalte Erinnerungen.",
    },
    href: "/subscriptions",
  },
  {
    icon: "🎯",
    title: { en: "Goals", ar: "الأهداف", de: "Ziele" },
    body: {
      en: "Set saving goals with a target and deadline, then track your progress and add contributions over time.",
      ar: "حدّد أهداف ادخار بمبلغ وموعد، ثم تابع تقدّمك وأضف إيداعات تدريجياً.",
      de: "Setze Sparziele mit Zielbetrag und Frist und verfolge den Fortschritt.",
    },
    href: "/goals",
  },
  {
    icon: "📈",
    title: { en: "Analytics & Forecast", ar: "التحليلات والتوقّع", de: "Analysen & Prognose" },
    body: {
      en: "Discover your highest spending day, average daily spend, best saving month and income/expense ratio — plus a cash-flow forecast for the rest of the month.",
      ar: "اكتشف أعلى يوم صرف، ومتوسط الصرف اليومي، وأفضل شهر ادخار، ونسبة الدخل/المصاريف — مع توقّع للتدفق النقدي لبقية الشهر.",
      de: "Entdecke Spitzentage, Tagesdurchschnitt, besten Sparmonat und eine Cashflow-Prognose.",
    },
    href: "/analytics",
  },
  {
    icon: "🏷️",
    title: { en: "Categories & Budgets", ar: "التصنيفات والميزانيات", de: "Kategorien & Budgets" },
    body: {
      en: "Create your own categories with icons and set a monthly limit on any of them to get near-limit and over-budget alerts.",
      ar: "أنشئ تصنيفاتك بأيقونات وحدّد حداً شهرياً لأي منها لتصلك تنبيهات الاقتراب من الحد وتجاوزه.",
      de: "Erstelle eigene Kategorien und setze Monatslimits mit Warnungen.",
    },
    href: "/categories",
  },
  {
    icon: "🔒",
    title: { en: "Security (PIN)", ar: "الحماية (PIN)", de: "Sicherheit (PIN)" },
    body: {
      en: "Protect the app with a PIN that locks automatically after a period of inactivity. Set it up in Settings.",
      ar: "احمِ التطبيق برمز PIN يقفل تلقائياً بعد فترة من الخمول. فعّله من الإعدادات.",
      de: "Schütze die App mit einer PIN und automatischer Sperre. In den Einstellungen.",
    },
    href: "/settings",
  },
  {
    icon: "☁️",
    title: { en: "Backup to Google Drive", ar: "النسخ إلى Google Drive", de: "Sicherung auf Google Drive" },
    body: {
      en: "Export your data as a file or back it up straight to your Google Drive, and restore it any time from Settings.",
      ar: "صدّر بياناتك كملف أو انسخها مباشرة إلى Google Drive، واسترجعها في أي وقت من الإعدادات.",
      de: "Exportiere deine Daten oder sichere sie direkt auf Google Drive – jederzeit wiederherstellbar.",
    },
    href: "/settings",
  },
  {
    icon: "💎",
    title: { en: "Subscription", ar: "الاشتراك", de: "Abonnement" },
    body: {
      en: "Start with a free trial, then choose a plan that fits you. Manage or cancel your subscription anytime.",
      ar: "ابدأ بفترة تجريبية مجانية، ثم اختر الخطة المناسبة لك. أدر اشتراكك أو ألغِه في أي وقت.",
      de: "Beginne mit einer Testphase und wähle dann einen Plan. Jederzeit verwaltbar.",
    },
    href: "/billing",
  },
];

export default function HelpPage() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(0);
  const lang = ["en", "ar", "de"].includes(locale) ? locale : "en";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center text-white shadow-sm">
        <div className="text-4xl">📖</div>
        <h2 className="mt-2 text-2xl font-bold">{t("help.title")}</h2>
        <p className="mt-1 text-indigo-100">{t("help.subtitle")}</p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 glass-card"
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {s.title[lang]}
                  </span>
                </span>
                <span
                  className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {s.body[lang]}
                  </p>
                  <Link
                    href={s.href}
                    className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {s.title[lang]} →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
