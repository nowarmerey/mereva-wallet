"use client";

import { useI18n } from "@/lib/i18n";
import LegalDoc, { H2, P } from "@/components/LegalDoc";

// Imprint / Impressum (§5 DDG). [bracketed] fields must be filled with real data.
const C = {
  en: {
    title: "Imprint (Impressum)",
    intro: "Information pursuant to §5 of the German Digital Services Act (DDG).",
    provider: "Provider",
    contact: "Contact",
    vat: "VAT ID",
    responsible: "Responsible for content (§18 MStV)",
    disputeT: "Consumer dispute resolution",
    dispute:
      "We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.",
  },
  de: {
    title: "Impressum",
    intro: "Angaben gemäß §5 DDG (Digitale-Dienste-Gesetz).",
    provider: "Anbieter",
    contact: "Kontakt",
    vat: "Umsatzsteuer-ID",
    responsible: "Verantwortlich für den Inhalt (§18 Abs. 2 MStV)",
    disputeT: "Verbraucherstreitbeilegung",
    dispute:
      "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
  },
  ar: {
    title: "بيان الناشر (Impressum)",
    intro: "بيانات وفقاً للمادة 5 من قانون الخدمات الرقمية الألماني (DDG).",
    provider: "مزوّد الخدمة",
    contact: "التواصل",
    vat: "الرقم الضريبي (USt-IdNr)",
    responsible: "المسؤول عن المحتوى (§18 MStV)",
    disputeT: "تسوية نزاعات المستهلك",
    dispute:
      "لسنا ملزمين ولا راغبين بالمشاركة في إجراءات تسوية النزاعات أمام هيئة تحكيم استهلاكية.",
  },
};

export default function ImpressumPage() {
  const { locale } = useI18n();
  const c = C[locale] || C.en;

  return (
    <LegalDoc title={c.title}>
      <P>{c.intro}</P>

      <H2>{c.provider}</H2>
      <P>
        [Full name / company]
        <br />
        [Street and number]
        <br />
        [Postal code, City]
        <br />
        [Country: Germany]
      </P>

      <H2>{c.contact}</H2>
      <P>
        Email: [your-email@domain]
        <br />
        Phone: [+49 …]
      </P>

      <H2>{c.vat}</H2>
      <P>[USt-IdNr., e.g. DE123456789 — or remove if not applicable]</P>

      <H2>{c.responsible}</H2>
      <P>
        [Full name]
        <br />
        [Address as above]
      </P>

      <H2>{c.disputeT}</H2>
      <P>{c.dispute}</P>
    </LegalDoc>
  );
}
