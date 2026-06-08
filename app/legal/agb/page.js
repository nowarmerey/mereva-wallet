"use client";

import { useI18n } from "@/lib/i18n";
import LegalDoc, { H2, P } from "@/components/LegalDoc";

const C = {
  en: {
    title: "General Terms (AGB)",
    s: [
      ["1. Scope", "These terms govern the use of Mereva Wallet (the “Service”) provided by [Provider name, address]. By creating an account you accept these terms."],
      ["2. Service", "Mereva Wallet is a personal money-management web/mobile application. We provide it with reasonable care but without a guarantee of uninterrupted availability."],
      ["3. Registration", "You must provide accurate data and keep your credentials confidential. You are responsible for activity under your account."],
      ["4. Prices & payment", "Paid plans are shown inclusive of statutory VAT where applicable. Payment is processed by Stripe. Subscriptions renew automatically for the chosen period until cancelled."],
      ["5. Term & cancellation", "Subscriptions can be cancelled at any time with effect from the end of the current billing period, via the in-app cancellation button or your payment provider portal."],
      ["6. Right of withdrawal", "Consumers have a 14-day right of withdrawal — see our separate Right of Withdrawal page. For digital services you may consent to immediate performance and thereby waive this right once the service begins."],
      ["7. Liability", "Mereva Wallet provides no financial, tax or investment advice. We are liable only for intent and gross negligence, and for slight negligence only upon breach of essential contractual duties, limited to foreseeable damage."],
      ["8. Changes", "We may amend these terms with reasonable notice; continued use after the effective date constitutes acceptance."],
      ["9. Applicable law", "German law applies. Place of jurisdiction is [City], where permitted by law."],
    ],
  },
  de: {
    title: "Allgemeine Geschäftsbedingungen (AGB)",
    s: [
      ["1. Geltungsbereich", "Diese AGB regeln die Nutzung von Mereva Wallet (der „Dienst“), bereitgestellt von [Anbietername, Anschrift]. Mit der Registrierung akzeptierst du diese Bedingungen."],
      ["2. Leistung", "Mereva Wallet ist eine App zur persönlichen Finanzverwaltung. Wir stellen sie mit angemessener Sorgfalt bereit, jedoch ohne Garantie einer ununterbrochenen Verfügbarkeit."],
      ["3. Registrierung", "Du musst korrekte Daten angeben und deine Zugangsdaten geheim halten. Du bist für Aktivitäten unter deinem Konto verantwortlich."],
      ["4. Preise & Zahlung", "Kostenpflichtige Pläne werden inkl. gesetzlicher USt. (sofern anwendbar) angezeigt. Die Zahlung erfolgt über Stripe. Abonnements verlängern sich automatisch um die gewählte Laufzeit bis zur Kündigung."],
      ["5. Laufzeit & Kündigung", "Abonnements können jederzeit zum Ende der laufenden Abrechnungsperiode gekündigt werden – über den Kündigungsbutton in der App oder das Portal des Zahlungsdienstleisters."],
      ["6. Widerrufsrecht", "Verbraucher haben ein 14-tägiges Widerrufsrecht – siehe separate Widerrufsbelehrung. Bei digitalen Leistungen kannst du der sofortigen Ausführung zustimmen und verlierst damit das Widerrufsrecht mit Beginn der Leistung."],
      ["7. Haftung", "Mereva Wallet bietet keine Finanz-, Steuer- oder Anlageberatung. Wir haften nur für Vorsatz und grobe Fahrlässigkeit sowie bei leichter Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren Schaden."],
      ["8. Änderungen", "Wir können diese AGB mit angemessener Ankündigung ändern; die weitere Nutzung nach Inkrafttreten gilt als Zustimmung."],
      ["9. Anwendbares Recht", "Es gilt deutsches Recht. Gerichtsstand ist [Stadt], soweit gesetzlich zulässig."],
    ],
  },
  ar: {
    title: "الشروط والأحكام العامة (AGB)",
    s: [
      ["1. النطاق", "تنظّم هذه الشروط استخدام Mereva Wallet («الخدمة») المقدّمة من [اسم المزوّد، العنوان]. بإنشائك حساباً فإنك تقبل هذه الشروط."],
      ["2. الخدمة", "Mereva Wallet تطبيق لإدارة المال الشخصي، نقدّمه بعناية معقولة دون ضمان توفّر متواصل دون انقطاع."],
      ["3. التسجيل", "يجب تقديم بيانات صحيحة والحفاظ على سرية بيانات الدخول. أنت مسؤول عن النشاط ضمن حسابك."],
      ["4. الأسعار والدفع", "تُعرض الخطط المدفوعة شاملةً ضريبة القيمة المضافة القانونية عند انطباقها. تتم المعالجة عبر Stripe. تتجدّد الاشتراكات تلقائياً للمدة المختارة حتى الإلغاء."],
      ["5. المدة والإلغاء", "يمكن إلغاء الاشتراك في أي وقت ليسري مع نهاية فترة الفوترة الحالية، عبر زر الإلغاء في التطبيق أو بوابة مزوّد الدفع."],
      ["6. حق الإلغاء", "للمستهلكين حق إلغاء خلال 14 يوماً — انظر صفحة حق الإلغاء المنفصلة. للخدمات الرقمية يمكنك الموافقة على البدء الفوري وبذلك تفقد هذا الحق بمجرد بدء الخدمة."],
      ["7. المسؤولية", "لا تقدّم Mereva Wallet استشارات مالية أو ضريبية أو استثمارية. نتحمّل المسؤولية فقط عن العمد والإهمال الجسيم، وعن الإهمال البسيط فقط عند الإخلال بالتزامات تعاقدية جوهرية وبحدود الضرر المتوقَّع."],
      ["8. التعديلات", "يجوز لنا تعديل هذه الشروط بإشعار معقول؛ ويُعدّ الاستمرار في الاستخدام بعد سريانها قبولاً بها."],
      ["9. القانون المطبّق", "يُطبّق القانون الألماني. مكان الاختصاص القضائي هو [المدينة]، بالقدر الذي يسمح به القانون."],
    ],
  },
};

export default function AgbPage() {
  const { locale } = useI18n();
  const c = C[locale] || C.en;
  return (
    <LegalDoc title={c.title}>
      {c.s.map(([h, body], i) => (
        <div key={i}>
          <H2>{h}</H2>
          <P>{body}</P>
        </div>
      ))}
    </LegalDoc>
  );
}
