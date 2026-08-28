import * as React from "react";

/**
 * Mock Banking dataset + shared store — Finance sidebar
 * (05 Department Operating Systems/Finance/finance-operating-system.md).
 * Two related record types in one store: Bank Accounts and their
 * Transactions. "Categorize Transaction" (CLAUDE.md's Finance action set)
 * is a real, standalone mutator — new transactions start "Uncategorized."
 */
export const TRANSACTION_CATEGORIES = [
  "Uncategorized",
  "Revenue",
  "Payroll",
  "Rent",
  "Utilities",
  "Software",
  "Equipment",
  "Professional Services",
  "Transfer",
] as const;
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountType: "Checking" | "Savings";
  balance: number;
  archived: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  archived: boolean;
}

const seedAccounts: BankAccount[] = [
  {
    id: "account-operating",
    name: "Operating Account",
    bankName: "GTBank",
    accountType: "Checking",
    balance: 18450000,
    archived: false,
  },
  {
    id: "account-reserve",
    name: "Reserve Account",
    bankName: "Stanbic IBTC",
    accountType: "Savings",
    balance: 42000000,
    archived: false,
  },
];

const seedTransactions: Transaction[] = [
  {
    id: "txn-1",
    accountId: "account-operating",
    description: "Lagos General Hospital — INV-1001",
    amount: 3450000,
    category: "Revenue",
    date: "2026-05-20",
    archived: false,
  },
  {
    id: "txn-2",
    accountId: "account-operating",
    description: "Kano Teaching Hospital — INV-1002",
    amount: 850000,
    category: "Revenue",
    date: "2026-06-15",
    archived: false,
  },
  {
    id: "txn-3",
    accountId: "account-operating",
    description: "Payroll — July",
    amount: -4200000,
    category: "Payroll",
    date: "2026-07-01",
    archived: false,
  },
  {
    id: "txn-4",
    accountId: "account-operating",
    description: "Lagos Business Park Ltd.",
    amount: -450000,
    category: "Rent",
    date: "2026-07-04",
    archived: false,
  },
  {
    id: "txn-5",
    accountId: "account-operating",
    description: "Eko Electricity Distribution",
    amount: -85000,
    category: "Utilities",
    date: "2026-07-10",
    archived: false,
  },
  {
    id: "txn-6",
    accountId: "account-operating",
    description: "POS Purchase — Office Supplies",
    amount: -32000,
    category: "Uncategorized",
    date: "2026-07-18",
    archived: false,
  },
];

let accounts: BankAccount[] = seedAccounts;
let transactions: Transaction[] = seedTransactions;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBankAccounts(): BankAccount[] {
  return React.useSyncExternalStore(subscribe, () => accounts, () => accounts);
}

export function useTransactions(): Transaction[] {
  return React.useSyncExternalStore(subscribe, () => transactions, () => transactions);
}

export function addBankAccount(input: {
  name: string;
  bankName: string;
  accountType: "Checking" | "Savings";
  balance: number;
}): BankAccount {
  const account: BankAccount = {
    id: `account-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    archived: false,
  };
  accounts = [...accounts, account];
  notify();
  return account;
}

export function addTransaction(input: {
  accountId: string;
  description: string;
  amount: number;
  date: string;
}): Transaction {
  const transaction: Transaction = {
    id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    accountId: input.accountId,
    description: input.description,
    amount: input.amount,
    category: "Uncategorized",
    date: input.date,
    archived: false,
  };
  transactions = [transaction, ...transactions];
  accounts = accounts.map((a) => (a.id === input.accountId ? { ...a, balance: a.balance + input.amount } : a));
  notify();
  return transaction;
}

/** CLAUDE.md's Finance action set: "Categorize Transaction." */
export function categorizeTransaction(id: string, category: TransactionCategory) {
  transactions = transactions.map((t) => (t.id === id ? { ...t, category } : t));
  notify();
}

export function archiveTransactions(ids: string[]) {
  transactions = transactions.map((t) => (ids.includes(t.id) ? { ...t, archived: true } : t));
  notify();
}

export function deleteTransaction(id: string) {
  const txn = transactions.find((t) => t.id === id);
  transactions = transactions.filter((t) => t.id !== id);
  if (txn) {
    accounts = accounts.map((a) => (a.id === txn.accountId ? { ...a, balance: a.balance - txn.amount } : a));
  }
  notify();
}
