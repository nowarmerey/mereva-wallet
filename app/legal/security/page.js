"use client";

import LegalDoc, { H2, P, UL } from "@/components/LegalDoc";

export default function SecurityPage() {
  return (
    <LegalDoc title="Security">
      <P>
        Protecting your financial information is a core priority for Mereva
        Wallet. This page explains the main measures we use and what you can do
        to keep your account safe.
      </P>

      <H2>How we protect your data</H2>
      <UL
        items={[
          "Encryption in transit: all traffic between your device and our servers is protected with HTTPS/TLS.",
          "Account isolation: every record is tied to your user account, so users can only ever access their own data.",
          "Password protection: account passwords are stored only as salted, hashed values — never in plain text.",
          "Optional PIN lock: you can require a PIN and automatic locking after inactivity on your device.",
          "Trusted sign-in: optional Google sign-in uses OAuth, so we never see your Google password.",
          "Payments: card processing is handled by a PCI-DSS compliant payment provider; we don’t store full card numbers.",
        ]}
      />

      <H2>Backups</H2>
      <P>
        You control your backups. You can export an encryptable copy of your data
        to a local file, or back up to your own Google Drive. Drive backups live
        in your Google account, under your control, and only the most recent copy
        is kept to minimize stored data.
      </P>

      <H2>What you can do</H2>
      <UL
        items={[
          "Use a strong, unique password and enable two-step verification on your email and Google account.",
          "Turn on the in-app PIN lock and auto-lock.",
          "Keep your devices and browser up to date.",
          "Only sign in on devices you trust, and sign out on shared computers.",
        ]}
      />

      <H2>Reporting a vulnerability</H2>
      <P>
        If you believe you’ve found a security issue, please contact us at
        security@mereva-wallet.app. We appreciate responsible disclosure and will
        respond as quickly as we can.
      </P>
    </LegalDoc>
  );
}
