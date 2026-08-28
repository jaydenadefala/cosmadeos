"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { History } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { logHistoryEvent, useRecordHistory } from "@/lib/mock-data/record-history";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function relativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Record History / Audit Trail tab — see web/src/lib/mock-data/
 * record-history.ts for why this replaces static "No change history yet."
 * placeholder text platform-wide. Pair with useLogRecordHistory to record
 * real lifecycle actions (Archive, Restore, Delete, status changes) as they
 * happen.
 */
export function RecordHistory({ entityKey }: { entityKey: string }) {
  const entries = useRecordHistory(entityKey);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No history yet"
        description="Actions taken on this record — status changes, archiving, edits — will appear here."
      />
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2.5">
          <Avatar className="size-7 shrink-0">
            <AvatarFallback className="text-xs">{entry.actorInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="text-sm font-medium">{entry.actorName}</span>
              <span className="text-muted-foreground text-sm">{entry.action}</span>
              <span className="text-muted-foreground text-xs">{relativeTime(entry.timestamp)}</span>
            </div>
            {entry.detail ? <p className="text-muted-foreground text-sm">{entry.detail}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bind the current session user so call sites just say `logHistory("Archived")`. */
export function useLogRecordHistory(entityKey: string) {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "You";
  const userInitials = initialsOf(userName);

  return React.useCallback(
    (action: string, detail?: string) => {
      logHistoryEvent(entityKey, action, userName, userInitials, detail);
    },
    [entityKey, userName, userInitials],
  );
}
