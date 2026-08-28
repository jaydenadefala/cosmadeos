/**
 * Client-safe display list for the login page — mirrors mock-users.ts
 * but without the password hashes or the bcrypt dependency, so it doesn't
 * pull server-only hashing code into the browser bundle.
 */
export const demoAccounts = [
  { email: "jaydenadefala@gmail.com", role: "Owner" },
  { email: "hr.manager@cosmademedical.com", role: "HR Manager" },
  { email: "employee@cosmademedical.com", role: "Employee" },
] as const;
