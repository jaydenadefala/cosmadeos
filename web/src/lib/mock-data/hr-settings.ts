import * as React from "react";

/**
 * Mock HR Settings dataset + shared store — Settings sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md: "Settings"
 * is one of the six authoritative grouping sections). Two real, editable
 * surfaces: the canonical Departments list (used across Employee.department
 * everywhere else in this app) and a small set of workflow toggles.
 */
export interface HrWorkflowSettings {
  requireManagerApprovalForLeave: boolean;
  autoSendOnboardingEmails: boolean;
  requireApprovalForNewJobListings: boolean;
}

let departments: string[] = [
  "Engineering",
  "Sales",
  "Operations",
  "Human Resources",
  "Executive",
  "Finance",
  "Marketing",
];

let workflowSettings: HrWorkflowSettings = {
  requireManagerApprovalForLeave: true,
  autoSendOnboardingEmails: true,
  requireApprovalForNewJobListings: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDepartments(): string[] {
  return React.useSyncExternalStore(subscribe, () => departments, () => departments);
}

export function addDepartment(name: string) {
  const trimmed = name.trim();
  if (!trimmed || departments.includes(trimmed)) return;
  departments = [...departments, trimmed];
  notify();
}

export function renameDepartment(oldName: string, newName: string) {
  const trimmed = newName.trim();
  if (!trimmed) return;
  departments = departments.map((d) => (d === oldName ? trimmed : d));
  notify();
}

export function removeDepartment(name: string) {
  departments = departments.filter((d) => d !== name);
  notify();
}

export function useHrWorkflowSettings(): HrWorkflowSettings {
  return React.useSyncExternalStore(subscribe, () => workflowSettings, () => workflowSettings);
}

export function setWorkflowSetting(key: keyof HrWorkflowSettings, value: boolean) {
  workflowSettings = { ...workflowSettings, [key]: value };
  notify();
}
