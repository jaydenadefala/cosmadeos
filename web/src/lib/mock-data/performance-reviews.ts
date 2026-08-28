import * as React from "react";

/**
 * Mock Performance Reviews dataset + shared store — Performance sidebar
 * group (05 Department Operating Systems/HR/hr-operating-system.md).
 * Real Employee cross-references (`employeeId`, `reviewerId`).
 */
export const REVIEW_STATUSES = ["Draft", "In Progress", "Completed"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  cycle: string;
  status: ReviewStatus;
  rating?: number;
  summary: string;
  archived: boolean;
}

const seedReviews: PerformanceReview[] = [
  {
    id: "review-1",
    employeeId: "abby-huang",
    reviewerId: "priya-shah",
    cycle: "H1 2026",
    status: "Completed",
    rating: 4,
    summary: "Consistently exceeds SLA targets on field service calls. Ready for a senior technician track.",
    archived: false,
  },
  {
    id: "review-2",
    employeeId: "sam-okafor",
    reviewerId: "priya-shah",
    cycle: "H1 2026",
    status: "Completed",
    rating: 5,
    summary: "Top performer this cycle — closed the Lagos General deal and mentored two new SDRs.",
    archived: false,
  },
  {
    id: "review-3",
    employeeId: "maria-santos",
    reviewerId: "jayden-adefala",
    cycle: "H2 2026",
    status: "In Progress",
    summary: "",
    archived: false,
  },
  {
    id: "review-4",
    employeeId: "daniel-kim",
    reviewerId: "priya-shah",
    cycle: "H2 2026",
    status: "Draft",
    summary: "",
    archived: false,
  },
];

let state: PerformanceReview[] = seedReviews;
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

export function usePerformanceReviews(): PerformanceReview[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function startReviewCycle(input: {
  employeeId: string;
  reviewerId: string;
  cycle: string;
}): PerformanceReview {
  const review: PerformanceReview = {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    reviewerId: input.reviewerId,
    cycle: input.cycle,
    status: "Draft",
    summary: "",
    archived: false,
  };
  state = [review, ...state];
  notify();
  return review;
}

export function submitReview(id: string, rating: number, summary: string) {
  state = state.map((r) => (r.id === id ? { ...r, status: "Completed", rating, summary } : r));
  notify();
}

export function setReviewStatus(id: string, status: ReviewStatus) {
  state = state.map((r) => (r.id === id ? { ...r, status } : r));
  notify();
}

export function archiveReviews(ids: string[]) {
  state = state.map((r) => (ids.includes(r.id) ? { ...r, archived: true } : r));
  notify();
}

export function deleteReview(id: string) {
  state = state.filter((r) => r.id !== id);
  notify();
}
