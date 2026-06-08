"use client";

import LegalDoc, { H2, P, UL } from "@/components/LegalDoc";

export default function AcceptableUsePage() {
  return (
    <LegalDoc title="Acceptable Use Policy">
      <P>
        This Acceptable Use Policy describes activities that are not permitted on
        Mereva Wallet. It is part of our Terms of Service and helps keep the
        Service safe and reliable for everyone.
      </P>

      <H2>You must not</H2>
      <UL
        items={[
          "Use the Service for any unlawful, fraudulent or harmful purpose.",
          "Attempt to access accounts, data or systems that do not belong to you.",
          "Probe, scan, or test the vulnerability of the Service without permission.",
          "Interfere with or disrupt the Service, servers or networks (e.g. denial-of-service).",
          "Reverse-engineer, copy or resell the Service except as allowed by law.",
          "Upload malware, or content that is illegal, infringing or abusive.",
          "Use automated means to scrape or overload the Service.",
          "Misrepresent your identity or impersonate others.",
        ]}
      />

      <H2>Fair use of resources</H2>
      <P>
        To keep the Service fast for all users, we may apply reasonable limits
        (for example on backup frequency or request rates) and may contact you if
        your usage is significantly higher than normal.
      </P>

      <H2>Enforcement</H2>
      <P>
        We may investigate suspected violations and may suspend or terminate
        access, remove content, or take legal action where appropriate. We will
        use reasonable judgment and, where possible, give notice.
      </P>

      <H2>Reporting abuse</H2>
      <P>
        To report a violation, contact abuse@mereva-wallet.app.
      </P>
    </LegalDoc>
  );
}
