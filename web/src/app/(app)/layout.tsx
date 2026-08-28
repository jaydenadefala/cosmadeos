import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/session-provider";
import { DevPreviewProvider } from "@/components/shell/dev-preview-context";
import { AppShell } from "@/components/shell/app-shell";
import type { SessionUser } from "@/lib/mock-session";

/**
 * Authenticated app shell layout. Middleware already redirects unauthenticated
 * requests to /login (src/middleware.ts) — this redirect is a defense-in-depth
 * fallback, not the primary guard.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user: SessionUser = {
    name: session.user.name ?? "Unknown",
    email: session.user.email ?? "",
    role: session.user.role,
    company: session.user.company,
    initials: session.user.initials,
  };

  return (
    <AuthSessionProvider>
      <DevPreviewProvider>
        <AppShell user={user}>{children}</AppShell>
      </DevPreviewProvider>
    </AuthSessionProvider>
  );
}
