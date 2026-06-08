"use client";

import { useI18n } from "@/lib/i18n";
import LegalDoc, { H2, P } from "@/components/LegalDoc";

const C = {
  en: {
    title: "Right of Withdrawal",
    right: ["Right of withdrawal", "You have the right to withdraw from this contract within 14 days without giving any reason. The withdrawal period is 14 days from the day of the conclusion of the contract."],
    how: ["How to withdraw", "To exercise your right, inform us ([Provider name, address, email]) of your decision by a clear statement (e.g. a letter or email). You may use the model form below, but it is not obligatory."],
    digital: ["Digital services", "If you expressly requested that the service begin during the withdrawal period and acknowledged that you thereby lose your right of withdrawal once the service is fully provided, your right of withdrawal expires accordingly."],
    consequences: ["Consequences", "If you withdraw in time, we will refund payments received without undue delay and within 14 days. For services already used with your prior consent, a proportionate amount may be retained."],
    formT: "Model withdrawal form",
    form: "To [Provider name, address, email]: I/We hereby withdraw from the contract concluded by me/us for the following service: Mereva Wallet subscription. Ordered on / received on: ____. Name: ____. Address: ____. Date: ____. Signature (only on paper): ____.",
  },
  de: {
    title: "Widerrufsbelehrung",
    right: ["Widerrufsrecht", "Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag des Vertragsabschlusses."],
    how: ["Ausübung des Widerrufs", "Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ([Anbietername, Anschrift, E-Mail]) mittels einer eindeutigen Erklärung (z. B. Brief oder E-Mail) über Ihren Entschluss informieren. Sie können das nachstehende Muster verwenden, dies ist jedoch nicht vorgeschrieben."],
    digital: ["Digitale Leistungen", "Wenn Sie ausdrücklich verlangt haben, dass die Leistung während der Widerrufsfrist beginnt, und bestätigt haben, dass Sie Ihr Widerrufsrecht mit vollständiger Vertragserfüllung verlieren, erlischt das Widerrufsrecht entsprechend."],
    consequences: ["Folgen des Widerrufs", "Bei fristgerechtem Widerruf erstatten wir erhaltene Zahlungen unverzüglich und binnen 14 Tagen. Für bereits mit Ihrer Zustimmung genutzte Leistungen kann ein angemessener Betrag einbehalten werden."],
    formT: "Muster-Widerrufsformular",
    form: "An [Anbietername, Anschrift, E-Mail]: Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über die folgende Leistung: Mereva-Wallet-Abonnement. Bestellt am / erhalten am: ____. Name: ____. Anschrift: ____. Datum: ____. Unterschrift (nur bei Mitteilung auf Papier): ____.",
  },
  ar: {
    title: "حق الإلغاء (Widerrufsbelehrung)",
    right: ["حق الإلغاء", "يحق لك إلغاء هذا العقد خلال 14 يوماً دون إبداء أسباب. تبدأ مدة الإلغاء من يوم إبرام العقد."],
    how: ["كيفية الإلغاء", "لممارسة حقك، أبلغنا ([اسم المزوّد، العنوان، البريد]) بقرارك عبر إفادة واضحة (رسالة أو بريد). يمكنك استخدام النموذج أدناه، لكنه غير إلزامي."],
    digital: ["الخدمات الرقمية", "إذا طلبت صراحةً بدء الخدمة خلال مدة الإلغاء وأقررت بأنك تفقد حقك في الإلغاء بمجرد تنفيذ الخدمة بالكامل، فإن حق الإلغاء يسقط تبعاً لذلك."],
    consequences: ["نتائج الإلغاء", "عند الإلغاء في الوقت المحدد نعيد المبالغ المستلمة دون تأخير وخلال 14 يوماً. وللخدمات المستخدَمة مسبقاً بموافقتك قد يُحتجز مبلغ متناسب."],
    formT: "نموذج الإلغاء",
    form: "إلى [اسم المزوّد، العنوان، البريد]: أُلغي/نُلغي بموجب هذا العقد المبرم بشأن الخدمة التالية: اشتراك Mereva Wallet. تاريخ الطلب/الاستلام: ____. الاسم: ____. العنوان: ____. التاريخ: ____. التوقيع (للورق فقط): ____.",
  },
};

export default function WiderrufPage() {
  const { locale } = useI18n();
  const c = C[locale] || C.en;
  const blocks = [c.right, c.how, c.digital, c.consequences];

  return (
    <LegalDoc title={c.title}>
      {blocks.map(([h, body], i) => (
        <div key={i}>
          <H2>{h}</H2>
          <P>{body}</P>
        </div>
      ))}
      <H2>{c.formT}</H2>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm italic text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
        {c.form}
      </div>
    </LegalDoc>
  );
}
