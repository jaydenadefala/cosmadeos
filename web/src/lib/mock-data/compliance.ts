import * as React from "react";

/**
 * Mock Compliance dataset + shared store — Operations sidebar
 * (05 Department Operating Systems/Operations/operations-operating-system.md).
 * Compliance items track regulatory/certification requirements — real
 * status lifecycle (Compliant/Non-Compliant/Under Review), not decorative.
 */
export const COMPLIANCE_CATEGORIES = ["Regulatory", "Safety", "Certification", "Environmental"] as const;
export type ComplianceCategory = (typeof COMPLIANCE_CATEGORIES)[number];

export const COMPLIANCE_STATUSES = ["Compliant", "Non-Compliant", "Under Review"] as const;
export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

export interface ComplianceItem {
  id: string;
  title: string;
  category: ComplianceCategory;
  status: ComplianceStatus;
  dueDate: string;
  notes: string;
  archived: boolean;
}

const seedItems: ComplianceItem[] = [
  {
    id: "compliance-nafdac-registration",
    title: "NAFDAC Device Registration Renewal",
    category: "Regulatory",
    status: "Compliant",
    dueDate: "2027-01-15",
    notes: "Renewed for the X200 ventilator line. Certificate on file with Regulatory Affairs.",
    archived: false,
  },
  {
    id: "compliance-fire-safety",
    title: "Warehouse Fire Safety Inspection",
    category: "Safety",
    status: "Under Review",
    dueDate: "2026-08-30",
    notes: "Annual inspection scheduled — awaiting confirmed date from the fire marshal's office.",
    archived: false,
  },
  {
    id: "compliance-iso-13485",
    title: "ISO 13485 Certification",
    category: "Certification",
    status: "Compliant",
    dueDate: "2027-03-01",
    notes: "Quality management system certification, valid through March 2027.",
    archived: false,
  },
  {
    id: "compliance-waste-disposal",
    title: "Medical Waste Disposal Permit",
    category: "Environmental",
    status: "Non-Compliant",
    dueDate: "2026-07-15",
    notes: "Permit expired — renewal application submitted, awaiting approval. Escalated to Operations Manager.",
    archived: false,
  },
];

let state: ComplianceItem[] = seedItems;
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

export function useComplianceItems(): ComplianceItem[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addComplianceItem(input: {
  title: string;
  category: ComplianceCategory;
  dueDate: string;
  notes: string;
}): ComplianceItem {
  const item: ComplianceItem = {
    id: `compliance-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    category: input.category,
    status: "Under Review",
    dueDate: input.dueDate,
    notes: input.notes,
    archived: false,
  };
  state = [item, ...state];
  notify();
  return item;
}

export function updateComplianceItem(
  id: string,
  updates: Partial<Pick<ComplianceItem, "title" | "category" | "dueDate" | "notes">>,
) {
  state = state.map((i) => (i.id === id ? { ...i, ...updates } : i));
  notify();
}

export function setComplianceStatus(id: string, status: ComplianceStatus) {
  state = state.map((i) => (i.id === id ? { ...i, status } : i));
  notify();
}

export function archiveComplianceItems(ids: string[]) {
  state = state.map((i) => (ids.includes(i.id) ? { ...i, archived: true } : i));
  notify();
}

export function deleteComplianceItem(id: string) {
  state = state.filter((i) => i.id !== id);
  notify();
}
