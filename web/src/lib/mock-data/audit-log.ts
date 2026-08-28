import * as React from "react";

/**
 * Mock Audit Log dataset — Operations sidebar
 * (05 Department Operating Systems/Operations/operations-operating-system.md:
 * "Audit Logs (read-only history-style table)"). Deliberately read-only —
 * per the source doc, this is a compliance/history surface, not a CRUD
 * entity. `logAuditEvent` exists so other parts of the app *could* append
 * real entries as actions happen, but there is intentionally no create/
 * edit/delete UI here — CLAUDE.md's CRUD-mandatory rule allows exactly this
 * kind of explicit, documented exception ("read-only is an explicit,
 * deliberate design decision").
 */
export const AUDIT_CATEGORIES = ["Security", "Finance", "Operations", "HR", "System"] as const;
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  category: AuditCategory;
  timestamp: string;
}

const seedEntries: AuditLogEntry[] = [
  {
    id: "audit-1",
    actor: "Jayden Adefala",
    action: "Approved procurement request",
    target: "Replacement calibration toolkits (x5)",
    category: "Operations",
    timestamp: "2026-07-22 14:03",
  },
  {
    id: "audit-2",
    actor: "Priya Shah",
    action: "Changed access level",
    target: "Maria Santos → Admin",
    category: "Security",
    timestamp: "2026-07-21 09:15",
  },
  {
    id: "audit-3",
    actor: "Maria Santos",
    action: "Recorded payment",
    target: "INV-1002 — Kano Teaching Hospital",
    category: "Finance",
    timestamp: "2026-06-15 11:47",
  },
  {
    id: "audit-4",
    actor: "Jayden Adefala",
    action: "Merged duplicate company",
    target: "Enugu Diagnostics → Victoria Island Clinic",
    category: "Operations",
    timestamp: "2026-07-18 16:22",
  },
  {
    id: "audit-5",
    actor: "Priya Shah",
    action: "Started offboarding",
    target: "Alexandre Hamilton",
    category: "HR",
    timestamp: "2026-07-19 10:05",
  },
  {
    id: "audit-6",
    actor: "System",
    action: "Session expired",
    target: "employee@cosmademedical.com",
    category: "System",
    timestamp: "2026-07-25 23:58",
  },
];

let state: AuditLogEntry[] = seedEntries;
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

export function useAuditLog(): AuditLogEntry[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Append-only — no update/delete, matching the read-only design of this surface. */
export function logAuditEvent(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const logged: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
  };
  state = [logged, ...state];
  notify();
}
