"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import { toast } from "sonner";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeTable } from "@/components/hr/employee-table";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import {
  archiveEmployees,
  deleteEmployees,
  useEmployees,
  type Employee,
} from "@/lib/mock-data/employees";

const STATUS_FILTER_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Invited", label: "Invited" },
  { value: "Pending", label: "Pending" },
  { value: "Offboarding", label: "Offboarding" },
];

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Employee[]) {
  const header = ["Name", "Email", "Access", "Status", "Department", "Title"];
  const lines = rows.map((r) =>
    [r.name, r.email, r.access, r.status, r.department, r.title].map((v) => `"${v}"`).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employee-directory.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Employee Directory — the People & HR workspace's default landing page
 * (ADR-002: working surface, not a dashboard). Field shape and toolbar
 * match 11 UX System/design-system-teardown.md and
 * 05 Department Operating Systems/HR/hr-operating-system.md exactly.
 */
export default function EmployeeDirectoryPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [sortDesc, setSortDesc] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [density, setDensity] = React.useState<Density>("comfortable");
  const data = useEmployees();

  // No real backend yet (Volume 2 unauthored) — simulates a network fetch so
  // the loading skeleton path is genuinely exercised, not just built.
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Refresh is a click handler (not an effect), so setting loading back to
  // true synchronously here is the normal, expected pattern.
  function refetch() {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (typeof snapshot.sortDesc === "boolean") setSortDesc(snapshot.sortDesc);
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
  }

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "department",
        label: "Department",
        options: Array.from(new Set(data.map((e) => e.department))).map((d) => ({
          value: d,
          label: d,
        })),
      },
      { id: "status", label: "Status", options: STATUS_FILTER_OPTIONS },
    ],
    [data],
  );

  const active = React.useMemo(() => data.filter((e) => !e.archived), [data]);

  const filtered = React.useMemo(() => {
    let rows = active;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
      );
    }
    if (filters.department) rows = rows.filter((e) => e.department === filters.department);
    if (filters.status) rows = rows.filter((e) => e.status === filters.status);
    rows = [...rows].sort((a, b) =>
      sortDesc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name),
    );
    return rows;
  }, [active, search, filters, sortDesc]);

  const pagination = usePagination(filtered);

  function handleArchive() {
    archiveEmployees(selected);
    toast.success(`${selected.length} employee${selected.length === 1 ? "" : "s"} archived.`);
    setSelected([]);
  }

  function handleDelete() {
    deleteEmployees(selected);
    toast.success(`${selected.length} employee${selected.length === 1 ? "" : "s"} deleted.`);
    setSelected([]);
  }

  function handleExportSelected() {
    exportToCsv(active.filter((e) => selected.includes(e.id)));
    toast.success(`${selected.length} employee${selected.length === 1 ? "" : "s"} exported.`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">People</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {active.length} users
        </p>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search…"
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
            pageKey="hr-directory"
            snapshot={{ search, filters, sortDesc, density }}
            onApply={applyView}
          />
        }
        sortOptions={[
          { label: "Name (A-Z)", onSelect: () => setSortDesc(false) },
          { label: "Name (Z-A)", onSelect: () => setSortDesc(true) },
        ]}
        density={density}
        onDensityChange={setDensity}
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Employee directory exported.");
        }}
        onRefresh={refetch}
        onCreate={() => router.push("/hr/onboarding")}
        createLabel="Add Employee"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          { label: "Export", icon: Download, onClick: handleExportSelected },
          { label: "Archive", onClick: handleArchive },
          { label: "Delete", onClick: handleDelete, variant: "destructive" },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="p-4 sm:p-6">
            <EmployeeTable
              employees={[]}
              loading
              selectedIds={[]}
              onToggleSelect={() => {}}
              onToggleSelectAll={() => {}}
            />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No employees match your search"
            description="Try a different name, email, or clear your filters."
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
          <div className={density === "comfortable" ? "p-4 sm:p-6" : "p-2 sm:p-3"}>
            <EmployeeTable
              employees={pagination.pageItems}
              selectedIds={selected}
              density={density}
              onToggleSelect={(id) =>
                setSelected((prev) =>
                  prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
                )
              }
              onToggleSelectAll={() =>
                setSelected((prev) =>
                  pagination.pageItems.every((e) => prev.includes(e.id))
                    ? prev.filter((id) => !pagination.pageItems.some((e) => e.id === id))
                    : [...new Set([...prev, ...pagination.pageItems.map((e) => e.id)])],
                )
              }
            />
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
        itemLabel="employees"
      />
    </div>
  );
}
