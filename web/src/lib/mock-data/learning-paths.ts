import * as React from "react";

/**
 * Mock Learning Paths dataset + shared store — Training Center workspace
 * (05 Department Operating Systems/Training/training-operating-system.md:
 * "learning path builder" as a Components entry). Each path is an ordered
 * sequence of real Course ids — a curriculum, not a duplicate content store.
 */
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetDepartment?: string;
  courseIds: string[];
  archived: boolean;
}

const seedPaths: LearningPath[] = [
  {
    id: "path-field-engineer-onboarding",
    title: "Field Engineer Onboarding Path",
    description: "The full ramp-up curriculum for a new field service engineer, from orientation to technical certification.",
    targetDepartment: "Engineering",
    courseIds: ["course-new-hire-orientation", "course-biomedical-safety", "course-ventilator-diagnostics"],
    archived: false,
  },
  {
    id: "path-sales-compliance-readiness",
    title: "Sales Compliance Readiness Path",
    description: "What every sales rep needs before they can quote regulated medical equipment to a hospital.",
    targetDepartment: "Sales",
    courseIds: ["course-new-hire-orientation", "course-nafdac-refresher"],
    archived: false,
  },
  {
    id: "path-new-manager",
    title: "New Manager Path",
    description: "For employees stepping into their first people-management role.",
    targetDepartment: "Human Resources",
    courseIds: ["course-people-management"],
    archived: false,
  },
];

let state: LearningPath[] = seedPaths;
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

export function useLearningPaths(): LearningPath[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addLearningPath(input: {
  title: string;
  description: string;
  targetDepartment?: string;
  courseIds: string[];
}): LearningPath {
  const path: LearningPath = {
    id: `path-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    description: input.description,
    targetDepartment: input.targetDepartment,
    courseIds: input.courseIds,
    archived: false,
  };
  state = [path, ...state];
  notify();
  return path;
}

export function updateLearningPath(
  id: string,
  updates: Partial<Pick<LearningPath, "title" | "description" | "targetDepartment" | "courseIds">>,
) {
  state = state.map((p) => (p.id === id ? { ...p, ...updates } : p));
  notify();
}

export function archiveLearningPaths(ids: string[]) {
  state = state.map((p) => (ids.includes(p.id) ? { ...p, archived: true } : p));
  notify();
}

export function restoreLearningPath(id: string) {
  state = state.map((p) => (p.id === id ? { ...p, archived: false } : p));
  notify();
}

export function deleteLearningPath(id: string) {
  state = state.filter((p) => p.id !== id);
  notify();
}
