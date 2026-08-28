import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authorizeUser } from "@/lib/mock-users";

/**
 * Authentication experience — 06 Platform Core/app-shell.md, ADR-005.
 * Credentials provider backed by the mock user table (see mock-users.ts)
 * until Implementation Volume 2 (Database Blueprint) exists.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = authorizeUser(email, password);
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          initials: user.initials,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.company = user.company;
        token.initials = user.initials;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? "Employee";
        session.user.company = token.company ?? "";
        session.user.initials = token.initials ?? "";
      }
      return session;
    },
  },
});
