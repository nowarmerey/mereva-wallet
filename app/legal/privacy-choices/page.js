"use client";

import LegalDoc, { H2, P, UL } from "@/components/LegalDoc";

export default function PrivacyChoicesPage() {
  return (
    <LegalDoc title="Your Privacy Choices">
      <P>
        We believe you should be in control of your data. This page summarizes
        the choices available to you in Mereva Wallet.
      </P>

      <H2>Manage your data in the app</H2>
      <UL
        items={[
          "Export a full copy of your data (Settings → Backup → Download backup).",
          "Restore from a local file or from your Google Drive backup.",
          "Edit or delete any transaction, wallet, category, bill, subscription or goal.",
          "Delete your entire account and its data from Settings.",
        ]}
      />

      <H2>Optional integrations</H2>
      <UL
        items={[
          "Google sign-in and Google Drive backup are optional. You can connect or disconnect Google at any time in Settings → Sign-in & linked accounts.",
          "Disconnecting Google removes our access to your Drive and revokes the stored tokens.",
        ]}
      />

      <H2>Communications</H2>
      <P>
        We only send essential account and service messages. If we ever introduce
        optional updates, you’ll be able to opt out.
      </P>

      <H2>Do Not Sell or Share</H2>
      <P>
        We do not sell or share your personal information for advertising. There
        is nothing you need to opt out of for that purpose — it simply isn’t part
        of how Mereva Wallet works.
      </P>

      <H2>Submit a privacy request</H2>
      <P>
        To access, correct or delete your data, use the in-app tools above or
        email privacy@mereva-wallet.app.
      </P>
    </LegalDoc>
  );
}
