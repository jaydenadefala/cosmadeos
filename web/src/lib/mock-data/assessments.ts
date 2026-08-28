import * as React from "react";

/**
 * Mock Assessments dataset + shared store — Training Center workspace
 * (05 Department Operating Systems/Training/training-operating-system.md:
 * "assessment engine"). Each Assessment belongs to a real Course; each
 * Attempt belongs to a real Employee. CLAUDE.md's Training action set:
 * "Create Quiz, Review Assessment, Retake Assessment."
 */
export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Assessment {
  id: string;
  title: string;
  courseId: string;
  passingScorePercent: number;
  questions: AssessmentQuestion[];
  archived: boolean;
}

export type AttemptResult = "Passed" | "Failed";

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  employeeId: string;
  scorePercent: number;
  result: AttemptResult;
  attemptDate: string;
}

const seedAssessments: Assessment[] = [
  {
    id: "assessment-biomedical-safety",
    title: "Biomedical Equipment Safety Compliance — Final Quiz",
    courseId: "course-biomedical-safety",
    passingScorePercent: 80,
    questions: [
      {
        question: "What is the first step before servicing any powered biomedical equipment?",
        options: ["Isolate power via lockout/tagout", "Note the serial number", "Call the customer", "Check the warranty"],
        correctIndex: 0,
      },
      {
        question: "Within how many hours must a safety incident be reported to your manager?",
        options: ["72 hours", "1 week", "24 hours", "No deadline"],
        correctIndex: 2,
      },
    ],
    archived: false,
  },
  {
    id: "assessment-nafdac-refresher",
    title: "NAFDAC Compliance Refresher — Knowledge Check",
    courseId: "course-nafdac-refresher",
    passingScorePercent: 70,
    questions: [
      {
        question: "What document proves NAFDAC registration for a tender submission?",
        options: ["Invoice", "Certificate of Conformance", "Warranty card", "Shipping manifest"],
        correctIndex: 1,
      },
    ],
    archived: false,
  },
];

const seedAttempts: AssessmentAttempt[] = [
  {
    id: "attempt-1",
    assessmentId: "assessment-biomedical-safety",
    employeeId: "abby-huang",
    scorePercent: 100,
    result: "Passed",
    attemptDate: "2026-06-08",
  },
  {
    id: "attempt-2",
    assessmentId: "assessment-nafdac-refresher",
    employeeId: "sam-okafor",
    scorePercent: 50,
    result: "Failed",
    attemptDate: "2026-07-18",
  },
];

let assessmentState: Assessment[] = seedAssessments;
let attemptState: AssessmentAttempt[] = seedAttempts;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAssessments(): Assessment[] {
  return React.useSyncExternalStore(subscribe, () => assessmentState, () => assessmentState);
}

export function useAssessmentAttempts(): AssessmentAttempt[] {
  return React.useSyncExternalStore(subscribe, () => attemptState, () => attemptState);
}

/** CLAUDE.md's Training action set: "Create Quiz." */
export function addAssessment(input: {
  title: string;
  courseId: string;
  passingScorePercent: number;
  questions: AssessmentQuestion[];
}): Assessment {
  const assessment: Assessment = {
    id: `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    courseId: input.courseId,
    passingScorePercent: input.passingScorePercent,
    questions: input.questions,
    archived: false,
  };
  assessmentState = [assessment, ...assessmentState];
  notify();
  return assessment;
}

export function addQuestion(assessmentId: string, question: AssessmentQuestion) {
  assessmentState = assessmentState.map((a) => (a.id === assessmentId ? { ...a, questions: [...a.questions, question] } : a));
  notify();
}

export function archiveAssessments(ids: string[]) {
  assessmentState = assessmentState.map((a) => (ids.includes(a.id) ? { ...a, archived: true } : a));
  notify();
}

export function deleteAssessment(id: string) {
  assessmentState = assessmentState.filter((a) => a.id !== id);
  notify();
}

/**
 * CLAUDE.md's Training action set: "Review Assessment, Retake Assessment."
 * Recording an attempt (initial or retake) is the same operation — a fresh
 * AssessmentAttempt row, so the full history stays visible for review.
 */
export function recordAttempt(input: { assessmentId: string; employeeId: string; scorePercent: number }): AssessmentAttempt {
  const assessment = assessmentState.find((a) => a.id === input.assessmentId);
  const passed = assessment ? input.scorePercent >= assessment.passingScorePercent : input.scorePercent >= 70;
  const attempt: AssessmentAttempt = {
    id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    assessmentId: input.assessmentId,
    employeeId: input.employeeId,
    scorePercent: input.scorePercent,
    result: passed ? "Passed" : "Failed",
    attemptDate: new Date().toISOString().slice(0, 10),
  };
  attemptState = [attempt, ...attemptState];
  notify();
  return attempt;
}
