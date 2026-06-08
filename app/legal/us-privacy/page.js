"use client";

import LegalDoc, { H2, P, UL } from "@/components/LegalDoc";

export default function USPrivacyPage() {
  return (
    <LegalDoc title="U.S. State Privacy Notice">
      <P>
        This notice provides additional information for residents of U.S. states
        that grant specific privacy rights (such as California, Virginia,
        Colorado, Connecticut and others). It supplements our Privacy Policy.
      </P>

      <H2>Categories of information</H2>
      <P>
        We may process identifiers (name, email), account credentials in hashed
        form, the financial records you enter, and limited technical/usage data.
        We collect this information directly from you and from optional
        integrations you enable (such as Google sign-in).
      </P>

      <H2>We do not sell your data</H2>
      <P>
        We do not sell your personal information and we do not “share” it for
        cross-context behavioral advertising. We use your information only to
        provide and secure the Service.
      </P>

      <H2>Your state privacy rights</H2>
      <UL
        items={[
          "Right to know what personal information we hold about you.",
          "Right to access and obtain a copy of your data.",
          "Right to correct inaccurate information.",
          "Right to delete your personal information.",
          "Right to non-discrimination for exercising these rights.",
        ]}
      />

      <H2>How to exercise your rights</H2>
      <P>
        You can access, export and delete your data directly in the app
        (Settings → Backup and Account). You may also email
        privacy@mereva-wallet.app. We will verify your request using your account
        email before acting on it. You may use an authorized agent where the law
        allows.
      </P>

      <H2>Appeals</H2>
      <P>
        If we decline a request, you may appeal by replying to our decision
        email. We will review and respond within the timeframe required by your
        state’s law.
      </P>
    </LegalDoc>
  );
}
