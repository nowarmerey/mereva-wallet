import "./globals.css";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Mereva Wallet — Personal Expense Manager",
  description: "Track income & expenses with a clean, modern, multi-language app.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mereva Wallet",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#E30613",
};

// Apply the saved theme + language before hydration (prevents a flash).
const initScript = `
  (function () {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'dark') document.documentElement.classList.add('dark');
      var l = localStorage.getItem('locale') || 'en';
      document.documentElement.lang = l;
      document.documentElement.dir = (l === 'ar') ? 'rtl' : 'ltr';
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="font-sans bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
        <div className="app-ambient" aria-hidden="true" />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
