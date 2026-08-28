import * as React from "react";

/**
 * Mock Handbook + Policies dataset + shared store — Policies sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md: "Policies ←
 * Employee Handbook, Policies, Documents"). One shared store distinguished
 * by `docType` ("Handbook" | "Policy") — /hr/handbook and /hr/policies each
 * filter to their own type, mirroring the proven Playbooks/Knowledge
 * versioned-content pattern (`updatePolicyDocument` pushes the prior
 * content onto `versionHistory` before applying an edit).
 */
export type PolicyDocType = "Handbook" | "Policy";

export interface PolicyDocumentVersion {
  title: string;
  content: string;
  savedLabel: string;
}

export interface PolicyDocument {
  id: string;
  docType: PolicyDocType;
  title: string;
  summary: string;
  content: string;
  lastUpdatedLabel: string;
  versionHistory: PolicyDocumentVersion[];
  archived: boolean;
}

const seedDocuments: PolicyDocument[] = [
  {
    id: "policy-handbook-main",
    docType: "Handbook",
    title: "Employee Handbook",
    summary: "The complete guide to working at Cosmade Medical — culture, expectations, and day-to-day basics.",
    content:
      "Welcome to Cosmade Medical. This handbook covers working hours, communication norms, code of conduct, and what to expect in your first 90 days. Field staff should also review the Vehicle & Equipment Safety Policy before their first site visit.",
    lastUpdatedLabel: "2 months ago",
    versionHistory: [],
    archived: false,
  },
  {
    id: "policy-remote-work",
    docType: "Policy",
    title: "Remote Work Policy",
    summary: "Who can work remotely, core hours, and equipment provisioning for remote roles.",
    content:
      "Sales and Marketing roles may work remotely with manager approval. Core collaboration hours are 10am–3pm WAT. Cosmade provides a laptop and data stipend for approved remote employees.",
    lastUpdatedLabel: "3 months ago",
    versionHistory: [],
    archived: false,
  },
  {
    id: "policy-leave",
    docType: "Policy",
    title: "Leave & Time Off Policy",
    summary: "Annual leave entitlement, sick leave, and the request/approval process.",
    content:
      "Full-time employees accrue 20 days of annual leave per year, plus statutory public holidays. Sick leave requires no advance notice for absences under 3 days. Requests go through your direct manager for approval.",
    lastUpdatedLabel: "5 months ago",
    versionHistory: [],
    archived: false,
  },
  {
    id: "policy-vehicle-safety",
    docType: "Policy",
    title: "Vehicle & Equipment Safety Policy",
    summary: "Safety requirements for field service engineers transporting and installing medical equipment.",
    content:
      "Field staff must complete the annual safety certification before operating company vehicles. Equipment must be secured per the transport checklist. Report any incident to your manager within 24 hours.",
    lastUpdatedLabel: "1 month ago",
    versionHistory: [],
    archived: false,
  },
  {
    id: "policy-code-of-conduct",
    docType: "Handbook",
    title: "Code of Conduct",
    summary: "Expected professional behavior, conflict of interest, and anti-harassment policy.",
    content:
      "Every employee is expected to treat colleagues and customers with respect. Conflicts of interest must be disclosed to HR. Cosmade has zero tolerance for harassment or discrimination of any kind.",
    lastUpdatedLabel: "4 months ago",
    versionHistory: [],
    archived: false,
  },
];

let state: PolicyDocument[] = seedDocuments;
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

export function usePolicyDocuments(): PolicyDocument[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addPolicyDocument(input: {
  docType: PolicyDocType;
  title: string;
  summary: string;
  content: string;
}): PolicyDocument {
  const doc: PolicyDocument = {
    id: `policy-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    docType: input.docType,
    title: input.title,
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

export function updatePolicyDocument(
  id: string,
  updates: Partial<Pick<PolicyDocument, "title" | "summary" | "content">>,
) {
  state = state.map((d) => {
    if (d.id !== id) return d;
    const previousVersion: PolicyDocumentVersion = {
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

export function duplicatePolicyDocument(id: string): PolicyDocument | undefined {
  const source = state.find((d) => d.id === id);
  if (!source) return undefined;
  const copy: PolicyDocument = {
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

export function archivePolicyDocuments(ids: string[]) {
  state = state.map((d) => (ids.includes(d.id) ? { ...d, archived: true } : d));
  notify();
}

export function restorePolicyDocument(id: string) {
  state = state.map((d) => (d.id === id ? { ...d, archived: false } : d));
  notify();
}

export function deletePolicyDocument(id: string) {
  state = state.filter((d) => d.id !== id);
  notify();
}
