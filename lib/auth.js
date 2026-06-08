import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { seedNewUser } from "./seed-user";

// Wrap the Prisma adapter so linkAccount only receives columns that exist in
// our Account model. Google sometimes returns extra fields (e.g.
// `refresh_token_expires_in`) which would otherwise crash linkAccount and
// cause an "error=Callback" on sign-in.
function buildAdapter() {
  const base = PrismaAdapter(prisma);
  const ACCOUNT_FIELDS = [
    "userId",
    "type",
    "provider",
    "providerAccountId",
    "refresh_token",
    "access_token",
    "expires_at",
    "token_type",
    "scope",
    "id_token",
    "session_state",
  ];
  return {
    ...base,
    linkAccount: (account) => {
      const data = {};
      for (const k of ACCOUNT_FIELDS) {
        if (account[k] !== undefined) data[k] = account[k];
      }
      return base.linkAccount(data);
    },
  };
}

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });
      if (!user || !user.passwordHash) return null;
      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  }),
];

// Only enable Google if it has been configured (keeps /login working otherwise).
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          // request offline access + Drive scope so we can back up to Drive.
          // "select_account consent" forces Google to show the account chooser
          // AND the consent screen every time (so users pick the account).
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file",
          access_type: "offline",
          prompt: "select_account consent",
        },
      },
    })
  );
}

export const authOptions = {
  adapter: buildAdapter(),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers,
  events: {
    // New OAuth (Google) users get the same starter data + trial as sign-ups.
    async createUser({ user }) {
      try {
        await seedNewUser(user.id);
      } catch (e) {
        console.error("seedNewUser (createUser event) failed:", e);
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role || "USER";
      }
      if (token.uid && !token.role) {
        const u = await prisma.user.findUnique({ where: { id: token.uid } });
        token.role = u?.role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export const googleEnabled = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
