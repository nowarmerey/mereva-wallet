"use client";

import LegalDoc, { H2, P, UL } from "@/components/LegalDoc";

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service">
      <P>
        Welcome to Mereva Wallet. These Terms of Service (“Terms”) govern your
        access to and use of the Mereva Wallet website, applications and related
        services (the “Service”). By creating an account or using the Service you
        agree to these Terms. If you do not agree, please do not use the Service.
      </P>

      <H2>1. Your account</H2>
      <P>
        You must provide accurate information when registering and keep your
        credentials confidential. You are responsible for all activity that
        happens under your account. You must be old enough to form a binding
        contract in your country to use the Service.
      </P>

      <H2>2. Subscriptions and billing</H2>
      <UL
        items={[
          "Some features require a paid subscription. Prices and plan details are shown before you subscribe.",
          "Paid plans renew automatically at the end of each billing period until cancelled.",
          "You can cancel at any time; access continues until the end of the current period.",
          "Free trials convert to a paid plan unless cancelled before the trial ends.",
          "Payments are processed by our payment provider; we do not store your full card details.",
        ]}
      />

      <H2>3. Acceptable use</H2>
      <P>
        You agree to use the Service only for lawful purposes and in line with
        our Acceptable Use Policy. You may not misuse, disrupt, reverse-engineer
        or attempt to gain unauthorized access to the Service or other users’
        data.
      </P>

      <H2>4. Your content and data</H2>
      <P>
        You retain ownership of the financial information you enter. You grant us
        a limited license to store and process it solely to provide the Service
        (for example, to display your dashboard, generate reports and create
        backups you request). You can export or delete your data at any time.
      </P>

      <H2>5. Service availability</H2>
      <P>
        We work to keep the Service reliable but provide it “as is” without
        warranties of uninterrupted or error-free operation. We may modify,
        suspend or discontinue features with reasonable notice where possible.
      </P>

      <H2>6. Limitation of liability</H2>
      <P>
        Mereva Wallet is a personal money-management tool and does not provide
        financial, tax or investment advice. To the maximum extent permitted by
        law, we are not liable for indirect or consequential damages arising from
        your use of the Service or decisions made based on it.
      </P>

      <H2>7. Termination</H2>
      <P>
        You may stop using the Service and delete your account at any time. We
        may suspend or terminate accounts that violate these Terms or applicable
        law.
      </P>

      <H2>8. Changes to these Terms</H2>
      <P>
        We may update these Terms from time to time. If we make material changes,
        we will notify you through the Service or by email. Continued use after
        changes take effect means you accept the updated Terms.
      </P>

      <H2>9. Contact</H2>
      <P>
        Questions about these Terms? Contact us at support@mereva-wallet.app.
      </P>
    </LegalDoc>
  );
}
