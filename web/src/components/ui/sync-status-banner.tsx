import { Loader2, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";

export type ConnectivityStatus = "offline" | "sync-pending" | "synced";

/**
 * Universal States: Offline, Sync Pending —
 * 03 Design Principles/states-and-feedback.md Offline Experience: "warn
 * user, continue editing where possible, queue supported actions, auto-sync
 * on reconnect, display sync status clearly." "synced" renders nothing —
 * that transient confirmation belongs to the Confidence principle's
 * "Saved." toast pattern, not a persistent banner.
 */
export function SyncStatusBanner({
  status,
  pendingCount,
  className,
}: {
  status: ConnectivityStatus;
  pendingCount?: number;
  className?: string;
}) {
  if (status === "synced") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm sm:px-6",
        status === "offline"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          : "bg-muted text-foreground/70",
        className,
      )}
    >
      {status === "offline" ? (
        <>
          <WifiOff className="size-4 shrink-0" />
          <span>You&apos;re offline. Changes will sync automatically when you reconnect.</span>
        </>
      ) : (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span>
            Syncing{typeof pendingCount === "number" ? ` ${pendingCount} change${pendingCount === 1 ? "" : "s"}` : ""}…
          </span>
        </>
      )}
    </div>
  );
}
