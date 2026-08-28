import * as React from "react";

/**
 * Mock Course Enrollments dataset + shared store — Training Center workspace.
 * This is what "Assign Training" and "Track Progress" (CLAUDE.md's Training
 * action set) actually act on: a real Employee enrolled in a real Course,
 * with genuine progress tracking distinct from the course catalog itself.
 */
export const ENROLLMENT_STATUSES = ["Not Started", "In Progress", "Completed"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export interface CourseEnrollment {
  id: string;
  courseId: string;
  employeeId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledDate: string;
  completedLabel?: string;
  archived: boolean;
}

const seedEnrollments: CourseEnrollment[] = [
  {
    id: "enrollment-1",
    courseId: "course-biomedical-safety",
    employeeId: "abby-huang",
    status: "Completed",
    progressPercent: 100,
    enrolledDate: "2026-05-20",
    completedLabel: "3 weeks ago",
    archived: false,
  },
  {
    id: "enrollment-2",
    courseId: "course-ventilator-diagnostics",
    employeeId: "abby-huang",
    status: "In Progress",
    progressPercent: 60,
    enrolledDate: "2026-07-10",
    archived: false,
  },
  {
    id: "enrollment-3",
    courseId: "course-new-hire-orientation",
    employeeId: "daniel-kim",
    status: "Not Started",
    progressPercent: 0,
    enrolledDate: "2026-07-24",
    archived: false,
  },
  {
    id: "enrollment-4",
    courseId: "course-nafdac-refresher",
    employeeId: "sam-okafor",
    status: "In Progress",
    progressPercent: 50,
    enrolledDate: "2026-07-15",
    archived: false,
  },
  {
    id: "enrollment-5",
    courseId: "course-people-management",
    employeeId: "priya-shah",
    status: "Completed",
    progressPercent: 100,
    enrolledDate: "2026-04-20",
    completedLabel: "2 months ago",
    archived: false,
  },
  {
    id: "enrollment-6",
    courseId: "course-biomedical-safety",
    employeeId: "daniel-kim",
    status: "In Progress",
    progressPercent: 33,
    enrolledDate: "2026-07-28",
    archived: false,
  },
];

let state: CourseEnrollment[] = seedEnrollments;
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

export function useCourseEnrollments(): CourseEnrollment[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * CLAUDE.md's Training action set: "Assign Training." Named `enrollInCourse`
 * (not `assignTraining`) to avoid colliding with HR's pre-existing
 * `assignTraining` in `training-assignments.ts` — that store now references
 * a real `courseId` here (see the migration note there), so both actions
 * ultimately point at the same Course catalog.
 */
export function enrollInCourse(input: { courseId: string; employeeId: string }): CourseEnrollment {
  const enrollment: CourseEnrollment = {
    id: `enrollment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    courseId: input.courseId,
    employeeId: input.employeeId,
    status: "Not Started",
    progressPercent: 0,
    enrolledDate: new Date().toISOString().slice(0, 10),
    archived: false,
  };
  state = [enrollment, ...state];
  notify();
  return enrollment;
}

/** CLAUDE.md's Training action set: "Track Progress." */
export function setEnrollmentProgress(id: string, progressPercent: number) {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  state = state.map((e) =>
    e.id === id
      ? {
          ...e,
          progressPercent: clamped,
          status: clamped >= 100 ? "Completed" : clamped > 0 ? "In Progress" : "Not Started",
          completedLabel: clamped >= 100 ? "Just now" : e.completedLabel,
        }
      : e,
  );
  notify();
}

export function archiveEnrollments(ids: string[]) {
  state = state.map((e) => (ids.includes(e.id) ? { ...e, archived: true } : e));
  notify();
}

export function deleteEnrollment(id: string) {
  state = state.filter((e) => e.id !== id);
  notify();
}
