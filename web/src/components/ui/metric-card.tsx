import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared cross-phase component (ROADMAP.md) — populates the "Summary Cards"
 * row of the Universal Object Layout and workspace overview pages. Analytics
 * belong on dashboards/summary rows, not on primary working-surface tables
 * (ADR-002) — this is the component that carries that analytics weight.
 */
export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  delta?: { value: string; tone: "positive" | "negative" | "neutral" };
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("bg-card flex flex-col gap-1 rounded-lg border p-4", className)}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {delta ? (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              delta.tone === "positive" && "text-emerald-700 dark:text-emerald-400",
              delta.tone === "negative" && "text-destructive",
              delta.tone === "neutral" && "text-muted-foreground",
            )}
          >
            {delta.tone === "positive" ? <TrendingUp className="size-3" /> : null}
            {delta.tone === "negative" ? <TrendingDown className="size-3" /> : null}
            {delta.value}
          </span>
        ) : null}
      </div>
    </div>
  );
}
