import * as React from "react";

/**
 * Mock Certifications dataset + shared store — Training Center workspace
 * (05 Department Operating Systems/Training/training-operating-system.md:
 * "certification tracker"). Real Employee + Course cross-references.
 * CLAUDE.md's Training action set: "Issue Certificate, Download
 * Certificate." Download genuinely generates and downloads a text file via
 * the Blob API — same pattern as every CSV export in this codebase.
 */
export const CERTIFICATION_STATUSES = ["Active", "Expired"] as const;
export type CertificationStatus = (typeof CERTIFICATION_STATUSES)[number];

export interface Certification {
  id: string;
  employeeId: string;
  courseId: string;
  certificateNumber: string;
  issuedDate: string;
  expiryDate?: string;
  status: CertificationStatus;
  archived: boolean;
}

const seedCertifications: Certification[] = [
  {
    id: "cert-1",
    employeeId: "abby-huang",
    courseId: "course-biomedical-safety",
    certificateNumber: "CERT-2026-0001",
    issuedDate: "2026-06-08",
    expiryDate: "2027-06-08",
    status: "Active",
    archived: false,
  },
  {
    id: "cert-2",
    employeeId: "priya-shah",
    courseId: "course-people-management",
    certificateNumber: "CERT-2026-0002",
    issuedDate: "2026-05-01",
    status: "Active",
    archived: false,
  },
  {
    id: "cert-3",
    employeeId: "daniel-kim",
    courseId: "course-biomedical-safety",
    certificateNumber: "CERT-2025-0014",
    issuedDate: "2025-06-01",
    expiryDate: "2026-06-01",
    status: "Expired",
    archived: false,
  },
];

let state: Certification[] = seedCertifications;
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

export function useCertifications(): Certification[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** CLAUDE.md's Training action set: "Issue Certificate." */
export function issueCertificate(input: { employeeId: string; courseId: string; expiryDate?: string }): Certification {
  const certificateNumber = `CERT-${new Date().getFullYear()}-${String(state.length + 1).padStart(4, "0")}`;
  const certification: Certification = {
    id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    courseId: input.courseId,
    certificateNumber,
    issuedDate: new Date().toISOString().slice(0, 10),
    expiryDate: input.expiryDate,
    status: "Active",
    archived: false,
  };
  state = [certification, ...state];
  notify();
  return certification;
}

export function revokeCertificate(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, status: "Expired" as CertificationStatus } : c));
  notify();
}

export function archiveCertifications(ids: string[]) {
  state = state.map((c) => (ids.includes(c.id) ? { ...c, archived: true } : c));
  notify();
}

export function restoreCertification(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, archived: false } : c));
  notify();
}

export function deleteCertification(id: string) {
  state = state.filter((c) => c.id !== id);
  notify();
}
