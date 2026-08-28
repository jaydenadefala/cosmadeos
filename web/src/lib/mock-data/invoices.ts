import * as React from "react";

/**
 * Mock Invoices dataset + shared store — Finance sidebar
 * (05 Department Operating Systems/Finance/finance-operating-system.md:
 * "Universal Object Layout applies to the Invoice object"). `companyId`
 * references a real Company from the Sales workspace (no dedicated
 * Customers workspace exists yet) — the referential-integrity pattern
 * proven throughout this session, now crossing workspace boundaries.
 */
export const INVOICE_STATUSES = ["Draft", "Sent", "Paid", "Overdue", "Void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface InvoiceLineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  companyId: string;
  lineItems: InvoiceLineItem[];
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  archived: boolean;
}

export function invoiceTotal(invoice: Invoice): number {
  return invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
}

const seedInvoices: Invoice[] = [
  {
    id: "invoice-1001",
    invoiceNumber: "INV-1001",
    companyId: "company-lagos-general",
    lineItems: [
      { description: "X200 Ventilator (x2)", amount: 3200000 },
      { description: "Installation & Training", amount: 250000 },
    ],
    status: "Paid",
    issueDate: "2026-05-01",
    dueDate: "2026-05-31",
    paidDate: "2026-05-20",
    archived: false,
  },
  {
    id: "invoice-1002",
    invoiceNumber: "INV-1002",
    companyId: "company-kano-teaching",
    lineItems: [{ description: "Annual Service Contract Renewal", amount: 850000 }],
    status: "Paid",
    issueDate: "2026-06-01",
    dueDate: "2026-06-30",
    paidDate: "2026-06-15",
    archived: false,
  },
  {
    id: "invoice-1003",
    invoiceNumber: "INV-1003",
    companyId: "company-vi-clinic",
    lineItems: [{ description: "Biomedical Technician Callout", amount: 120000 }],
    status: "Sent",
    issueDate: "2026-07-10",
    dueDate: "2026-08-09",
    archived: false,
  },
  {
    id: "invoice-1004",
    invoiceNumber: "INV-1004",
    companyId: "company-abuja-specialist",
    lineItems: [{ description: "Patient Monitor Upgrade Package", amount: 1650000 }],
    status: "Overdue",
    issueDate: "2026-06-05",
    dueDate: "2026-07-05",
    archived: false,
  },
  {
    id: "invoice-1005",
    invoiceNumber: "INV-1005",
    companyId: "company-ph-regional",
    lineItems: [{ description: "Preventive Maintenance — Q3", amount: 340000 }],
    status: "Draft",
    issueDate: "2026-07-20",
    dueDate: "2026-08-19",
    archived: false,
  },
];

let state: Invoice[] = seedInvoices;
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

export function useInvoices(): Invoice[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

let invoiceCounter = 1006;

export function generateInvoice(input: {
  companyId: string;
  lineItems: InvoiceLineItem[];
  issueDate: string;
  dueDate: string;
}): Invoice {
  const invoice: Invoice = {
    id: `invoice-${invoiceCounter}`,
    invoiceNumber: `INV-${invoiceCounter}`,
    companyId: input.companyId,
    lineItems: input.lineItems,
    status: "Draft",
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    archived: false,
  };
  invoiceCounter += 1;
  state = [invoice, ...state];
  notify();
  return invoice;
}

export function updateInvoice(
  id: string,
  updates: Partial<Pick<Invoice, "lineItems" | "issueDate" | "dueDate" | "companyId">>,
) {
  state = state.map((i) => (i.id === id ? { ...i, ...updates } : i));
  notify();
}

export function sendInvoice(id: string) {
  state = state.map((i) => (i.id === id && i.status === "Draft" ? { ...i, status: "Sent" } : i));
  notify();
}

export function recordPayment(id: string, paidDate: string) {
  state = state.map((i) => (i.id === id ? { ...i, status: "Paid", paidDate } : i));
  notify();
}

export function voidInvoice(id: string) {
  state = state.map((i) => (i.id === id ? { ...i, status: "Void" } : i));
  notify();
}

export function duplicateInvoice(id: string): Invoice | undefined {
  const source = state.find((i) => i.id === id);
  if (!source) return undefined;
  const copy: Invoice = {
    ...source,
    id: `invoice-${invoiceCounter}`,
    invoiceNumber: `INV-${invoiceCounter}`,
    status: "Draft",
    paidDate: undefined,
    archived: false,
  };
  invoiceCounter += 1;
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveInvoices(ids: string[]) {
  state = state.map((i) => (ids.includes(i.id) ? { ...i, archived: true } : i));
  notify();
}

export function restoreInvoice(id: string) {
  state = state.map((i) => (i.id === id ? { ...i, archived: false } : i));
  notify();
}

export function deleteInvoice(id: string) {
  state = state.filter((i) => i.id !== id);
  notify();
}
