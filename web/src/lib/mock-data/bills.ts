import * as React from "react";

/**
 * Mock Bills (Accounts Payable) dataset + shared store — Finance sidebar
 * (05 Department Operating Systems/Finance/finance-operating-system.md).
 * `vendorId` references a real Vendor from the Operations workspace
 * (05 Department Operating Systems/Operations/operations-operating-system.md)
 * — migrated from a free-text `vendorName` once Vendor existed, the same
 * way Invoice.companyId became a real reference once Companies existed.
 */
export const BILL_STATUSES = ["Unpaid", "Paid", "Overdue"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export const BILL_CATEGORIES = ["Rent", "Utilities", "Software", "Supplies", "Professional Services"] as const;
export type BillCategory = (typeof BILL_CATEGORIES)[number];

export interface Bill {
  id: string;
  billNumber: string;
  vendorId: string;
  category: BillCategory;
  amount: number;
  status: BillStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  archived: boolean;
}

let billCounter = 2005;

const seedBills: Bill[] = [
  {
    id: "bill-2001",
    billNumber: "BILL-2001",
    vendorId: "vendor-lagos-business-park",
    category: "Rent",
    amount: 450000,
    status: "Paid",
    issueDate: "2026-07-01",
    dueDate: "2026-07-05",
    paidDate: "2026-07-04",
    archived: false,
  },
  {
    id: "bill-2002",
    billNumber: "BILL-2002",
    vendorId: "vendor-eko-electricity",
    category: "Utilities",
    amount: 85000,
    status: "Paid",
    issueDate: "2026-07-01",
    dueDate: "2026-07-15",
    paidDate: "2026-07-10",
    archived: false,
  },
  {
    id: "bill-2003",
    billNumber: "BILL-2003",
    vendorId: "vendor-vercel",
    category: "Software",
    amount: 62000,
    status: "Unpaid",
    issueDate: "2026-07-15",
    dueDate: "2026-08-14",
    archived: false,
  },
  {
    id: "bill-2004",
    billNumber: "BILL-2004",
    vendorId: "vendor-adekunle-legal",
    category: "Professional Services",
    amount: 320000,
    status: "Overdue",
    issueDate: "2026-06-10",
    dueDate: "2026-07-10",
    archived: false,
  },
];

let state: Bill[] = seedBills;
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

export function useBills(): Bill[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addBill(input: {
  vendorId: string;
  category: BillCategory;
  amount: number;
  issueDate: string;
  dueDate: string;
}): Bill {
  const bill: Bill = {
    id: `bill-${billCounter}`,
    billNumber: `BILL-${billCounter}`,
    vendorId: input.vendorId,
    category: input.category,
    amount: input.amount,
    status: "Unpaid",
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    archived: false,
  };
  billCounter += 1;
  state = [bill, ...state];
  notify();
  return bill;
}

export function updateBill(
  id: string,
  updates: Partial<Pick<Bill, "vendorId" | "category" | "amount" | "issueDate" | "dueDate">>,
) {
  state = state.map((b) => (b.id === id ? { ...b, ...updates } : b));
  notify();
}

export function markBillPaid(id: string, paidDate: string) {
  state = state.map((b) => (b.id === id ? { ...b, status: "Paid", paidDate } : b));
  notify();
}

export function duplicateBill(id: string): Bill | undefined {
  const source = state.find((b) => b.id === id);
  if (!source) return undefined;
  const copy: Bill = {
    ...source,
    id: `bill-${billCounter}`,
    billNumber: `BILL-${billCounter}`,
    status: "Unpaid",
    paidDate: undefined,
    archived: false,
  };
  billCounter += 1;
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveBills(ids: string[]) {
  state = state.map((b) => (ids.includes(b.id) ? { ...b, archived: true } : b));
  notify();
}

export function restoreBill(id: string) {
  state = state.map((b) => (b.id === id ? { ...b, archived: false } : b));
  notify();
}

export function deleteBill(id: string) {
  state = state.filter((b) => b.id !== id);
  notify();
}
