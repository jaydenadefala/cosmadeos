import { redirect } from "next/navigation";

/**
 * ADR-002: workspaces are working environments, not dashboards — the
 * Knowledge Base workspace's default landing page is Handbooks (a working
 * document library), not an overview.
 */
export default function KnowledgeIndexPage() {
  redirect("/knowledge/handbooks");
}
