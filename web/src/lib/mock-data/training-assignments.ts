import * as React from "react";

/**
 * Mock Training dataset + shared store — Learning sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md: "Learning ←
 * Training"). Scoped to HR: which employee is assigned which course and
 * their completion status — distinct from the top-level Training Center
 * workspace's own enrollment tracking (`course-enrollments.ts`), which
 * covers course-catalog progress/certification rather than an HR due-date
 * checklist. `courseId` references a real Course from the Training Center
 * catalog (`courses.ts`) — migrated from a free-text `courseName` the
 * moment that catalog came into existence, the same retrofit pattern used
 * for Bills → Vendors.
 */
export const TRAINING_CATEGORIES = ["Compliance", "Technical", "Onboarding", "Leadership"] as const;
export type TrainingCategory = (typeof TRAINING_CATEGORIES)[number];

export const TRAINING_STATUSES = ["Not Started", "In Progress", "Completed"] as const;
export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

export interface TrainingAssignment {
  id: string;
  employeeId: string;
  courseId: string;
  category: TrainingCategory;
  status: TrainingStatus;
  dueDate: string;
  completedLabel?: string;
  archived: boolean;
}

const seedAssignments: TrainingAssignment[] = [
  {
    id: "training-1",
    employeeId: "abby-huang",
    courseId: "course-biomedical-safety",
    category: "Compliance",
    status: "Completed",
    dueDate: "2026-06-01",
    completedLabel: "3 weeks ago",
    archived: false,
  },
  {
    id: "training-2",
    employeeId: "abby-huang",
    courseId: "course-ventilator-diagnostics",
    category: "Technical",
    status: "In Progress",
    dueDate: "2026-08-15",
    archived: false,
  },
  {
    id: "training-3",
    employeeId: "daniel-kim",
    courseId: "course-new-hire-orientation",
    category: "Onboarding",
    status: "Not Started",
    dueDate: "2026-08-01",
    archived: false,
  },
  {
    id: "training-4",
    employeeId: "sam-okafor",
    courseId: "course-nafdac-refresher",
    category: "Compliance",
    status: "In Progress",
    dueDate: "2026-07-30",
    archived: false,
  },
  {
    id: "training-5",
    employeeId: "priya-shah",
    courseId: "course-people-management",
    category: "Leadership",
    status: "Completed",
    dueDate: "2026-05-01",
    completedLabel: "2 months ago",
    archived: false,
  },
];

let state: TrainingAssignment[] = seedAssignments;
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

export function useTrainingAssignments(): TrainingAssignment[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function assignTraining(input: {
  employeeId: string;
  courseId: string;
  category: TrainingCategory;
  dueDate: string;
}): TrainingAssignment {
  const assignment: TrainingAssignment = {
    id: `training-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    courseId: input.courseId,
    category: input.category,
    status: "Not Started",
    dueDate: input.dueDate,
    archived: false,
  };
  state = [assignment, ...state];
  notify();
  return assignment;
}

export function setTrainingStatus(id: string, status: TrainingStatus) {
  state = state.map((a) =>
    a.id === id
      ? { ...a, status, completedLabel: status === "Completed" ? "Just now" : a.completedLabel }
      : a,
  );
  notify();
}

export function archiveTrainingAssignments(ids: string[]) {
  state = state.map((a) => (ids.includes(a.id) ? { ...a, archived: true } : a));
  notify();
}

export function deleteTrainingAssignment(id: string) {
  state = state.filter((a) => a.id !== id);
  notify();
}
