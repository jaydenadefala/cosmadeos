import { PolicyDocumentListPage } from "@/components/hr/policy-document-list-page";

/**
 * Handbooks — Knowledge Base sidebar. Surfaces the real, HR-owned
 * `policy-documents.ts` store (docType="Handbook") rather than forking a
 * duplicate data set — Knowledge Base is documented as a cross-cutting hub,
 * not a second system of record. Same underlying content as /hr/handbook.
 */
export default function KnowledgeHandbooksPage() {
  return <PolicyDocumentListPage docType="Handbook" title="Handbooks" />;
}
