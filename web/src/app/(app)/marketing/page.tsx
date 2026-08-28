import { redirect } from "next/navigation";

/**
 * ADR-002: workspaces are working environments, not dashboards — the
 * Marketing workspace's default landing page is Campaigns, not an overview.
 */
export default function MarketingIndexPage() {
  redirect("/marketing/campaigns");
}
