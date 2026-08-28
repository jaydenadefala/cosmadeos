import { redirect } from "next/navigation";

/**
 * "Employee Profiles" nav item — Workforce section (05 Department Operating
 * Systems/HR/hr-operating-system.md). An Employee Profile is the detail page
 * reached by clicking a row in the Employee Directory
 * (/hr/directory/[employeeId]), not a separate list — so this redirects to
 * the real directory rather than building a redundant second table.
 */
export default function EmployeeProfilesRedirectPage() {
  redirect("/hr/directory");
}
