import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Universal error state — 03 Design Principles/states-and-feedback.md
 * "Errors should be human." Bad: "Error 500." Good: a plain-language
 * explanation. Always offers Retry / View Details / Contact Support /
 * Report Issue — only the handlers actually passed in render as buttons.
 */
export function ErrorState({
  title,
  description,
  onRetry,
  onViewDetails,
  onContactSupport,
  onReportIssue,
  className,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  onViewDetails?: () => void;
  onContactSupport?: () => void;
  onReportIssue?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="bg-destructive/10 text-destructive mb-1 flex size-10 items-center justify-center rounded-full">
        <AlertTriangle className="size-5" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      ) : null}
      {onRetry || onViewDetails || onContactSupport || onReportIssue ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {onRetry ? (
            <Button size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
          {onViewDetails ? (
            <Button size="sm" variant="outline" onClick={onViewDetails}>
              View details
            </Button>
          ) : null}
          {onContactSupport ? (
            <Button size="sm" variant="ghost" onClick={onContactSupport}>
              Contact support
            </Button>
          ) : null}
          {onReportIssue ? (
            <Button size="sm" variant="ghost" onClick={onReportIssue}>
              Report issue
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
