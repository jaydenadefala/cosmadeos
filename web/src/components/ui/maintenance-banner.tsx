import { Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Universal State: Maintenance — CLAUDE.md's UI Philosophy: "Every screen
 * defines all Universal States... Maintenance." Non-blocking (matches the
 * Offline banner's "warn user, continue where possible" philosophy) —
 * mutations still work against the local mock-data store, this only warns
 * that a real scheduled maintenance window is active.
 */
export function MaintenanceBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400",
        className,
      )}
    >
      <Wrench className="size-4 shrink-0" />
      <span>Scheduled maintenance is in progress. Some features may be temporarily unavailable.</span>
    </div>
  );
}
