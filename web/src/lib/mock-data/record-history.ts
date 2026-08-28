import * as React from "react";

/**
 * Record History / Audit Trail — CLAUDE.md "CRUD Is Mandatory" names
 * "Activity History, Audit Trail" as mandatory on every entity, and "Every
 * Detail Page Must Answer... Who created this? When was it created? Who
 * modified it?" The Universal Object Layout's "History" tab previously
 * rendered static "No change history yet." text on 14 of 20 detail pages
 * with nothing behind it — no honest way to answer those questions.
 *
 * Deliberately does NOT seed fabricated historical entries (no invented
 * "Created by [name] on [date]" for records that predate this store) —
 * matches this session's established rule against dishonest UI states (see
 * ROADMAP.md's Sync Pending note). Instead, real entries are logged the
 * moment a real lifecycle action happens (Archive, Restore, Delete,
 * Duplicate, status changes, etc.), keyed by the same `entityKey` pattern
 * already established by web/src/lib/mock-data/comments.ts.
 */
export interface RecordHistoryEntry {
  id: string;
  entityKey: string;
  action: string;
  detail?: string;
  actorName: string;
  actorInitials: string;
  timestamp: number;
}

let state: RecordHistoryEntry[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useRecordHistory(entityKey: string): RecordHistoryEntry[] {
  const all = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return React.useMemo(
    () => all.filter((e) => e.entityKey === entityKey).sort((a, b) => b.timestamp - a.timestamp),
    [all, entityKey],
  );
}

export function logHistoryEvent(
  entityKey: string,
  action: string,
  actorName: string,
  actorInitials: string,
  detail?: string,
) {
  const entry: RecordHistoryEntry = {
    id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entityKey,
    action,
    detail,
    actorName,
    actorInitials,
    timestamp: Date.now(),
  };
  state = [...state, entry];
  notify();
}
