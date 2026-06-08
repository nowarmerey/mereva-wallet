import { withAuth } from "next-auth/middleware";

// Require a valid session for all app pages. The public landing page ("/"),
// auth pages and API routes are excluded. API routes do their own auth checks.
export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      const p = req.nextUrl.pathname;
      // Public pages: marketing landing, about page, and legal/privacy pages.
      if (p === "/" || p === "/about" || p.startsWith("/legal")) return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    "/((?!login|register|forgot|reset|api|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js|offline.html|icons|uploads).*)",
  ],
};
