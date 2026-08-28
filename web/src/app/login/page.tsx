"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { demoAccounts } from "@/lib/demo-accounts";

/**
 * Authentication experience — 06 Platform Core/app-shell.md, ADR-005.
 * Outside the (app) route group deliberately, so it renders without the
 * App Shell (no nav/sidebar for a signed-out user).
 */
export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("That email or password isn't right. Try one of the demo accounts below.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="bg-muted/30 flex min-h-svh w-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-bold">
            C
          </span>
          <h1 className="text-lg font-semibold">Sign in to Cosmade OS</h1>
          <p className="text-muted-foreground text-sm">The unified enterprise operating system</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-background flex flex-col gap-4 rounded-xl border p-6 shadow-sm"
        >
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@cosmademedical.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="text-muted-foreground mt-6 rounded-lg border border-dashed p-4 text-xs">
          <p className="mb-2 font-medium">
            Demo accounts (mock user store — see ADR-005 in DECISIONS.md)
          </p>
          <ul className="space-y-1">
            {demoAccounts.map((u) => (
              <li key={u.email} className="flex justify-between gap-2">
                <span>{u.email}</span>
                <span>{u.role}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Password for every demo account: <code className="font-mono">cosmade123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
