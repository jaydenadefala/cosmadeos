"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, History } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Badge } from "@/components/ui/badge";
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
import { AUDIT_CATEGORIES, useAuditLog, type AuditCategory } from "@/lib/mock-data/audit-log";

const CATEGORY_TONE: Record<AuditCategory, string> = {
  Security: "bg-destructive/10 text-destructive",
  Finance: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Operations: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  HR: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  System: "bg-muted text-foreground/70",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: { timestamp: string; actor: string; action: string; target: string; category: string }[]) {
  const header = ["Timestamp", "Actor", "Action", "Target", "Category"];
  const lines = rows.map((r) => [r.timestamp, r.actor, r.action, r.target, r.category].map((v) => `"${v}"`).join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit-log.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Audit Logs — Operations sidebar (05 Department Operating Systems/
 * Operations/operations-operating-system.md: "read-only history-style
 * table"). Deliberately no Create/Edit/Delete UI — see audit-log.ts for
 * why this is an intentional design decision, not an unfinished CRUD gap.
 */
export default function AuditLogsPage() {
  const allEntries = useAuditLog();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [{ id: "category", label: "Category", options: AUDIT_CATEGORIES.map((c) => ({ value: c, label: c })) }],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = allEntries;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          e.actor.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q),
      );
    }
    if (filters.category) rows = rows.filter((e) => e.category === filters.category);
    return rows;
  }, [allEntries, search, filters]);

  const pagination = usePagination(filtered);
  const columnVisibility = useColumnVisibility([
    { id: "target", label: "Target" },
    { id: "category", label: "Category" },
  ]);

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
        <h1 className="text-lg font-semibold">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {allEntries.length} events — read-only compliance history
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by actor, action, or target…"
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
            pageKey="operations-audit-logs"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Audit log exported.");
        }}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={allEntries.length === 0 ? History : Download}
            title={allEntries.length === 0 ? "No audit events yet" : "No events match your search"}
            description={
              allEntries.length === 0
                ? "Actions across Cosmade OS will be logged here as they happen."
                : "Try a different search term or clear your filters."
            }
          />
        ) : (
          <div className="p-4 sm:p-6">
            <Table density={density}>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  {columnVisibility.isVisible("target") ? <TableHead>Target</TableHead> : null}
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{entry.timestamp}</TableCell>
                    <TableCell className="font-medium">{entry.actor}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    {columnVisibility.isVisible("target") ? (
                      <TableCell className="text-muted-foreground">{entry.target}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("category") ? (
                      <TableCell>
                        <Badge className={`border-0 font-medium ${CATEGORY_TONE[entry.category]}`}>
                          {entry.category}
                        </Badge>
                      </TableCell>
                    ) : null}
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
        itemLabel="events"
      />
    </div>
  );
}
