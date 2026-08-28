"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComplianceEditSheet } from "@/components/operations/compliance-edit-sheet";
import {
  archiveComplianceItems,
  COMPLIANCE_CATEGORIES,
  COMPLIANCE_STATUSES,
  deleteComplianceItem,
  setComplianceStatus,
  useComplianceItems,
  type ComplianceItem,
  type ComplianceStatus,
} from "@/lib/mock-data/compliance";

const STATUS_TONE: Record<ComplianceStatus, string> = {
  Compliant: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Non-Compliant": "bg-destructive/10 text-destructive",
  "Under Review": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

/** Compliance — Operations sidebar (05 Department Operating Systems/Operations/operations-operating-system.md). */
export default function CompliancePage() {
  const allItems = useComplianceItems();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editingItem, setEditingItem] = React.useState<ComplianceItem | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const columnVisibility = useColumnVisibility([
    { id: "category", label: "Category" },
    { id: "dueDate", label: "Due Date" },
  ]);

  const items = React.useMemo(() => allItems.filter((i) => !i.archived), [allItems]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "status", label: "Status", options: COMPLIANCE_STATUSES.map((s) => ({ value: s, label: s })) },
      { id: "category", label: "Category", options: COMPLIANCE_CATEGORIES.map((c) => ({ value: c, label: c })) },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((i) => i.title.toLowerCase().includes(q));
    }
    if (filters.status) rows = rows.filter((i) => i.status === filters.status);
    if (filters.category) rows = rows.filter((i) => i.category === filters.category);
    return [...rows].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [items, search, filters]);

  const pagination = usePagination(filtered);

  const nonCompliantCount = items.filter((i) => i.status === "Non-Compliant").length;

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
    if (Array.isArray(snapshot.hiddenColumns)) {
      columnVisibility.setHiddenIds(snapshot.hiddenColumns as string[]);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Compliance</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {items.length} items
          {nonCompliantCount > 0 ? ` — ${nonCompliantCount} non-compliant` : ""}
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search compliance items…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        savedViewsControl={
          <SavedViewsMenu
            pageKey="operations-compliance"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setCreateOpen(true)}
        createLabel="New Item"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveComplianceItems(selected);
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteComplianceItem(id));
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {items.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No compliance items yet"
            description="Track a regulatory, safety, or certification requirement."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New Item
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No items match your search"
            description="Try a different name or clear your filters."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilters({});
                }}
              >
                Clear search and filters
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
                      pagination.pageItems.every((i) => selected.includes(i.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((i) => prev.includes(i.id))
                          ? prev.filter((id) => !pagination.pageItems.some((i) => i.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((i) => i.id)])],
                      )
                    }
                      aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  {columnVisibility.isVisible("dueDate") ? <TableHead>Due Date</TableHead> : null}
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((item) => (
                  <TableRow key={item.id} data-state={selected.includes(item.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                          )
                        }
                        aria-label={`Select ${item.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    {columnVisibility.isVisible("category") ? <TableCell>{item.category}</TableCell> : null}
                    {columnVisibility.isVisible("dueDate") ? <TableCell>{item.dueDate}</TableCell> : null}
                    <TableCell>
                      <Badge className={`border-0 font-medium ${STATUS_TONE[item.status]}`}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" aria-label={`Actions for ${item.title}`} />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingItem(item)}>Edit</DropdownMenuItem>
                          {COMPLIANCE_STATUSES.filter((s) => s !== item.status).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => {
                                setComplianceStatus(item.id, status);
                                toast.success(`Marked as ${status}.`);
                              }}
                            >
                              Mark as {status}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            onClick={() => {
                              archiveComplianceItems([item.id]);
                              toast.success(`${item.title} archived.`);
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteComplianceItem(item.id);
                              toast.success(`${item.title} permanently deleted.`);
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        itemLabel="items"
      />

      {editingItem ? (
        <ComplianceEditSheet item={editingItem} open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)} />
      ) : null}
      <ComplianceEditSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
