import bcrypt from "bcryptjs";

/**
 * Temporary mock user store for authentication (ADR-005, DECISIONS.md).
 *
 * No real database exists yet (Implementation Volume 2 — Database Blueprint —
 * is unauthored), so NextAuth's Credentials provider checks against this
 * in-memory table instead of a real user store. The session/route-protection
 * plumbing around this does not need to change once a real database exists —
 * only `authorizeUser` below needs to become a real query.
 *
 * Demo password for every account: "cosmade123" (hashed here, never stored
 * or logged in plaintext). This is a development convenience, not a
 * production credential — revisit entirely once Volume 2 lands.
 */
export interface MockUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  company: string;
  initials: string;
}

const DEMO_PASSWORD_HASH = bcrypt.hashSync("cosmade123", 10);

export const mockUsers: MockUserRecord[] = [
  {
    id: "1",
    name: "Jayden Adefala",
    email: "jaydenadefala@gmail.com",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "Owner",
    company: "Cosmade Medical",
    initials: "JA",
  },
  {
    id: "2",
    name: "Priya Shah",
    email: "hr.manager@cosmademedical.com",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "HR Manager",
    company: "Cosmade Medical",
    initials: "PS",
  },
  {
    id: "3",
    name: "Sam Okafor",
    email: "employee@cosmademedical.com",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "Employee",
    company: "Cosmade Medical",
    initials: "SO",
  },
];

export function authorizeUser(email: string, password: string): MockUserRecord | null {
  const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  return bcrypt.compareSync(password, user.passwordHash) ? user : null;
}
