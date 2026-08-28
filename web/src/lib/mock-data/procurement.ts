import * as React from "react";

/**
 * Mock Procurement dataset + shared store — Operations sidebar
 * (05 Department Operating Systems/Operations/operations-operating-system.md).
 * CLAUDE.md's Operations action set names "Submit Procurement, Approve
 * Procurement" explicitly. Real cross-references to Vendor and Employee
 * (requester) — the referential-integrity pattern.
 */
export const PROCUREMENT_STATUSES = ["Draft", "Submitted", "Approved", "Rejected", "Ordered", "Received"] as const;
export type ProcurementStatus = (typeof PROCUREMENT_STATUSES)[number];

export interface ProcurementRequest {
  id: string;
  itemDescription: string;
  vendorId?: string;
  quantity: number;
  estimatedCost: number;
  status: ProcurementStatus;
  requestedById: string;
  requestedDate: string;
  archived: boolean;
}

const seedRequests: ProcurementRequest[] = [
  {
    id: "procurement-1",
    itemDescription: "Replacement calibration toolkits (x5)",
    vendorId: "vendor-medparts-supply",
    quantity: 5,
    estimatedCost: 450000,
    status: "Approved",
    requestedById: "daniel-kim",
    requestedDate: "2026-07-10",
    archived: false,
  },
  {
    id: "procurement-2",
    itemDescription: "Ventilator backup battery packs (x10)",
    vendorId: "vendor-medparts-supply",
    quantity: 10,
    estimatedCost: 1200000,
    status: "Submitted",
    requestedById: "abby-huang",
    requestedDate: "2026-07-20",
    archived: false,
  },
  {
    id: "procurement-3",
    itemDescription: "Warehouse shelving units",
    quantity: 8,
    estimatedCost: 320000,
    status: "Draft",
    requestedById: "alexandre-hamilton",
    requestedDate: "2026-07-24",
    archived: false,
  },
];

let state: ProcurementRequest[] = seedRequests;
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

export function useProcurementRequests(): ProcurementRequest[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addProcurementRequest(input: {
  itemDescription: string;
  vendorId?: string;
  quantity: number;
  estimatedCost: number;
  requestedById: string;
  requestedDate: string;
}): ProcurementRequest {
  const request: ProcurementRequest = {
    id: `procurement-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    status: "Draft",
    archived: false,
  };
  state = [request, ...state];
  notify();
  return request;
}

/** CLAUDE.md's Operations action set: "Submit Procurement." */
export function submitProcurementRequest(id: string) {
  state = state.map((r) => (r.id === id && r.status === "Draft" ? { ...r, status: "Submitted" } : r));
  notify();
}

/** CLAUDE.md's Operations action set: "Approve Procurement." */
export function setProcurementStatus(id: string, status: ProcurementStatus) {
  state = state.map((r) => (r.id === id ? { ...r, status } : r));
  notify();
}

export function archiveProcurementRequests(ids: string[]) {
  state = state.map((r) => (ids.includes(r.id) ? { ...r, archived: true } : r));
  notify();
}

export function deleteProcurementRequest(id: string) {
  state = state.filter((r) => r.id !== id);
  notify();
}
