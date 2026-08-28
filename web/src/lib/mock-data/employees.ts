/**
 * Mock Employee dataset + a tiny shared store for the People & HR workspace
 * (Phase 5). Field shape matches the reference table exactly —
 * 11 UX System/design-system-teardown.md: Name, Avatar (initials fallback),
 * Access (Employee/Admin/Manager/Owner), secondary status text
 * (Invited/Pending/department/role).
 *
 * No real backend exists yet (Implementation Volume 2 unauthored). This is
 * a real, shared, mutable in-memory store (not per-page local state) so that
 * archiving/deleting from the Employee Profile page is honestly reflected
 * back in the Employee Directory — the Confidence principle ("users should
 * never wonder whether something worked") requires the two pages agree.
 * Swap `listeners`/module state for a real data-fetching layer later; the
 * `useEmployees()` hook's contract doesn't need to change.
 */
import * as React from "react";

export type AccessLevel = "Employee" | "Admin" | "Manager" | "Owner";
export type EmployeeStatus = "Active" | "Invited" | "Pending" | "Offboarding";

export interface Employee {
  id: string;
  name: string;
  email: string;
  initials: string;
  access: AccessLevel;
  status: EmployeeStatus;
  department: string;
  title: string;
  managerName?: string;
  managerInitials?: string;
  joinedLabel: string;
  lastUpdated: string;
  openTasks: number;
  directReports: number;
  archived: boolean;
}

const seedEmployees: Employee[] = [
  {
    id: "abby-huang",
    name: "Abby Huang",
    email: "abby.huang@cosmademedical.com",
    initials: "AH",
    access: "Employee",
    status: "Active",
    department: "Engineering",
    title: "Field Service Engineer",
    managerName: "Priya Shah",
    managerInitials: "PS",
    joinedLabel: "8 mo",
    lastUpdated: "2 hours ago",
    openTasks: 3,
    directReports: 0,
    archived: false,
  },
  {
    id: "adriano-leal",
    name: "Adriano Leal",
    email: "adriano.leal@cosmademedical.com",
    initials: "AL",
    access: "Employee",
    status: "Invited",
    department: "Sales",
    title: "Account Executive",
    managerName: "Sam Okafor",
    managerInitials: "SO",
    joinedLabel: "Not started",
    lastUpdated: "1 day ago",
    openTasks: 0,
    directReports: 0,
    archived: false,
  },
  {
    id: "alexandre-hamilton",
    name: "Alexandre Hamilton",
    email: "alexandre.hamilton@cosmademedical.com",
    initials: "AH",
    access: "Employee",
    status: "Invited",
    department: "Operations",
    title: "Logistics Coordinator",
    managerName: "Priya Shah",
    managerInitials: "PS",
    joinedLabel: "Not started",
    lastUpdated: "1 day ago",
    openTasks: 0,
    directReports: 0,
    archived: false,
  },
  {
    id: "priya-shah",
    name: "Priya Shah",
    email: "hr.manager@cosmademedical.com",
    initials: "PS",
    access: "Manager",
    status: "Active",
    department: "Human Resources",
    title: "HR Manager",
    managerName: "Jayden Adefala",
    managerInitials: "JA",
    joinedLabel: "3 yr",
    lastUpdated: "5 hours ago",
    openTasks: 6,
    directReports: 12,
    archived: false,
  },
  {
    id: "sam-okafor",
    name: "Sam Okafor",
    email: "employee@cosmademedical.com",
    initials: "SO",
    access: "Employee",
    status: "Active",
    department: "Sales",
    title: "Sales Development Rep",
    managerName: "Priya Shah",
    managerInitials: "PS",
    joinedLabel: "1 yr",
    lastUpdated: "3 hours ago",
    openTasks: 2,
    directReports: 0,
    archived: false,
  },
  {
    id: "jayden-adefala",
    name: "Jayden Adefala",
    email: "jaydenadefala@gmail.com",
    initials: "JA",
    access: "Owner",
    status: "Active",
    department: "Executive",
    title: "Founder & CEO",
    joinedLabel: "5 yr",
    lastUpdated: "Just now",
    openTasks: 1,
    directReports: 3,
    archived: false,
  },
  {
    id: "maria-santos",
    name: "Maria Santos",
    email: "maria.santos@cosmademedical.com",
    initials: "MS",
    access: "Admin",
    status: "Active",
    department: "Finance",
    title: "Finance Manager",
    managerName: "Jayden Adefala",
    managerInitials: "JA",
    joinedLabel: "2 yr",
    lastUpdated: "1 hour ago",
    openTasks: 4,
    directReports: 2,
    archived: false,
  },
  {
    id: "daniel-kim",
    name: "Daniel Kim",
    email: "daniel.kim@cosmademedical.com",
    initials: "DK",
    access: "Employee",
    status: "Pending",
    department: "Engineering",
    title: "Biomedical Technician",
    managerName: "Priya Shah",
    managerInitials: "PS",
    joinedLabel: "Not started",
    lastUpdated: "2 days ago",
    openTasks: 0,
    directReports: 0,
    archived: false,
  },
];

// --- Shared external store (module-level singleton) ---

let state: Employee[] = seedEmployees;
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

export function archiveEmployees(ids: string[]) {
  state = state.map((e) => (ids.includes(e.id) ? { ...e, archived: true } : e));
  notify();
}

export function restoreEmployee(id: string) {
  state = state.map((e) => (e.id === id ? { ...e, archived: false } : e));
  notify();
}

export function deleteEmployees(ids: string[]) {
  state = state.filter((e) => !ids.includes(e.id));
  notify();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * New Hire Onboarding (03 Design Principles/interaction-patterns.md Multi-Step
 * Wizard Pattern) creates the record here — a real employee, added to the
 * same shared store the Directory and Profile pages read from.
 */
export function addEmployee(input: {
  name: string;
  email: string;
  title: string;
  department: string;
  access: AccessLevel;
  managerName?: string;
  managerInitials?: string;
}): Employee {
  let id = slugify(input.name);
  if (state.some((e) => e.id === id)) id = `${id}-${state.length}`;

  const employee: Employee = {
    id,
    name: input.name,
    email: input.email,
    initials: initialsOf(input.name),
    access: input.access,
    status: "Invited",
    department: input.department,
    title: input.title,
    managerName: input.managerName,
    managerInitials: input.managerInitials,
    joinedLabel: "Not started",
    lastUpdated: "Just now",
    openTasks: 0,
    directReports: 0,
    archived: false,
  };

  state = [...state, employee];
  notify();
  return employee;
}

export function setEmployeeStatus(id: string, status: EmployeeStatus) {
  state = state.map((e) => (e.id === id ? { ...e, status, lastUpdated: "Just now" } : e));
  notify();
}

/** HR Settings' Access Levels table — see /hr/settings. */
export function setEmployeeAccess(id: string, access: AccessLevel) {
  state = state.map((e) => (e.id === id ? { ...e, access, lastUpdated: "Just now" } : e));
  notify();
}

export function updateEmployee(
  id: string,
  updates: Partial<Pick<Employee, "department" | "title" | "managerName" | "managerInitials">>,
) {
  state = state.map((e) => (e.id === id ? { ...e, ...updates, lastUpdated: "Just now" } : e));
  notify();
}

export function duplicateEmployee(id: string): Employee | undefined {
  const source = state.find((e) => e.id === id);
  if (!source) return undefined;
  let newId = `${source.id}-copy`;
  if (state.some((e) => e.id === newId)) newId = `${newId}-${state.length}`;
  const copy: Employee = {
    ...source,
    id: newId,
    name: `${source.name} (Copy)`,
    status: "Invited",
    joinedLabel: "Not started",
    lastUpdated: "Just now",
    openTasks: 0,
    directReports: 0,
    archived: false,
  };
  state = [...state, copy];
  notify();
  return copy;
}

/** Live, shared employee list — reactive across every component that uses it. */
export function useEmployees(): Employee[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getEmployeeById(id: string): Employee | undefined {
  return state.find((e) => e.id === id);
}

/** Re-subscribes so a single employee's page updates live if archived/restored elsewhere. */
export function useEmployee(id: string): Employee | undefined {
  const all = useEmployees();
  return React.useMemo(() => all.find((e) => e.id === id), [all, id]);
}
