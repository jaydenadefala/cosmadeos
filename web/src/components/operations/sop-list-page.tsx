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
import { SopCard } from "@/components/operations/sop-card";
import { addSopDocument, archiveSopDocuments, deleteSopDocument, useSopDocuments } from "@/lib/mock-data/sop-documents";

/**
 * Shared list-page renderer for /operations/sops and /knowledge/sops — same
 * store (sop-documents.ts), one system of record surfaced in two workspaces.
 * Extracted from the original Operations SOPs page so Knowledge Base (a
 * documented cross-cutting hub) can reuse it rather than fork the data.
 */
export function SopListPage({ title = "SOPs" }: { title?: string } = {}) {
  const allSops = useSopDocuments();
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({ title: "", category: "", summary: "", content: "" });

  const sops = React.useMemo(() => allSops.filter((s) => !s.archived), [allSops]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return sops;
    const q = search.trim().toLowerCase();
    return sops.filter((s) => s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q));
  }, [sops, search]);

  const pagination = usePagination(filtered);

  function handleCreate() {
    if (!createForm.title.trim()) {
      toast.error("Give the SOP a title.");
      return;
    }
    const doc = addSopDocument({
      title: createForm.title.trim(),
      category: createForm.category.trim() || "General",
      summary: createForm.summary.trim(),
      content: createForm.content.trim(),
    });
    toast.success(`${doc.title} created.`);
    setCreateOpen(false);
    setCreateForm({ title: "", category: "", summary: "", content: "" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {sops.length} procedures
        </p>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search SOPs…"
        onCreate={() => setCreateOpen(true)}
        createLabel="New SOP"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveSopDocuments(selected);
              toast.success(`${selected.length} SOP${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteSopDocument(id));
              toast.success(`${selected.length} SOP${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {sops.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No SOPs yet"
            description="Document your first standard operating procedure."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New SOP
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No SOPs match your search"
            description="Try a different name or clear your search."
            action={
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {pagination.pageItems.map((sop) => (
              <SopCard
                key={sop.id}
                sop={sop}
                selected={selected.includes(sop.id)}
                onToggleSelect={() =>
                  setSelected((prev) => (prev.includes(sop.id) ? prev.filter((id) => id !== sop.id) : [...prev, sop.id]))
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
        itemLabel="SOPs"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New SOP</DialogTitle>
            <DialogDescription>Document a new standard operating procedure.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="new-sop-title" label="Title">
              <Input
                id="new-sop-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>
            <Field id="new-sop-category" label="Category">
              <Input
                id="new-sop-category"
                placeholder="e.g. Inventory"
                value={createForm.category}
                onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
              />
            </Field>
            <Field id="new-sop-summary" label="Summary">
              <Textarea
                id="new-sop-summary"
                value={createForm.summary}
                onChange={(e) => setCreateForm((f) => ({ ...f, summary: e.target.value }))}
                rows={2}
              />
            </Field>
            <Field id="new-sop-content" label="Content">
              <Textarea
                id="new-sop-content"
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
