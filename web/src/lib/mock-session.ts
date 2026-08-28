/**
 * Real authentication landed in ADR-005 (NextAuth.js against the mock user
 * table in mock-users.ts) — this file now only holds the role/company lists
 * the Developer Preview Toolbar uses to *simulate* permissions, independent
 * of whoever is actually signed in.
 */
export interface SessionUser {
  name: string;
  email: string;
  role: string;
  company: string;
  initials: string;
}

/** Role list — 06 Platform Core/developer-preview-toolbar.md */
export const availableRoles = [
  "Owner",
  "Administrator",
  "Finance Manager",
  "HR Manager",
  "Sales Manager",
  "Marketing Manager",
  "Operations Manager",
  "Department Lead",
  "Manager",
  "Supervisor",
  "Employee",
  "Guest",
  "External Partner",
  "Vendor",
  "Customer",
] as const;

/** Company list — 06 Platform Core/developer-preview-toolbar.md */
export const availableCompanies = [
  "Cosmade Medical",
  "Acme Ltd",
  "Demo Company",
  "Enterprise Sandbox",
] as const;
