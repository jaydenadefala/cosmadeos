"use client";

import * as React from "react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { PolicyDocumentCard } from "@/components/hr/policy-document-card";
import {
  addPolicyDocument,
  archivePolicyDocuments,
  deletePolicyDocument,
  usePolicyDocuments,
  type PolicyDocType,
} from "@/lib/mock-data/policy-documents";

/**
 * Shared list-page renderer for both /hr/handbook and /hr/policies — same
 * store (policy-documents.ts), filtered by `docType`. Mirrors the proven
 * Playbooks/Knowledge card-grid pattern for reference content.
 */
export function PolicyDocumentListPage({ docType, title }: { docType: PolicyDocType; title: string }) {
  const allDocuments = usePolicyDocuments();
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({ title: "", summary: "", content: "" });

  const documents = React.useMemo(
    () => allDocuments.filter((d) => !d.archived && d.docType === docType),
    [allDocuments, docType],
  );

  const filtered = React.useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.trim().toLowerCase();
    return documents.filter((d) => d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q));
  }, [documents, search]);

  const pagination = usePagination(filtered);

  function handleCreate() {
    if (!createForm.title.trim()) {
      toast.error("Give the document a title.");
      return;
    }
    const doc = addPolicyDocument({
      docType,
      title: createForm.title.trim(),
      summary: createForm.summary.trim(),
      content: createForm.content.trim(),
    });
    toast.success(`${doc.title} created.`);
    setCreateOpen(false);
    setCreateForm({ title: "", summary: "", content: "" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {documents.length} document{documents.length === 1 ? "" : "s"}
        </p>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        onCreate={() => setCreateOpen(true)}
        createLabel="New Document"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archivePolicyDocuments(selected);
              toast.success(`${selected.length} document${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deletePolicyDocument(id));
              toast.success(`${selected.length} document${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {documents.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={`No ${title.toLowerCase()} yet`}
            description={`Add your first ${docType.toLowerCase()} document.`}
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New Document
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No documents match your search"
            description="Try a different name or clear your search."
            action={
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {pagination.pageItems.map((document) => (
              <PolicyDocumentCard
                key={document.id}
                document={document}
                selected={selected.includes(document.id)}
                onToggleSelect={() =>
                  setSelected((prev) =>
                    prev.includes(document.id)
                      ? prev.filter((id) => id !== document.id)
                      : [...prev, document.id],
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        itemLabel="documents"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New {docType.toLowerCase()}</DialogTitle>
            <DialogDescription>Add a new document to {title}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="new-policy-title" label="Title">
              <Input
                id="new-policy-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>
            <Field id="new-policy-summary" label="Summary">
              <Textarea
                id="new-policy-summary"
                value={createForm.summary}
                onChange={(e) => setCreateForm((f) => ({ ...f, summary: e.target.value }))}
                rows={2}
              />
            </Field>
            <Field id="new-policy-content" label="Content">
              <Textarea
                id="new-policy-content"
                value={createForm.content}
                onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
                rows={6}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
