import * as React from "react";

/**
 * Mock Requests dataset + shared store — Operations sidebar
 * (05 Department Operating Systems/Operations/operations-operating-system.md:
 * "Requests (workflow/queue view)"). Distinct from Procurement (purchasing-
 * specific) — this is the general internal request queue (equipment access,
 * facilities, IT support). CLAUDE.md's Operations action set: "Approve
 * Request, Assign Task, Escalate Issue."
 */
export const REQUEST_TYPES = ["Equipment", "Access", "Facilities", "IT Support", "Other"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const REQUEST_STATUSES = ["Open", "In Progress", "Escalated", "Resolved"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface OperationsRequest {
  id: string;
  title: string;
  type: RequestType;
  description: string;
  requestedById: string;
  assignedToId?: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdDate: string;
  archived: boolean;
}

const seedRequests: OperationsRequest[] = [
  {
    id: "request-1",
    title: "Badge access for new field engineer",
    type: "Access",
    description: "Abby Huang needs warehouse and vehicle-bay badge access for site visits.",
    requestedById: "priya-shah",
    assignedToId: "alexandre-hamilton",
    priority: "Medium",
    status: "In Progress",
    createdDate: "2026-07-20",
    archived: false,
  },
  {
    id: "request-2",
    title: "Replacement laptop — damaged screen",
    type: "IT Support",
    description: "Sam Okafor's laptop screen cracked during a site visit; needs a loaner while repaired.",
    requestedById: "sam-okafor",
    priority: "High",
    status: "Open",
    createdDate: "2026-07-24",
    archived: false,
  },
  {
    id: "request-3",
    title: "AC unit not cooling — Lagos office",
    type: "Facilities",
    description: "Second floor AC unit stopped cooling. Affecting the whole finance team.",
    requestedById: "maria-santos",
    priority: "Urgent",
    status: "Escalated",
    createdDate: "2026-07-25",
    archived: false,
  },
  {
    id: "request-4",
    title: "Extra calibration equipment for Kano trip",
    type: "Equipment",
    description: "Need a second calibration toolkit for the upcoming multi-site Kano trip.",
    requestedById: "daniel-kim",
    priority: "Low",
    status: "Resolved",
    createdDate: "2026-07-05",
    archived: false,
  },
];

let state: OperationsRequest[] = seedRequests;
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

export function useOperationsRequests(): OperationsRequest[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addOperationsRequest(input: {
  title: string;
  type: RequestType;
  description: string;
  requestedById: string;
  priority: RequestPriority;
}): OperationsRequest {
  const request: OperationsRequest = {
    id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    status: "Open",
    createdDate: new Date().toISOString().slice(0, 10),
    archived: false,
  };
  state = [request, ...state];
  notify();
  return request;
}

/** CLAUDE.md's Operations action set: "Assign Task." */
export function assignRequest(id: string, assignedToId: string) {
  state = state.map((r) => (r.id === id ? { ...r, assignedToId, status: "In Progress" } : r));
  notify();
}

/** CLAUDE.md's Operations action set: "Approve Request." */
export function setRequestStatus(id: string, status: RequestStatus) {
  state = state.map((r) => (r.id === id ? { ...r, status } : r));
  notify();
}

/** CLAUDE.md's Operations action set: "Escalate Issue." */
export function escalateRequest(id: string) {
  state = state.map((r) => (r.id === id ? { ...r, status: "Escalated", priority: "Urgent" } : r));
  notify();
}

export function archiveOperationsRequests(ids: string[]) {
  state = state.map((r) => (ids.includes(r.id) ? { ...r, archived: true } : r));
  notify();
}

export function deleteOperationsRequest(id: string) {
  state = state.filter((r) => r.id !== id);
  notify();
}
