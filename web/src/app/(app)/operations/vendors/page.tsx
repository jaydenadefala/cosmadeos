"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, MoreHorizontal, Trash2 } from "lucide-react";

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
import { VendorEditSheet } from "@/components/operations/vendor-edit-sheet";
import {
  archiveVendors,
  deleteVendor,
  duplicateVendor,
  setVendorStatus,
  useVendors,
  VENDOR_CATEGORIES,
  type Vendor,
  type VendorStatus,
} from "@/lib/mock-data/vendors";

const STATUS_TONE: Record<VendorStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Inactive: "bg-muted text-foreground/70",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Vendor[]) {
  const header = ["Name", "Category", "Contact", "Email", "Phone", "Status"];
  const lines = rows.map((r) =>
    [r.name, r.category, r.contactName, r.contactEmail, r.phone, r.status].map((v) => `"${v}"`).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vendors.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Vendors — Operations sidebar (05 Department Operating Systems/Operations/operations-operating-system.md). */
export default function VendorsPage() {
  const router = useRouter();
  const allVendors = useVendors();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<"name-asc" | "name-desc">("name-asc");
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const columnVisibility = useColumnVisibility([
    { id: "category", label: "Category" },
    { id: "contact", label: "Contact" },
    { id: "phone", label: "Phone" },
    { id: "status", label: "Status" },
  ]);

  const vendors = React.useMemo(() => allVendors.filter((v) => !v.archived), [allVendors]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "category", label: "Category", options: VENDOR_CATEGORIES.map((c) => ({ value: c, label: c })) },
      {
        id: "status",
        label: "Status",
        options: [
          { value: "Active", label: "Active" },
          { value: "Inactive", label: "Inactive" },
        ],
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = vendors;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((v) => v.name.toLowerCase().includes(q) || v.contactName.toLowerCase().includes(q));
    }
    if (filters.category) rows = rows.filter((v) => v.category === filters.category);
    if (filters.status) rows = rows.filter((v) => v.status === filters.status);
    rows = [...rows].sort((a, b) =>
      sort === "name-asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
    return rows;
  }, [vendors, search, filters, sort]);

  const pagination = usePagination(filtered);

  const [groupBy, setGroupBy] = React.useState<"none" | "category" | "status">("none");
  const groupedRows = React.useMemo(() => {
    if (groupBy === "none") return null;
    const groups = new Map<string, typeof filtered>();
    for (const vendor of filtered) {
      const key = groupBy === "category" ? vendor.category : vendor.status;
      const list = groups.get(key) ?? [];
      list.push(vendor);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, groupBy]);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.sort === "name-asc" || snapshot.sort === "name-desc") setSort(snapshot.sort);
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
    if (Array.isArray(snapshot.hiddenColumns)) {
      columnVisibility.setHiddenIds(snapshot.hiddenColumns as string[]);
    }
    if (snapshot.groupBy === "none" || snapshot.groupBy === "category" || snapshot.groupBy === "status") {
      setGroupBy(snapshot.groupBy);
    }
  }

  function renderVendorRow(vendor: Vendor) {
    return (
      <TableRow key={vendor.id} data-state={selected.includes(vendor.id) ? "selected" : undefined}>
        <TableCell>
          <Checkbox
            checked={selected.includes(vendor.id)}
            onCheckedChange={() =>
              setSelected((prev) =>
                prev.includes(vendor.id) ? prev.filter((id) => id !== vendor.id) : [...prev, vendor.id],
              )
            }
            aria-label={`Select ${vendor.name}`}
          />
        </TableCell>
        <TableCell className="font-medium">
          <Link href={`/operations/vendors/${vendor.id}`} className="hover:underline">
            {vendor.name}
          </Link>
        </TableCell>
        {columnVisibility.isVisible("category") ? <TableCell>{vendor.category}</TableCell> : null}
        {columnVisibility.isVisible("contact") ? <TableCell>{vendor.contactName}</TableCell> : null}
        {columnVisibility.isVisible("phone") ? <TableCell>{vendor.phone || "—"}</TableCell> : null}
        {columnVisibility.isVisible("status") ? (
          <TableCell>
            <Badge className={`border-0 font-medium ${STATUS_TONE[vendor.status]}`}>{vendor.status}</Badge>
          </TableCell>
        ) : null}
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label={`Actions for ${vendor.name}`} />}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/operations/vendors/${vendor.id}`)}>
                Open
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setVendorStatus(vendor.id, vendor.status === "Active" ? "Inactive" : "Active");
                  toast.success(`${vendor.name} marked ${vendor.status === "Active" ? "Inactive" : "Active"}.`);
                }}
              >
                Mark as {vendor.status === "Active" ? "Inactive" : "Active"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const copy = duplicateVendor(vendor.id);
                  if (copy) toast.success(`${copy.name} created.`);
                }}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  archiveVendors([vendor.id]);
                  toast.success(`${vendor.name} archived.`);
                }}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  deleteVendor(vendor.id);
                  toast.success(`${vendor.name} permanently deleted.`);
                }}
              >
                <Trash2 className="size-4" />
                Delete permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Vendors</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {vendors.length} vendors
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search vendors…"
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
            pageKey="operations-vendors"
            snapshot={{ search, filters, sort, density, hiddenColumns: columnVisibility.hiddenIds, groupBy }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        sortOptions={[
          { label: "Name (A–Z)", onSelect: () => setSort("name-asc") },
          { label: "Name (Z–A)", onSelect: () => setSort("name-desc") },
        ]}
        groupOptions={[
          { label: "None", onSelect: () => setGroupBy("none") },
          { label: "By Category", onSelect: () => setGroupBy("category") },
          { label: "By Status", onSelect: () => setGroupBy("status") },
        ]}
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Vendors exported.");
        }}
        onRefresh={handleRefresh}
        onCreate={() => setCreateOpen(true)}
        createLabel="Create Vendor"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveVendors(selected);
              toast.success(`${selected.length} vendor${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteVendor(id));
              toast.success(`${selected.length} vendor${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No vendors yet"
            description="Add a vendor to start tracking procurement and bills against them."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Create Vendor
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No vendors match your search"
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
                        pagination.pageItems.every((v) => selected.includes(v.id))
                      }
                      onCheckedChange={() =>
                        setSelected((prev) =>
                          pagination.pageItems.every((v) => prev.includes(v.id))
                            ? prev.filter((id) => !pagination.pageItems.some((v) => v.id === id))
                            : [...new Set([...prev, ...pagination.pageItems.map((v) => v.id)])],
                        )
                      }
                      aria-label="Select all vendors on this page"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  {columnVisibility.isVisible("contact") ? <TableHead>Contact</TableHead> : null}
                  {columnVisibility.isVisible("phone") ? <TableHead>Phone</TableHead> : null}
                  {columnVisibility.isVisible("status") ? <TableHead>Status</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedRows
                  ? groupedRows.map(([groupLabel, rows]) => (
                      <React.Fragment key={groupLabel}>
                        <TableRow className="hover:bg-transparent">
                          <TableCell
                            colSpan={
                              3 +
                              (columnVisibility.isVisible("category") ? 1 : 0) +
                              (columnVisibility.isVisible("contact") ? 1 : 0) +
                              (columnVisibility.isVisible("phone") ? 1 : 0) +
                              (columnVisibility.isVisible("status") ? 1 : 0)
                            }
                            className="bg-muted/50 text-muted-foreground py-1.5 text-xs font-semibold uppercase tracking-wide"
                          >
                            {groupLabel} ({rows.length})
                          </TableCell>
                        </TableRow>
                        {rows.map((vendor) => renderVendorRow(vendor))}
                      </React.Fragment>
                    ))
                  : pagination.pageItems.map((vendor) => renderVendorRow(vendor))}
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
        itemLabel="vendors"
      />

      <VendorEditSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(vendor) => router.push(`/operations/vendors/${vendor.id}`)}
      />
    </div>
  );
}
