import * as React from "react";

/**
 * Mock Applicants dataset + shared store for the Recruitment sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md). Same
 * `useSyncExternalStore` pattern as employees.ts — a real shared store, not
 * per-page state, so the Kanban board's drag-and-drop is honestly reflected
 * everywhere it's read. No real backend yet (Volume 2 unauthored).
 */
export const APPLICANT_STAGES = [
  { id: "new", label: "New" },
  { id: "screening", label: "Screening" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
] as const;

export type ApplicantStage = (typeof APPLICANT_STAGES)[number]["id"];

export interface Applicant {
  id: string;
  name: string;
  email: string;
  initials: string;
  jobListingId: string;
  stage: ApplicantStage;
  appliedLabel: string;
  archived: boolean;
  /** Set once Hire links this applicant to the real Employee record it created. */
  employeeId?: string;
}

const seedApplicants: Applicant[] = [
  {
    id: "applicant-1",
    name: "Morgan Ellis",
    email: "morgan.ellis@example.com",
    initials: "ME",
    jobListingId: "job-fse",
    stage: "new",
    appliedLabel: "2 days ago",
    archived: false,
  },
  {
    id: "applicant-2",
    name: "Casey Nguyen",
    email: "casey.nguyen@example.com",
    initials: "CN",
    jobListingId: "job-ae",
    stage: "new",
    appliedLabel: "1 day ago",
    archived: false,
  },
  {
    id: "applicant-3",
    name: "Riley Thompson",
    email: "riley.thompson@example.com",
    initials: "RT",
    jobListingId: "job-bt",
    stage: "screening",
    appliedLabel: "5 days ago",
    archived: false,
  },
  {
    id: "applicant-4",
    name: "Jordan Patel",
    email: "jordan.patel@example.com",
    initials: "JP",
    jobListingId: "job-fm",
    stage: "screening",
    appliedLabel: "6 days ago",
    archived: false,
  },
  {
    id: "applicant-5",
    name: "Avery Cruz",
    email: "avery.cruz@example.com",
    initials: "AC",
    jobListingId: "job-fse",
    stage: "interview",
    appliedLabel: "9 days ago",
    archived: false,
  },
  {
    id: "applicant-6",
    name: "Drew Bennett",
    email: "drew.bennett@example.com",
    initials: "DB",
    jobListingId: "job-ae",
    stage: "offer",
    appliedLabel: "2 weeks ago",
    archived: false,
  },
  {
    id: "applicant-7",
    name: "Sasha Kim",
    email: "sasha.kim@example.com",
    initials: "SK",
    jobListingId: "job-lc",
    stage: "rejected",
    appliedLabel: "3 weeks ago",
    archived: false,
  },
];

let state: Applicant[] = seedApplicants;
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

export function moveApplicant(id: string, stage: ApplicantStage) {
  state = state.map((a) => (a.id === id ? { ...a, stage } : a));
  notify();
}

export function useApplicants(): Applicant[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getApplicantById(id: string): Applicant | undefined {
  return state.find((a) => a.id === id);
}

export function updateApplicant(
  id: string,
  updates: Partial<Pick<Applicant, "name" | "email" | "jobListingId">>,
) {
  state = state.map((a) => (a.id === id ? { ...a, ...updates } : a));
  notify();
}

export function duplicateApplicant(id: string): Applicant | undefined {
  const source = state.find((a) => a.id === id);
  if (!source) return undefined;
  const copy: Applicant = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name} (Copy)`,
    archived: false,
    employeeId: undefined,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveApplicants(ids: string[]) {
  state = state.map((a) => (ids.includes(a.id) ? { ...a, archived: true } : a));
  notify();
}

export function restoreApplicant(id: string) {
  state = state.map((a) => (a.id === id ? { ...a, archived: false } : a));
  notify();
}

export function deleteApplicant(id: string) {
  state = state.filter((a) => a.id !== id);
  notify();
}

/** Links this applicant to the real Employee record Hire created, and marks the stage Hired. */
export function markHired(id: string, employeeId: string) {
  state = state.map((a) => (a.id === id ? { ...a, stage: "hired", employeeId } : a));
  notify();
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

/**
 * Genuine public application intake — called from the unauthenticated
 * /careers page (src/app/careers/page.tsx, outside the (app) auth group).
 * Creates a real Applicant in the "New" stage against the shared store, the
 * same one the internal Applicants board reads — a public application
 * actually shows up in the pipeline, not a decorative form submission.
 */
export function submitApplication(jobListingId: string, name: string, email: string): Applicant {
  const applicant: Applicant = {
    id: `applicant-public-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    initials: initialsFromName(name),
    jobListingId,
    stage: "new",
    appliedLabel: "Just now",
    archived: false,
  };
  state = [applicant, ...state];
  notify();
  return applicant;
}
