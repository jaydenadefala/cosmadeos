import { redirect } from "next/navigation";

/**
 * ADR-002: workspaces are working environments, not dashboards — the Sales
 * workspace's default landing page is the Leads pipeline, not an overview.
 */
export default function SalesIndexPage() {
  redirect("/sales/leads");
}
