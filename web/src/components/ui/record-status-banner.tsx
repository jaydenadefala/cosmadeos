import { Archive, Lock, ShieldAlert, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RecordStatus = "archived" | "deleted" | "read-only" | "maintenance";

const CONFIG = {
  archived: {
    icon: Archive,
    defaultMessage: "This record is archived.",
    tone: "bg-muted text-foreground/70",
  },
  deleted: {
    icon: Trash2,
    defaultMessage: "This record was deleted. It will be permanently removed after 30 days.",
    tone: "bg-destructive/10 text-destructive",
  },
  "read-only": {
    icon: Lock,
    defaultMessage: "This record is read-only. You don't have permission to make changes.",
    tone: "bg-muted text-foreground/70",
  },
  maintenance: {
    icon: ShieldAlert,
    defaultMessage: "This section is temporarily unavailable for maintenance.",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
} as const;

/**
 * Universal States: Archived, Deleted, Read Only, Maintenance Mode —
 * 04 Enterprise Architecture/enterprise-information-architecture.md
 * ("Every state has a defined visual treatment and user action"), and the
 * Undo Philosophy (03 Design Principles/interaction-patterns.md): "Never
 * delete immediately. Instead: Archive → Undo → Delete Permanently" — the
 * Restore/Delete Permanently actions here are that undo path's UI.
 */
export function RecordStatusBanner({
  status,
  message,
  onRestore,
  onDeletePermanently,
  className,
}: {
  status: RecordStatus;
  message?: string;
  onRestore?: () => void;
  onDeletePermanently?: () => void;
  className?: string;
}) {
  const { icon: Icon, defaultMessage, tone } = CONFIG[status];

  return (
    <div className={cn("flex flex-wrap items-center gap-2 px-4 py-2 text-sm sm:px-6", tone, className)}>
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{message ?? defaultMessage}</span>
      {onRestore ? (
        <Button size="sm" variant="outline" onClick={onRestore}>
          Restore
        </Button>
      ) : null}
      {onDeletePermanently ? (
        <Button size="sm" variant="destructive" onClick={onDeletePermanently}>
          Delete permanently
        </Button>
      ) : null}
    </div>
  );
}
