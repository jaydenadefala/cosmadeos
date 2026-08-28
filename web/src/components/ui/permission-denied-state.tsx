import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Universal permission-denied state — 04 Enterprise Architecture (Universal
 * States) + 09 Security/security-overview.md UX Notes: show *why* something
 * is restricted rather than just hiding it, the same transparency principle
 * behind the Developer Preview Toolbar's Permission Overlay.
 */
export function PermissionDeniedState({
  requiredRole,
  description,
  onRequestAccess,
  className,
}: {
  requiredRole: string;
  description?: string;
  onRequestAccess?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="bg-muted text-muted-foreground mb-1 flex size-10 items-center justify-center rounded-full">
        <Lock className="size-5" />
      </div>
      <p className="text-sm font-medium">Restricted — requires {requiredRole}</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        {description ??
          "You don't have permission to view this page. Ask an administrator if you need access."}
      </p>
      {onRequestAccess ? (
        <Button size="sm" variant="outline" className="mt-2" onClick={onRequestAccess}>
          Request access
        </Button>
      ) : null}
    </div>
  );
}
