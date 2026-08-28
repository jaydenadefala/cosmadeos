import * as React from "react";

/**
 * Mock Companies dataset + shared store for the Sales workspace
 * (05 Department Operating Systems/Sales/sales-operating-system.md). Same
 * `useSyncExternalStore` pattern as the other mock stores. These are the
 * same hospitals already named in leads.ts — Lead.companyId references
 * these records rather than duplicating the name as free text (the same
 * referential pattern as Applicant.jobListingId).
 *
 * Lifecycle (CLAUDE.md "Functionality-First Implementation Rules" — every
 * entity supports its full CRUD lifecycle): Duplicate, Archive/Restore
 * (soft delete), permanent Delete, and Merge (two records into one,
 * reassigning related Contacts/Leads before the loser is removed —
 * orchestrated by the caller, since this store doesn't import the
 * contacts/leads stores directly).
 */
export type CompanyStatus = "Customer" | "Prospect" | "Lost";

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  phone: string;
  status: CompanyStatus;
  archived: boolean;
}

const seedCompanies: Company[] = [
  {
    id: "company-lagos-general",
    name: "Lagos General Hospital",
    industry: "Hospital",
    location: "Lagos, Nigeria",
    website: "lagosgeneral.example",
    phone: "+234 1 555 0101",
    status: "Prospect",
    archived: false,
  },
  {
    id: "company-ikeja-medical",
    name: "Ikeja Medical Center",
    industry: "Hospital",
    location: "Lagos, Nigeria",
    website: "ikejamedical.example",
    phone: "+234 1 555 0102",
    status: "Prospect",
    archived: false,
  },
  {
    id: "company-vi-clinic",
    name: "Victoria Island Clinic",
    industry: "Clinic",
    location: "Lagos, Nigeria",
    website: "viclinic.example",
    phone: "+234 1 555 0103",
    status: "Prospect",
    archived: false,
  },
  {
    id: "company-abuja-specialist",
    name: "Abuja Specialist Hospital",
    industry: "Hospital",
    location: "Abuja, Nigeria",
    website: "abujaspecialist.example",
    phone: "+234 9 555 0104",
    status: "Prospect",
    archived: false,
  },
  {
    id: "company-ph-regional",
    name: "Port Harcourt Regional",
    industry: "Hospital",
    location: "Port Harcourt, Nigeria",
    website: "phregional.example",
    phone: "+234 84 555 0105",
    status: "Prospect",
    archived: false,
  },
  {
    id: "company-kano-teaching",
    name: "Kano Teaching Hospital",
    industry: "Hospital",
    location: "Kano, Nigeria",
    website: "kanoteaching.example",
    phone: "+234 64 555 0106",
    status: "Customer",
    archived: false,
  },
  {
    id: "company-enugu-diagnostics",
    name: "Enugu Diagnostics",
    industry: "Diagnostics Center",
    location: "Enugu, Nigeria",
    website: "enugudiagnostics.example",
    phone: "+234 42 555 0107",
    status: "Lost",
    archived: false,
  },
];

let state: Company[] = seedCompanies;
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

export function useCompanies(): Company[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getCompanyById(id: string): Company | undefined {
  return state.find((c) => c.id === id);
}

export function setCompanyStatus(id: string, status: CompanyStatus) {
  state = state.map((c) => (c.id === id ? { ...c, status } : c));
  notify();
}

/** Used by the Companies list page's CSV Import — a real creation flow, not a decorative button. */
export function addCompany(input: {
  name: string;
  industry: string;
  location: string;
  website?: string;
  phone?: string;
}): Company {
  const company: Company = {
    id: `company-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    name: input.name,
    industry: input.industry,
    location: input.location,
    website: input.website ?? "",
    phone: input.phone ?? "",
    status: "Prospect",
    archived: false,
  };
  state = [company, ...state];
  notify();
  return company;
}

export function updateCompany(id: string, updates: Partial<Omit<Company, "id" | "archived">>) {
  state = state.map((c) => (c.id === id ? { ...c, ...updates } : c));
  notify();
}

export function duplicateCompany(id: string): Company | undefined {
  const source = state.find((c) => c.id === id);
  if (!source) return undefined;
  const copy: Company = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name} (Copy)`,
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveCompanies(ids: string[]) {
  state = state.map((c) => (ids.includes(c.id) ? { ...c, archived: true } : c));
  notify();
}

export function restoreCompany(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, archived: false } : c));
  notify();
}

export function deleteCompanies(ids: string[]) {
  state = state.filter((c) => !ids.includes(c.id));
  notify();
}

/** Removes the loser record after the caller has reassigned its related Contacts/Leads to `survivorId`. */
export function removeMergedCompany(loserId: string) {
  state = state.filter((c) => c.id !== loserId);
  notify();
}
