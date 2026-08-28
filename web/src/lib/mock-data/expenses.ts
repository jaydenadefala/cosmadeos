import * as React from "react";

/**
 * Mock Expenses dataset + shared store — Finance sidebar
 * (05 Department Operating Systems/Finance/finance-operating-system.md).
 * CLAUDE.md's Finance action set names "Create Expense, Approve Expense,
 * Reject Expense, Upload Receipt" explicitly. `employeeId` references a
 * real Employee (referential-integrity pattern); `receiptBlob` is only
 * set for session uploads (same honest-download pattern as Team Documents/
 * Creative Assets — no backend/storage yet).
 */
export const EXPENSE_CATEGORIES = [
  "Travel",
  "Meals & Entertainment",
  "Office Supplies",
  "Software",
  "Equipment",
  "Other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_STATUSES = ["Pending", "Approved", "Rejected", "Reimbursed"] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export interface Expense {
  id: string;
  employeeId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  status: ExpenseStatus;
  submittedDate: string;
  receiptName?: string;
  receiptBlob?: Blob;
  archived: boolean;
}

const seedExpenses: Expense[] = [
  {
    id: "expense-1",
    employeeId: "abby-huang",
    description: "Fuel for Lagos General Hospital site visit",
    category: "Travel",
    amount: 18000,
    status: "Approved",
    submittedDate: "2026-07-15",
    archived: false,
  },
  {
    id: "expense-2",
    employeeId: "sam-okafor",
    description: "Client lunch — Ikeja Medical Center demo",
    category: "Meals & Entertainment",
    amount: 24000,
    status: "Pending",
    submittedDate: "2026-07-22",
    archived: false,
  },
  {
    id: "expense-3",
    employeeId: "daniel-kim",
    description: "Calibration toolkit replacement parts",
    category: "Equipment",
    amount: 65000,
    status: "Reimbursed",
    submittedDate: "2026-06-28",
    archived: false,
  },
  {
    id: "expense-4",
    employeeId: "maria-santos",
    description: "QuickBooks add-on subscription",
    category: "Software",
    amount: 15000,
    status: "Rejected",
    submittedDate: "2026-07-10",
    archived: false,
  },
];

let state: Expense[] = seedExpenses;
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

export function useExpenses(): Expense[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addExpense(input: {
  employeeId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  submittedDate: string;
  receiptFile?: File;
}): Expense {
  const expense: Expense = {
    id: `expense-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    description: input.description,
    category: input.category,
    amount: input.amount,
    status: "Pending",
    submittedDate: input.submittedDate,
    receiptName: input.receiptFile?.name,
    receiptBlob: input.receiptFile,
    archived: false,
  };
  state = [expense, ...state];
  notify();
  return expense;
}

export function setExpenseStatus(id: string, status: ExpenseStatus) {
  state = state.map((e) => (e.id === id ? { ...e, status } : e));
  notify();
}

export function uploadReceipt(id: string, file: File) {
  state = state.map((e) => (e.id === id ? { ...e, receiptName: file.name, receiptBlob: file } : e));
  notify();
}

export function duplicateExpense(id: string): Expense | undefined {
  const source = state.find((e) => e.id === id);
  if (!source) return undefined;
  const copy: Expense = {
    ...source,
    id: `expense-${Date.now()}`,
    status: "Pending",
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveExpenses(ids: string[]) {
  state = state.map((e) => (ids.includes(e.id) ? { ...e, archived: true } : e));
  notify();
}

export function restoreExpense(id: string) {
  state = state.map((e) => (e.id === id ? { ...e, archived: false } : e));
  notify();
}

export function deleteExpense(id: string) {
  state = state.filter((e) => e.id !== id);
  notify();
}
