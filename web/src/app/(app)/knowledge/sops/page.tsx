import { SopListPage } from "@/components/operations/sop-list-page";

/**
 * SOPs — Knowledge Base sidebar. Surfaces the real, Operations-owned
 * `sop-documents.ts` store rather than forking a duplicate data set — same
 * underlying content and detail pages (/operations/sops/[sopId]) as
 * /operations/sops.
 */
export default function KnowledgeSopsPage() {
  return <SopListPage title="SOPs" />;
}
