import { redirect } from "next/navigation";

/**
 * ADR-002: workspaces are working environments, not dashboards — the HR
 * workspace's default landing page is the Employee Directory table, not
 * an overview/dashboard page.
 */
export default function HrIndexPage() {
  redirect("/hr/directory");
}
