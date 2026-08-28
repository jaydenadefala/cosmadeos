import * as React from "react";

/**
 * Mock Benefits dataset + shared store — Workforce sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md). CLAUDE.md's
 * HR action set names "Assign Benefits" explicitly — modeled here as plans
 * employees enroll in, rather than a per-employee free-text field, so
 * enrollment is a real, queryable relationship (`enrolledEmployeeIds`),
 * consistent with this session's referential-integrity pattern.
 */
export const BENEFIT_CATEGORIES = [
  "Health",
  "Dental",
  "Vision",
  "Retirement",
  "Life Insurance",
] as const;
export type BenefitCategory = (typeof BENEFIT_CATEGORIES)[number];

export interface BenefitPlan {
  id: string;
  name: string;
  category: BenefitCategory;
  provider: string;
  employeeCost: number;
  employerCost: number;
  description: string;
  enrolledEmployeeIds: string[];
  archived: boolean;
}

const seedPlans: BenefitPlan[] = [
  {
    id: "benefit-health-hmo",
    name: "Comprehensive Health HMO",
    category: "Health",
    provider: "Reliance HMO",
    employeeCost: 5000,
    employerCost: 25000,
    description: "Full inpatient and outpatient coverage, including dependents, at partner hospitals nationwide.",
    enrolledEmployeeIds: ["abby-huang", "priya-shah", "sam-okafor", "maria-santos"],
    archived: false,
  },
  {
    id: "benefit-dental",
    name: "Dental Care Plan",
    category: "Dental",
    provider: "Reliance HMO",
    employeeCost: 1500,
    employerCost: 3500,
    description: "Routine cleanings, fillings, and one annual specialist consultation.",
    enrolledEmployeeIds: ["abby-huang", "sam-okafor"],
    archived: false,
  },
  {
    id: "benefit-vision",
    name: "Vision Care Plan",
    category: "Vision",
    provider: "Reliance HMO",
    employeeCost: 1000,
    employerCost: 2000,
    description: "Annual eye exam plus a subsidy toward glasses or contact lenses.",
    enrolledEmployeeIds: ["priya-shah"],
    archived: false,
  },
  {
    id: "benefit-pension",
    name: "Contributory Pension Scheme",
    category: "Retirement",
    provider: "Stanbic IBTC Pension",
    employeeCost: 0,
    employerCost: 0,
    description: "Statutory 8% employee / 10% employer contribution per the Pension Reform Act.",
    enrolledEmployeeIds: ["abby-huang", "priya-shah", "sam-okafor", "jayden-adefala", "maria-santos"],
    archived: false,
  },
  {
    id: "benefit-life-insurance",
    name: "Group Life Insurance",
    category: "Life Insurance",
    provider: "AXA Mansard",
    employeeCost: 0,
    employerCost: 4000,
    description: "Statutory group life cover at 3x annual gross salary, fully employer-funded.",
    enrolledEmployeeIds: ["abby-huang", "priya-shah", "sam-okafor", "jayden-adefala", "maria-santos"],
    archived: false,
  },
];

let state: BenefitPlan[] = seedPlans;
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

export function useBenefitPlans(): BenefitPlan[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addBenefitPlan(input: {
  name: string;
  category: BenefitCategory;
  provider: string;
  employeeCost: number;
  employerCost: number;
  description: string;
}): BenefitPlan {
  const plan: BenefitPlan = {
    id: `benefit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    enrolledEmployeeIds: [],
    archived: false,
  };
  state = [plan, ...state];
  notify();
  return plan;
}

export function updateBenefitPlan(
  id: string,
  updates: Partial<
    Pick<BenefitPlan, "name" | "category" | "provider" | "employeeCost" | "employerCost" | "description">
  >,
) {
  state = state.map((p) => (p.id === id ? { ...p, ...updates } : p));
  notify();
}

export function enrollEmployee(planId: string, employeeId: string) {
  state = state.map((p) =>
    p.id === planId && !p.enrolledEmployeeIds.includes(employeeId)
      ? { ...p, enrolledEmployeeIds: [...p.enrolledEmployeeIds, employeeId] }
      : p,
  );
  notify();
}

export function waiveEmployee(planId: string, employeeId: string) {
  state = state.map((p) =>
    p.id === planId
      ? { ...p, enrolledEmployeeIds: p.enrolledEmployeeIds.filter((id) => id !== employeeId) }
      : p,
  );
  notify();
}

export function duplicateBenefitPlan(id: string): BenefitPlan | undefined {
  const source = state.find((p) => p.id === id);
  if (!source) return undefined;
  const copy: BenefitPlan = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name} (Copy)`,
    enrolledEmployeeIds: [],
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveBenefitPlans(ids: string[]) {
  state = state.map((p) => (ids.includes(p.id) ? { ...p, archived: true } : p));
  notify();
}

export function restoreBenefitPlan(id: string) {
  state = state.map((p) => (p.id === id ? { ...p, archived: false } : p));
  notify();
}

export function deleteBenefitPlan(id: string) {
  state = state.filter((p) => p.id !== id);
  notify();
}
