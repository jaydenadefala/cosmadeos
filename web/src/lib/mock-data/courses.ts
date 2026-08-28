import * as React from "react";

/**
 * Mock Courses dataset + shared store — Training Center workspace
 * (05 Department Operating Systems/Training/training-operating-system.md:
 * "Course catalog / learning-path builder as the primary table/board
 * surface"). Titles deliberately match the free-text `courseName` values
 * that already existed in HR's `training-assignments.ts` before this
 * workspace existed — that store is migrated to a real `courseId`
 * cross-reference here (see training-assignments.ts), the same retrofit
 * pattern used for Bills → Vendors. `instructorId` references a real
 * Employee.
 */
export const COURSE_CATEGORIES = ["Compliance", "Technical", "Onboarding", "Leadership", "Customer Service"] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_STATUSES = ["Draft", "Published", "Archived"] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export interface CourseLesson {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  description: string;
  level: CourseLevel;
  instructorId?: string;
  status: CourseStatus;
  lessons: CourseLesson[];
  archived: boolean;
}

const seedCourses: Course[] = [
  {
    id: "course-biomedical-safety",
    title: "Biomedical Equipment Safety Compliance",
    category: "Compliance",
    description: "Mandatory safety certification for anyone handling or servicing biomedical equipment.",
    level: "Beginner",
    instructorId: "priya-shah",
    status: "Published",
    lessons: [
      { id: "lesson-1", title: "Electrical Safety Fundamentals", summary: "Grounding, isolation, and lockout/tagout basics.", durationMinutes: 25 },
      { id: "lesson-2", title: "Biohazard Handling", summary: "Contamination risks and disposal procedures for field visits.", durationMinutes: 20 },
      { id: "lesson-3", title: "Incident Reporting", summary: "When and how to log a safety incident in Compliance.", durationMinutes: 15 },
    ],
    archived: false,
  },
  {
    id: "course-ventilator-diagnostics",
    title: "Advanced Ventilator Diagnostics",
    category: "Technical",
    description: "Deep-dive technical training on diagnosing and repairing ventilator faults in the field.",
    level: "Advanced",
    instructorId: "daniel-kim",
    status: "Published",
    lessons: [
      { id: "lesson-1", title: "X200 Diagnostic Panel Walkthrough", summary: "Reading and interpreting the built-in diagnostic codes.", durationMinutes: 40 },
      { id: "lesson-2", title: "Battery & Power System Faults", summary: "Common failure modes and field-repairable fixes.", durationMinutes: 35 },
      { id: "lesson-3", title: "Calibration Procedure", summary: "Step-by-step biannual calibration walkthrough.", durationMinutes: 30 },
    ],
    archived: false,
  },
  {
    id: "course-new-hire-orientation",
    title: "New Hire Orientation",
    category: "Onboarding",
    description: "Everything a new employee needs in their first week at Cosmade Medical.",
    level: "Beginner",
    instructorId: "priya-shah",
    status: "Published",
    lessons: [
      { id: "lesson-1", title: "Welcome & Company Overview", summary: "Mission, structure, and how departments work together.", durationMinutes: 15 },
      { id: "lesson-2", title: "Systems & Tools Walkthrough", summary: "Getting set up in Cosmade OS and core tools.", durationMinutes: 20 },
    ],
    archived: false,
  },
  {
    id: "course-nafdac-refresher",
    title: "NAFDAC Regulatory Compliance Refresher",
    category: "Compliance",
    description: "Annual refresher on NAFDAC registration requirements for medical device sales and service.",
    level: "Intermediate",
    instructorId: "jayden-adefala",
    status: "Published",
    lessons: [
      { id: "lesson-1", title: "What Changed This Year", summary: "Recent NAFDAC regulatory updates relevant to our product lines.", durationMinutes: 20 },
      { id: "lesson-2", title: "Documentation Requirements", summary: "Certificates of Conformance and tender documentation.", durationMinutes: 15 },
    ],
    archived: false,
  },
  {
    id: "course-people-management",
    title: "People Management Fundamentals",
    category: "Leadership",
    description: "Core management skills for first-time people managers.",
    level: "Intermediate",
    instructorId: "priya-shah",
    status: "Published",
    lessons: [
      { id: "lesson-1", title: "Giving Effective Feedback", summary: "Structuring feedback conversations that actually land.", durationMinutes: 25 },
      { id: "lesson-2", title: "Running One-on-Ones", summary: "Making recurring 1:1s useful instead of a status update.", durationMinutes: 20 },
    ],
    archived: false,
  },
  {
    id: "course-customer-service-excellence",
    title: "Customer Service Excellence for Field Engineers",
    category: "Customer Service",
    description: "How field service engineers represent Cosmade during on-site visits.",
    level: "Beginner",
    instructorId: "alexandre-hamilton",
    status: "Draft",
    lessons: [
      { id: "lesson-1", title: "First Impressions on Site", summary: "Setting expectations and communicating delays.", durationMinutes: 15 },
    ],
    archived: false,
  },
];

let state: Course[] = seedCourses;
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

export function useCourses(): Course[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** CLAUDE.md's Training action set: "Create Course." */
export function addCourse(input: {
  title: string;
  category: CourseCategory;
  description: string;
  level: CourseLevel;
  instructorId?: string;
}): Course {
  const course: Course = {
    id: `course-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    category: input.category,
    description: input.description,
    level: input.level,
    instructorId: input.instructorId,
    status: "Draft",
    lessons: [],
    archived: false,
  };
  state = [course, ...state];
  notify();
  return course;
}

export function updateCourse(
  id: string,
  updates: Partial<Pick<Course, "title" | "category" | "description" | "level" | "instructorId">>,
) {
  state = state.map((c) => (c.id === id ? { ...c, ...updates } : c));
  notify();
}

/** CLAUDE.md's Training action set: "Upload Lesson." */
export function addLesson(courseId: string, lesson: { title: string; summary: string; durationMinutes: number }) {
  state = state.map((c) =>
    c.id === courseId
      ? {
          ...c,
          lessons: [
            ...c.lessons,
            { id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...lesson },
          ],
        }
      : c,
  );
  notify();
}

export function removeLesson(courseId: string, lessonId: string) {
  state = state.map((c) => (c.id === courseId ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) } : c));
  notify();
}

export function setCourseStatus(id: string, status: CourseStatus) {
  state = state.map((c) => (c.id === id ? { ...c, status } : c));
  notify();
}

export function duplicateCourse(id: string): Course | undefined {
  const source = state.find((c) => c.id === id);
  if (!source) return undefined;
  const copy: Course = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    title: `${source.title} (Copy)`,
    status: "Draft",
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveCourses(ids: string[]) {
  state = state.map((c) => (ids.includes(c.id) ? { ...c, archived: true, status: "Archived" as CourseStatus } : c));
  notify();
}

export function restoreCourse(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, archived: false, status: "Draft" as CourseStatus } : c));
  notify();
}

export function deleteCourse(id: string) {
  state = state.filter((c) => c.id !== id);
  notify();
}
