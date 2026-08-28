import * as React from "react";

/**
 * Mock Job Listings dataset + shared store — Recruitment sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md). Same
 * `useSyncExternalStore` pattern as employees.ts/applicants.ts. Applicants
 * reference these by id (see applicants.ts `jobListingId`) rather than a
 * free-text role string — the same referential pattern already used for
 * Employee.managerName/managerId.
 */
export type JobListingStatus = "Open" | "Closed" | "Draft";
export type EmploymentType = "Full-time" | "Part-time" | "Contract";

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  status: JobListingStatus;
  postedLabel: string;
  description: string;
  archived: boolean;
}

const seedJobListings: JobListing[] = [
  {
    id: "job-fse",
    title: "Field Service Engineer",
    department: "Engineering",
    location: "Lagos, Nigeria",
    employmentType: "Full-time",
    status: "Open",
    postedLabel: "3 weeks ago",
    description:
      "Install, maintain, and repair medical equipment at hospital sites across Lagos. Requires biomedical or electrical engineering background and a valid driver's license for field visits.",
    archived: false,
  },
  {
    id: "job-ae",
    title: "Account Executive",
    department: "Sales",
    location: "Remote",
    employmentType: "Full-time",
    status: "Open",
    postedLabel: "1 month ago",
    description:
      "Own the full sales cycle for hospital and clinic accounts, from first outreach through contract close. Prior medical equipment or healthcare B2B sales experience preferred.",
    archived: false,
  },
  {
    id: "job-bt",
    title: "Biomedical Technician",
    department: "Engineering",
    location: "Lagos, Nigeria",
    employmentType: "Full-time",
    status: "Open",
    postedLabel: "2 weeks ago",
    description:
      "Perform calibration, preventive maintenance, and repair on ventilators and patient monitoring equipment. Certification in biomedical engineering technology required.",
    archived: false,
  },
  {
    id: "job-fm",
    title: "Finance Manager",
    department: "Finance",
    location: "Lagos, Nigeria",
    employmentType: "Full-time",
    status: "Open",
    postedLabel: "5 weeks ago",
    description:
      "Own monthly close, financial reporting, and cash flow forecasting. ACCA/ICAN qualification and 5+ years of finance experience required.",
    archived: false,
  },
  {
    id: "job-lc",
    title: "Logistics Coordinator",
    department: "Operations",
    location: "Lagos, Nigeria",
    employmentType: "Full-time",
    status: "Closed",
    postedLabel: "2 months ago",
    description:
      "Coordinate equipment shipping, customs clearance, and warehouse inventory across our regional distribution network.",
    archived: false,
  },
  {
    id: "job-mc",
    title: "Marketing Coordinator",
    department: "Marketing",
    location: "Remote",
    employmentType: "Part-time",
    status: "Open",
    postedLabel: "2 days ago",
    description:
      "Support campaign execution, content scheduling, and creative asset organization for the Marketing team. Great entry point into B2B healthcare marketing.",
    archived: false,
  },
];

let state: JobListing[] = seedJobListings;
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

export function setJobListingStatus(id: string, status: JobListingStatus) {
  state = state.map((j) => (j.id === id ? { ...j, status } : j));
  notify();
}

export function useJobListings(): JobListing[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getJobListingById(id: string): JobListing | undefined {
  return state.find((j) => j.id === id);
}

export function updateJobListing(
  id: string,
  updates: Partial<Pick<JobListing, "title" | "department" | "location" | "employmentType" | "description">>,
) {
  state = state.map((j) => (j.id === id ? { ...j, ...updates } : j));
  notify();
}

export function duplicateJobListing(id: string): JobListing | undefined {
  const source = state.find((j) => j.id === id);
  if (!source) return undefined;
  const copy: JobListing = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    title: `${source.title} (Copy)`,
    status: "Draft",
    archived: false,
    postedLabel: "Just now",
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveJobListings(ids: string[]) {
  state = state.map((j) => (ids.includes(j.id) ? { ...j, archived: true } : j));
  notify();
}

export function restoreJobListing(id: string) {
  state = state.map((j) => (j.id === id ? { ...j, archived: false } : j));
  notify();
}

export function deleteJobListing(id: string) {
  state = state.filter((j) => j.id !== id);
  notify();
}
