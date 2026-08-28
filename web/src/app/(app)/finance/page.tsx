import { redirect } from "next/navigation";

/**
 * ADR-002: workspaces are working environments, not dashboards — the
 * Finance workspace's default landing page is Invoices (a working ledger),
 * not an overview, per finance-operating-system.md ("Invoices/Bills/
 * Banking as tables" is the primary working surface).
 */
export default function FinanceIndexPage() {
  redirect("/finance/invoices");
}
