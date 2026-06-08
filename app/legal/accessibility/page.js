"use client";

import LegalDoc, { H2, P, UL } from "@/components/LegalDoc";

export default function AccessibilityPage() {
  return (
    <LegalDoc title="Accessibility">
      <P>
        Mereva Wallet is committed to making personal money management usable by
        everyone, including people with disabilities. We aim to follow widely
        recognized standards such as the Web Content Accessibility Guidelines
        (WCAG) 2.1 Level AA.
      </P>

      <H2>What we do</H2>
      <UL
        items={[
          "Responsive layouts that work on phones, tablets and desktops.",
          "Keyboard-navigable controls and visible focus states.",
          "Sufficient color contrast and a dark mode option.",
          "Support for right-to-left languages (Arabic) and multiple interface languages.",
          "Descriptive labels for interactive elements where possible.",
        ]}
      />

      <H2>Ongoing work</H2>
      <P>
        Accessibility is an ongoing effort. We continue to test and improve the
        experience, and we welcome feedback that helps us identify barriers.
      </P>

      <H2>Need help or found a barrier?</H2>
      <P>
        If you encounter an accessibility issue, or need information in an
        alternative format, contact accessibility@mereva-wallet.app and we will
        do our best to help.
      </P>
    </LegalDoc>
  );
}
