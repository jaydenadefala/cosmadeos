import * as React from "react";

/**
 * Mock SOPs dataset + shared store — Operations sidebar
 * (05 Department Operating Systems/Operations/operations-operating-system.md:
 * "SOPs (Knowledge-adjacent document library)"). Deliberately a separate
 * store from HR's `policy-documents.ts` (Handbook/Policies) — SOPs are its
 * own named Operations sidebar item, not a Policies subtype, so keeping
 * domain ownership separate avoids awkward cross-department coupling.
 * Mirrors the proven Playbooks/Policy-Documents versioned-content pattern.
 */
export interface SopVersion {
  title: string;
  content: string;
  savedLabel: string;
}

export interface SopDocument {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  lastUpdatedLabel: string;
  versionHistory: SopVersion[];
  archived: boolean;
}

const seedSops: SopDocument[] = [
  {
    id: "sop-equipment-receiving",
    title: "Equipment Receiving & Inspection",
    category: "Inventory",
    summary: "Steps for receiving, inspecting, and logging incoming medical equipment shipments.",
    content:
      "1. Match delivery against the purchase order. 2. Inspect for shipping damage before signing. 3. Log serial numbers into Inventory. 4. Flag any discrepancy to the Vendor within 48 hours. 5. Move approved stock to the designated warehouse zone.",
    lastUpdatedLabel: "1 month ago",
    versionHistory: [],
    archived: false,
  },
  {
    id: "sop-vendor-onboarding",
    title: "Vendor Onboarding Checklist",
    category: "Procurement",
    summary: "Required steps before a new vendor can receive a purchase order.",
    content:
      "1. Collect vendor registration documents and tax ID. 2. Verify references from at least one existing customer. 3. Confirm pricing and payment terms in writing. 4. Add the vendor to the Vendors directory. 5. Route the first purchase order through the standard approval chain.",
    lastUpdatedLabel: "2 months ago",
    versionHistory: [],
    archived: false,
  },
  {
    id: "sop-incident-escalation",
    title: "Field Incident Escalation Procedure",
    category: "Compliance",
    summary: "How to escalate an equipment incident or safety issue discovered in the field.",
    content:
      "1. Ensure patient/staff safety first — take the equipment out of service if needed. 2. Log the incident in Compliance within 24 hours. 3. Notify the Operations Manager for anything safety-related. 4. Root-cause and corrective action are due within 5 business days.",
    lastUpdatedLabel: "3 weeks ago",
    versionHistory: [],
    archived: false,
  },
  {
    id: "sop-monthly-audit",
    title: "Monthly Inventory Audit",
    category: "Inventory",
    summary: "Cycle-count procedure for reconciling physical inventory against system records.",
    content:
      "1. Select a rotating 25% sample of SKUs each month. 2. Physically count and compare to Inventory records. 3. Investigate any variance over 2%. 4. Log the audit result and adjustments. 5. Full physical count occurs annually in January.",
    lastUpdatedLabel: "2 weeks ago",
    versionHistory: [],
    archived: false,
  },
];

let state: SopDocument[] = seedSops;
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

export function useSopDocuments(): SopDocument[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addSopDocument(input: { title: string; category: string; summary: string; content: string }): SopDocument {
  const doc: SopDocument = {
    id: `sop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    category: input.category,
    summary: input.summary,
    content: input.content,
    lastUpdatedLabel: "Just now",
    versionHistory: [],
    archived: false,
  };
  state = [doc, ...state];
  notify();
  return doc;
}

export function updateSopDocument(
  id: string,
  updates: Partial<Pick<SopDocument, "title" | "category" | "summary" | "content">>,
) {
  state = state.map((d) => {
    if (d.id !== id) return d;
    const previousVersion: SopVersion = {
      title: d.title,
      content: d.content,
      savedLabel: d.lastUpdatedLabel,
    };
    return {
      ...d,
      ...updates,
      lastUpdatedLabel: "Just now",
      versionHistory: [previousVersion, ...d.versionHistory],
    };
  });
  notify();
}

export function duplicateSopDocument(id: string): SopDocument | undefined {
  const source = state.find((d) => d.id === id);
  if (!source) return undefined;
  const copy: SopDocument = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    title: `${source.title} (Copy)`,
    versionHistory: [],
    archived: false,
    lastUpdatedLabel: "Just now",
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveSopDocuments(ids: string[]) {
  state = state.map((d) => (ids.includes(d.id) ? { ...d, archived: true } : d));
  notify();
}

export function restoreSopDocument(id: string) {
  state = state.map((d) => (d.id === id ? { ...d, archived: false } : d));
  notify();
}

export function deleteSopDocument(id: string) {
  state = state.filter((d) => d.id !== id);
  notify();
}
