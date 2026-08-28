import * as React from "react";

/**
 * Mock Budget Planning dataset + shared store — Finance sidebar
 * (05 Department Operating Systems/Finance/finance-operating-system.md).
 * CLAUDE.md's Finance action set names "Approve Budget" explicitly. Spend
 * is computed live from real Expenses (Approved/Reimbursed, matching
 * category and period) — never stored redundantly, the same derived-count
 * pattern used for Open Deals per Company and Applicants per Job Listing.
 */
export const BUDGET_STATUSES = ["Draft", "Approved"] as const;
export type BudgetStatus = (typeof BUDGET_STATUSES)[number];

export interface BudgetLine {
  id: string;
  category: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  allocated: number;
  status: BudgetStatus;
  archived: boolean;
}

const seedBudgets: BudgetLine[] = [
  {
    id: "budget-travel-h2",
    category: "Travel",
    periodLabel: "H2 2026",
    periodStart: "2026-07-01",
    periodEnd: "2026-12-31",
    allocated: 150000,
    status: "Approved",
    archived: false,
  },
  {
    id: "budget-meals-h2",
    category: "Meals & Entertainment",
    periodLabel: "H2 2026",
    periodStart: "2026-07-01",
    periodEnd: "2026-12-31",
    allocated: 100000,
    status: "Approved",
    archived: false,
  },
  {
    id: "budget-equipment-h2",
    category: "Equipment",
    periodLabel: "H2 2026",
    periodStart: "2026-07-01",
    periodEnd: "2026-12-31",
    allocated: 500000,
    status: "Approved",
    archived: false,
  },
  {
    id: "budget-software-h2",
    category: "Software",
    periodLabel: "H2 2026",
    periodStart: "2026-07-01",
    periodEnd: "2026-12-31",
    allocated: 80000,
    status: "Draft",
    archived: false,
  },
];

let state: BudgetLine[] = seedBudgets;
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

export function useBudgetLines(): BudgetLine[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addBudgetLine(input: {
  category: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  allocated: number;
}): BudgetLine {
  const line: BudgetLine = {
    id: `budget-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    status: "Draft",
    archived: false,
  };
  state = [line, ...state];
  notify();
  return line;
}

export function updateBudgetLine(
  id: string,
  updates: Partial<Pick<BudgetLine, "category" | "periodLabel" | "periodStart" | "periodEnd" | "allocated">>,
) {
  state = state.map((b) => (b.id === id ? { ...b, ...updates } : b));
  notify();
}

/** CLAUDE.md's Finance action set: "Approve Budget." */
export function approveBudgetLine(id: string) {
  state = state.map((b) => (b.id === id ? { ...b, status: "Approved" } : b));
  notify();
}

export function archiveBudgetLines(ids: string[]) {
  state = state.map((b) => (ids.includes(b.id) ? { ...b, archived: true } : b));
  notify();
}

export function deleteBudgetLine(id: string) {
  state = state.filter((b) => b.id !== id);
  notify();
}
