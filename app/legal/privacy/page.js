"use client";

import LegalDoc, { H2, P, UL } from "@/components/LegalDoc";

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy">
      <P>
        This Privacy Policy explains what information Mereva Wallet collects, how
        we use it, and the choices you have. We aim to collect only what we need
        to run the Service.
      </P>

      <H2>Information we collect</H2>
      <UL
        items={[
          "Account information: your name, email address and (if you set one) a hashed password.",
          "Google profile (optional): if you sign in with Google, your basic profile (name, email, photo) and tokens needed for backup.",
          "Financial data you enter: transactions, wallets, categories, bills, subscriptions and goals.",
          "Usage and device data: basic technical information needed to operate and secure the Service.",
        ]}
      />

      <H2>How we use your information</H2>
      <UL
        items={[
          "To provide and maintain the Service (dashboards, reports, budgets, backups).",
          "To process subscriptions and payments through our payment provider.",
          "To secure accounts and prevent fraud or abuse.",
          "To communicate important notices about your account or the Service.",
        ]}
      />

      <H2>How we share information</H2>
      <P>
        We do not sell your personal information. We share data only with service
        providers who help us operate (such as hosting and payment processing),
        under contracts that require them to protect it, or when required by law.
      </P>

      <H2>Data retention</H2>
      <P>
        We keep your data while your account is active. You can delete individual
        records or your entire account at any time; deleting your account removes
        your personal data from our active systems, subject to limited legal or
        accounting retention requirements.
      </P>

      <H2>Your rights</H2>
      <UL
        items={[
          "Access and export your data (Settings → Backup).",
          "Correct or update your information.",
          "Delete your data or close your account.",
          "Withdraw consent for optional integrations such as Google Drive.",
        ]}
      />

      <H2>International users</H2>
      <P>
        Depending on where you live, you may have additional rights (for example,
        under the GDPR in Europe). See our U.S. State Privacy Notice and Your
        Privacy Choices pages for region-specific details.
      </P>

      <H2>Contact</H2>
      <P>
        For privacy questions or requests, contact privacy@mereva-wallet.app.
      </P>
    </LegalDoc>
  );
}
