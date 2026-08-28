import * as React from "react";

/**
 * Mock Interviews dataset + shared store — Recruitment sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md). Real
 * cross-references to Applicants and Employees (interviewer), same
 * referential-integrity pattern as applicants.ts/job-listings.ts.
 */
export const INTERVIEW_TYPES = ["Phone Screen", "Technical", "Panel", "Final"] as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const INTERVIEW_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const INTERVIEW_OUTCOMES = ["Pending", "Advance", "Reject"] as const;
export type InterviewOutcome = (typeof INTERVIEW_OUTCOMES)[number];

export interface Interview {
  id: string;
  applicantId: string;
  interviewerId: string;
  type: InterviewType;
  scheduledDate: string;
  status: InterviewStatus;
  outcome: InterviewOutcome;
  notes: string;
  archived: boolean;
}

const seedInterviews: Interview[] = [
  {
    id: "interview-1",
    applicantId: "applicant-1",
    interviewerId: "priya-shah",
    type: "Phone Screen",
    scheduledDate: "2026-07-10",
    status: "Completed",
    outcome: "Advance",
    notes: "Strong communication, relevant field-service background. Move to technical round.",
    archived: false,
  },
  {
    id: "interview-2",
    applicantId: "applicant-1",
    interviewerId: "jayden-adefala",
    type: "Technical",
    scheduledDate: "2026-07-24",
    status: "Scheduled",
    outcome: "Pending",
    notes: "",
    archived: false,
  },
  {
    id: "interview-3",
    applicantId: "applicant-2",
    interviewerId: "priya-shah",
    type: "Phone Screen",
    scheduledDate: "2026-07-18",
    status: "Completed",
    outcome: "Reject",
    notes: "Salary expectations well above budget for this role.",
    archived: false,
  },
];

let state: Interview[] = seedInterviews;
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

export function useInterviews(): Interview[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addInterview(input: {
  applicantId: string;
  interviewerId: string;
  type: InterviewType;
  scheduledDate: string;
}): Interview {
  const interview: Interview = {
    id: `interview-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    applicantId: input.applicantId,
    interviewerId: input.interviewerId,
    type: input.type,
    scheduledDate: input.scheduledDate,
    status: "Scheduled",
    outcome: "Pending",
    notes: "",
    archived: false,
  };
  state = [interview, ...state];
  notify();
  return interview;
}

export function updateInterview(
  id: string,
  updates: Partial<Pick<Interview, "type" | "scheduledDate" | "interviewerId">>,
) {
  state = state.map((i) => (i.id === id ? { ...i, ...updates } : i));
  notify();
}

export function recordOutcome(id: string, outcome: InterviewOutcome, notes: string) {
  state = state.map((i) =>
    i.id === id ? { ...i, status: "Completed", outcome, notes } : i,
  );
  notify();
}

export function cancelInterview(id: string) {
  state = state.map((i) => (i.id === id ? { ...i, status: "Cancelled" } : i));
  notify();
}

export function archiveInterviews(ids: string[]) {
  state = state.map((i) => (ids.includes(i.id) ? { ...i, archived: true } : i));
  notify();
}

export function deleteInterview(id: string) {
  state = state.filter((i) => i.id !== id);
  notify();
}
