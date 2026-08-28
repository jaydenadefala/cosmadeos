import * as React from "react";

/**
 * Mock Leads dataset + shared store for the Sales workspace
 * (05 Department Operating Systems/Sales/sales-operating-system.md). Same
 * `useSyncExternalStore` pattern as employees.ts/applicants.ts/job-listings.ts/
 * team-documents.ts. `ownerId` references a real Employee id (same
 * referential pattern as Applicant.jobListingId) rather than a free-text
 * owner name. Seed data themed around hospitals — CONTEXT.md documents
 * Cosmade OS's domain as medical equipment sales to hospitals (the "My
 * Lagos Hospitals" saved-view example in the source material).
 */
export const LEAD_STAGES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number]["id"];

export interface Lead {
  id: string;
  contactName: string;
  companyId: string;
  email: string;
  value: number;
  stage: LeadStage;
  ownerId: string;
  lastActivityLabel: string;
  archived: boolean;
  /** Set once Convert Lead links this deal to a real Contact record. */
  contactId?: string;
}

const seedLeads: Lead[] = [
  {
    id: "lead-1",
    contactName: "Ngozi Adeyemi",
    companyId: "company-lagos-general",
    email: "n.adeyemi@lagosgeneral.example",
    value: 42000,
    stage: "new",
    ownerId: "sam-okafor",
    lastActivityLabel: "1 day ago",
    archived: false,
  },
  {
    id: "lead-2",
    contactName: "Tunde Bakare",
    companyId: "company-ikeja-medical",
    email: "t.bakare@ikejamedical.example",
    value: 18500,
    stage: "new",
    ownerId: "sam-okafor",
    lastActivityLabel: "2 days ago",
    archived: false,
  },
  {
    id: "lead-3",
    contactName: "Amaka Obi",
    companyId: "company-vi-clinic",
    email: "a.obi@viclinic.example",
    value: 27500,
    stage: "contacted",
    ownerId: "sam-okafor",
    lastActivityLabel: "3 days ago",
    archived: false,
  },
  {
    id: "lead-4",
    contactName: "Emeka Nwosu",
    companyId: "company-abuja-specialist",
    email: "e.nwosu@abujaspecialist.example",
    value: 65000,
    stage: "qualified",
    ownerId: "jayden-adefala",
    lastActivityLabel: "5 days ago",
    archived: false,
  },
  {
    id: "lead-5",
    contactName: "Folasade Bello",
    companyId: "company-ph-regional",
    email: "f.bello@phregional.example",
    value: 51000,
    stage: "proposal",
    ownerId: "sam-okafor",
    lastActivityLabel: "1 week ago",
    archived: false,
  },
  {
    id: "lead-6",
    contactName: "Chidi Eze",
    companyId: "company-kano-teaching",
    email: "c.eze@kanoteaching.example",
    value: 89000,
    stage: "won",
    ownerId: "jayden-adefala",
    lastActivityLabel: "2 weeks ago",
    archived: false,
  },
  {
    id: "lead-7",
    contactName: "Bisi Adewale",
    companyId: "company-enugu-diagnostics",
    email: "b.adewale@enugudiagnostics.example",
    value: 12000,
    stage: "lost",
    ownerId: "sam-okafor",
    lastActivityLabel: "3 weeks ago",
    archived: false,
  },
];

let state: Lead[] = seedLeads;
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

export function moveLead(id: string, stage: LeadStage) {
  state = state.map((l) => (l.id === id ? { ...l, stage } : l));
  notify();
}

export function useLeads(): Lead[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getLeadById(id: string): Lead | undefined {
  return state.find((l) => l.id === id);
}

export function getLeadsByCompany(companyId: string): Lead[] {
  return state.filter((l) => l.companyId === companyId);
}

/** Used when merging two Company records: moves every lead at `fromCompanyId` onto `toCompanyId`. */
export function reassignLeadsCompany(fromCompanyId: string, toCompanyId: string) {
  state = state.map((l) => (l.companyId === fromCompanyId ? { ...l, companyId: toCompanyId } : l));
  notify();
}

export function updateLead(
  id: string,
  updates: Partial<Omit<Lead, "id" | "archived" | "contactId">>,
) {
  state = state.map((l) => (l.id === id ? { ...l, ...updates } : l));
  notify();
}

export function duplicateLead(id: string): Lead | undefined {
  const source = state.find((l) => l.id === id);
  if (!source) return undefined;
  const copy: Lead = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    archived: false,
    contactId: undefined,
    lastActivityLabel: "Just now",
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveLeads(ids: string[]) {
  state = state.map((l) => (ids.includes(l.id) ? { ...l, archived: true } : l));
  notify();
}

export function restoreLead(id: string) {
  state = state.map((l) => (l.id === id ? { ...l, archived: false } : l));
  notify();
}

export function deleteLead(id: string) {
  state = state.filter((l) => l.id !== id);
  notify();
}

/** Convert Lead: marks the deal Won and links it to a real Contact record (the id is created by the caller, which owns the Contacts store). */
export function convertLead(id: string, contactId: string) {
  state = state.map((l) => (l.id === id ? { ...l, stage: "won", contactId } : l));
  notify();
}
