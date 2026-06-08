"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/lib/i18n";
import PwaManager from "./PwaManager";
import CookieConsent from "./CookieConsent";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <I18nProvider>
        {children}
        <PwaManager />
        <CookieConsent />
      </I18nProvider>
    </SessionProvider>
  );
}
