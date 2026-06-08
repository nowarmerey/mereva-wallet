"use client";

import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/lib/i18n";
import PwaManager from "./PwaManager";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <I18nProvider>
        {children}
        <PwaManager />
      </I18nProvider>
    </SessionProvider>
  );
}
