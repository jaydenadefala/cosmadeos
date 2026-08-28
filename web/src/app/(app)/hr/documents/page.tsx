"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Copy,
  Download,
  FileText,
  MoreHorizontal,
  Pencil,
  SearchX,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import { TeamDocumentDetailSheet } from "@/components/hr/team-document-detail-sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  addTeamDocument,
  archiveTeamDocuments,
  deleteTeamDocument,
  duplicateTeamDocument,
  renameTeamDocument,
  setDocumentVisibility,
  useTeamDocuments,
  type DocumentVisibility,
  type TeamDocument,
} from "@/lib/mock-data/team-documents";

const VISIBILITY_OPTIONS: DocumentVisibility[] = ["Everyone", "HR Admins only"];

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: TeamDocument[]) {
  const header = ["Name", "Type", "Size", "Uploaded By", "Uploaded", "Visibility"];
  const lines = rows.map((r) =>
    [r.name, r.type, r.sizeLabel, r.uploadedBy, r.uploadedLabel, r.visibility]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "team-documents.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Team Documents — Policies sidebar group (05 Department Operating
 * Systems/HR/hr-operating-system.md). Upload is a genuine File API flow —
 * uploaded files carry a real Blob, so Download works honestly for them.
 * Seed documents have no bytes to serve, so their Download is disabled with
 * an explanation rather than silently doing nothing. Uploading a file whose
 * name matches an existing document creates a new Version rather than a
 * duplicate row (see `addTeamDocument` in team-documents.ts).
 */
export default function TeamDocumentsPage() {
  const { data: session } = useSession();
  const allDocuments = useTeamDocuments();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [viewingDoc, setViewingDoc] = React.useState<TeamDocument | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const columnVisibility = useColumnVisibility([
    { id: "uploadedBy", label: "Uploaded by" },
    { id: "size", label: "Size" },
    { id: "date", label: "Date" },
  ]);

  const documents = React.useMemo(() => allDocuments.filter((d) => !d.archived), [allDocuments]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.trim().toLowerCase();
    return documents.filter((d) => d.name.toLowerCase().includes(q));
  }, [documents, search]);

  const pagination = usePagination(filtered);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const uploaderName = session?.user?.name ?? "Unknown";
    const uploaderInitials = session?.user?.initials ?? "?";
    const doc = addTeamDocument(file, uploaderName, uploaderInitials);
    toast.success(
      doc.versionHistory.length > 0
        ? `New version of ${doc.name} uploaded.`
        : `${doc.name} uploaded.`,
    );
  }

  function handleDownload(doc: TeamDocument) {
    if (!doc.fileBlob) return;
    const url = URL.createObjectURL(doc.fileBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function startRename(doc: TeamDocument) {
    setRenamingId(doc.id);
    setRenameValue(doc.name);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      renameTeamDocument(renamingId, renameValue.trim());
      toast.success("Document renamed.");
    }
    setRenamingId(null);
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
    if (Array.isArray(snapshot.hiddenColumns)) {
      columnVisibility.setHiddenIds(snapshot.hiddenColumns as string[]);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Team Documents</h1>
        <p className="text-muted-foreground text-sm">
          {documents.length} document{documents.length === 1 ? "" : "s"}
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search documents…"
        savedViewsControl={
          <SavedViewsMenu
            pageKey="hr-documents"
            snapshot={{ search, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={handleUploadClick}
        createLabel="Upload"
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Team documents exported.");
        }}
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveTeamDocuments(selected);
              toast.success(`${selected.length} document${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteTeamDocument(id));
              toast.success(`${selected.length} document${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No documents match your search"
            description="Try a different name or clear your search."
            action={
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="p-4 sm:p-6">
            <Table density={density}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                      pagination.pageItems.length > 0 &&
                      pagination.pageItems.every((d) => selected.includes(d.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((d) => prev.includes(d.id))
                          ? prev.filter((id) => !pagination.pageItems.some((d) => d.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((d) => d.id)])],
                      )
                    }
                      aria-label="Select all documents"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {columnVisibility.isVisible("uploadedBy") ? <TableHead>Uploaded by</TableHead> : null}
                  {columnVisibility.isVisible("size") ? <TableHead>Size</TableHead> : null}
                  {columnVisibility.isVisible("date") ? <TableHead>Date</TableHead> : null}
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((doc) => (
                  <TableRow
                    key={doc.id}
                    data-state={selected.includes(doc.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(doc.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(doc.id)
                              ? prev.filter((id) => id !== doc.id)
                              : [...prev, doc.id],
                          )
                        }
                        aria-label={`Select ${doc.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      {renamingId === doc.id ? (
                        <Input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="h-8 max-w-xs"
                        />
                      ) : (
                        <button
                          className="flex items-center gap-2 hover:underline"
                          onClick={() => setViewingDoc(doc)}
                        >
                          <FileText className="text-muted-foreground size-4 shrink-0" />
                          <span className="font-medium">{doc.name}</span>
                          {doc.versionHistory.length > 0 ? (
                            <span className="text-muted-foreground text-xs">
                              v{doc.versionHistory.length + 1}
                            </span>
                          ) : null}
                        </button>
                      )}
                    </TableCell>
                    {columnVisibility.isVisible("uploadedBy") ? (
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Avatar className="size-5">
                            <AvatarFallback className="text-[9px]">
                              {doc.uploadedByInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">{doc.uploadedBy}</span>
                        </div>
                      </TableCell>
                    ) : null}
                    {columnVisibility.isVisible("size") ? (
                      <TableCell className="text-muted-foreground">{doc.sizeLabel}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("date") ? (
                      <TableCell className="text-muted-foreground">{doc.uploadedLabel}</TableCell>
                    ) : null}
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {doc.fileBlob ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Download ${doc.name}`}
                                  onClick={() => handleDownload(doc)}
                                />
                              }
                            >
                              <Download className="size-4" />
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled
                                  aria-label={`Download unavailable for ${doc.name}`}
                                />
                              }
                            >
                              <Download className="size-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              No backend storage yet — only files uploaded this session can be
                              downloaded
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`More actions for ${doc.name}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startRename(doc)}>
                              <Pencil className="size-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const copy = duplicateTeamDocument(doc.id);
                                if (copy) toast.success(`${copy.name} created.`);
                              }}
                            >
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {VISIBILITY_OPTIONS.filter((v) => v !== doc.visibility).map((v) => (
                              <DropdownMenuItem
                                key={v}
                                onClick={() => {
                                  setDocumentVisibility(doc.id, v);
                                  toast.success(`Visibility set to ${v}.`);
                                }}
                              >
                                Set visibility: {v}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ConfirmationDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${doc.name}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          }
                          title={`Delete ${doc.name}?`}
                          description="This permanently removes the document. This can't be undone."
                          confirmLabel="Delete"
                          variant="destructive"
                          onConfirm={() => {
                            deleteTeamDocument(doc.id);
                            toast.success(`${doc.name} deleted.`);
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      {viewingDoc ? (
        <TeamDocumentDetailSheet
          document={viewingDoc}
          open={!!viewingDoc}
          onOpenChange={(open) => !open && setViewingDoc(null)}
        />
      ) : null}
    </div>
  );
}
