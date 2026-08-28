import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    company: string;
    initials: string;
  }

  interface Session {
    user: {
      role: string;
      company: string;
      initials: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    company?: string;
    initials?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    company?: string;
    initials?: string;
  }
}
