/**
 * Mock Contacts dataset + shared store for the Sales workspace
 * (05 Department Operating Systems/Sales/sales-operating-system.md). Same
 * `useSyncExternalStore` pattern as employees.ts/leads.ts/companies.ts.
 * `companyId` references a real Company id (the fourth use of the
 * referential-integrity pattern, after Applicant.jobListingId,
 * Lead.ownerId, Lead.companyId) — a company can have more than one
 * contact, which a Lead (one contact per deal) can't model on its own.
 */
import * as React from "react";

export interface Contact {
  id: string;
  name: string;
  initials: string;
  title: string;
  email: string;
  phone: string;
  companyId: string;
  archived: boolean;
}

const seedContacts: Contact[] = [
  {
    id: "contact-ngozi-adeyemi",
    name: "Ngozi Adeyemi",
    initials: "NA",
    title: "Head of Procurement",
    email: "n.adeyemi@lagosgeneral.example",
    phone: "+234 802 555 0111",
    companyId: "company-lagos-general",
    archived: false,
  },
  {
    id: "contact-david-okonkwo",
    name: "David Okonkwo",
    initials: "DO",
    title: "Chief Medical Officer",
    email: "d.okonkwo@lagosgeneral.example",
    phone: "+234 802 555 0112",
    companyId: "company-lagos-general",
    archived: false,
  },
  {
    id: "contact-tunde-bakare",
    name: "Tunde Bakare",
    initials: "TB",
    title: "Facilities Manager",
    email: "t.bakare@ikejamedical.example",
    phone: "+234 803 555 0113",
    companyId: "company-ikeja-medical",
    archived: false,
  },
  {
    id: "contact-amaka-obi",
    name: "Amaka Obi",
    initials: "AO",
    title: "Clinic Director",
    email: "a.obi@viclinic.example",
    phone: "+234 805 555 0114",
    companyId: "company-vi-clinic",
    archived: false,
  },
  {
    id: "contact-emeka-nwosu",
    name: "Emeka Nwosu",
    initials: "EN",
    title: "Procurement Lead",
    email: "e.nwosu@abujaspecialist.example",
    phone: "+234 809 555 0115",
    companyId: "company-abuja-specialist",
    archived: false,
  },
  {
    id: "contact-folasade-bello",
    name: "Folasade Bello",
    initials: "FB",
    title: "Operations Manager",
    email: "f.bello@phregional.example",
    phone: "+234 884 555 0116",
    companyId: "company-ph-regional",
    archived: false,
  },
  {
    id: "contact-chidi-eze",
    name: "Chidi Eze",
    initials: "CE",
    title: "Chief Medical Officer",
    email: "c.eze@kanoteaching.example",
    phone: "+234 864 555 0117",
    companyId: "company-kano-teaching",
    archived: false,
  },
  {
    id: "contact-hauwa-musa",
    name: "Hauwa Musa",
    initials: "HM",
    title: "Equipment Manager",
    email: "h.musa@kanoteaching.example",
    phone: "+234 864 555 0118",
    companyId: "company-kano-teaching",
    archived: false,
  },
  {
    id: "contact-bisi-adewale",
    name: "Bisi Adewale",
    initials: "BA",
    title: "Lab Director",
    email: "b.adewale@enugudiagnostics.example",
    phone: "+234 842 555 0119",
    companyId: "company-enugu-diagnostics",
    archived: false,
  },
];

let state: Contact[] = seedContacts;
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

export function useContacts(): Contact[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getContactById(id: string): Contact | undefined {
  return state.find((c) => c.id === id);
}

export function getContactsByCompany(companyId: string): Contact[] {
  return state.filter((c) => c.companyId === companyId);
}

function initialsOfName(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Used by Convert Lead: creates a real Contact for a won deal's contact person, if one doesn't already exist at that company. */
export function findOrCreateContact(input: {
  name: string;
  email: string;
  companyId: string;
}): Contact {
  const existing = state.find(
    (c) => c.companyId === input.companyId && c.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (existing) return existing;
  const created: Contact = {
    id: `contact-${input.name.toLowerCase().replace(/[^a-z]+/g, "-")}-${Date.now()}`,
    name: input.name,
    initials: initialsOfName(input.name),
    title: "Contact",
    email: input.email,
    phone: "",
    companyId: input.companyId,
    archived: false,
  };
  state = [created, ...state];
  notify();
  return created;
}

export function deleteContact(id: string) {
  state = state.filter((c) => c.id !== id);
  notify();
}

export function duplicateContact(id: string): Contact | undefined {
  const source = state.find((c) => c.id === id);
  if (!source) return undefined;
  const copy: Contact = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name} (Copy)`,
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveContacts(ids: string[]) {
  state = state.map((c) => (ids.includes(c.id) ? { ...c, archived: true } : c));
  notify();
}

export function restoreContact(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, archived: false } : c));
  notify();
}

/** Used when merging two Company records: moves every contact at `fromCompanyId` onto `toCompanyId`. */
export function reassignContactsCompany(fromCompanyId: string, toCompanyId: string) {
  state = state.map((c) => (c.companyId === fromCompanyId ? { ...c, companyId: toCompanyId } : c));
  notify();
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function updateContact(
  id: string,
  updates: Partial<Omit<Contact, "id" | "initials" | "archived">>,
) {
  state = state.map((c) =>
    c.id === id
      ? { ...c, ...updates, initials: updates.name ? initialsOf(updates.name) : c.initials }
      : c,
  );
  notify();
}
