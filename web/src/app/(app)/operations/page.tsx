import { redirect } from "next/navigation";

/**
 * ADR-002: workspaces are working environments, not dashboards — the
 * Operations workspace's default landing page is Vendors (a working
 * table), not an overview.
 */
export default function OperationsIndexPage() {
  redirect("/operations/vendors");
}
