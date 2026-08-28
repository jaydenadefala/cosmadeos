"use client";

import * as React from "react";
import { toast } from "sonner";
import { BookX } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CARD_GRID_DENSITY_CLASS, PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { cn } from "@/lib/utils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { PlaybookCard } from "@/components/sales/playbook-card";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archivePlaybooks,
  deletePlaybook,
  toggleFavorite,
  usePlaybooks,
} from "@/lib/mock-data/playbooks";

/**
 * Playbooks — Sales sidebar group (05 Department Operating Systems/Sales/
 * sales-operating-system.md: "Playbooks (Knowledge-adjacent content)").
 * A card grid rather than a table — this is reference content to browse
 * and read, not a working record set, so the Universal Toolbar's
 * table-oriented controls (columns, density) are intentionally omitted.
 */
export default function PlaybooksPage() {
  const allPlaybooks = usePlaybooks();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);

  const playbooks = React.useMemo(() => allPlaybooks.filter((p) => !p.archived), [allPlaybooks]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "category",
        label: "Category",
        options: Array.from(new Set(playbooks.map((p) => p.category))).map((c) => ({
          value: c,
          label: c,
        })),
      },
      {
        id: "favorited",
        label: "Favorites",
        options: [{ value: "true", label: "Favorited only" }],
      },
    ],
    [playbooks],
  );

  const filtered = React.useMemo(() => {
    let rows = playbooks;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q),
      );
    }
    if (filters.category) rows = rows.filter((p) => p.category === filters.category);
    if (filters.favorited === "true") rows = rows.filter((p) => p.favorited);
    return rows;
  }, [playbooks, search, filters]);

  const pagination = usePagination(filtered);

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Playbooks</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {playbooks.length} playbooks
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search playbooks…"
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
            pageKey="sales-playbooks"
            snapshot={{ search, filters, density }}
            onApply={applyView}
          />
        }
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archivePlaybooks(selected);
              toast.success(`${selected.length} playbook${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deletePlaybook(id));
              toast.success(`${selected.length} playbook${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={BookX}
            title="No playbooks match your search"
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
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", CARD_GRID_DENSITY_CLASS[density])}>
            {pagination.pageItems.map((playbook) => {
              const author = employeeById.get(playbook.authorId);
              return (
                <PlaybookCard
                  key={playbook.id}
                  playbook={playbook}
                  authorName={author?.name ?? "—"}
                  authorInitials={author?.initials ?? "—"}
                  onToggleFavorite={() => toggleFavorite(playbook.id)}
                  selected={selected.includes(playbook.id)}
                  onToggleSelect={() =>
                    setSelected((prev) =>
                      prev.includes(playbook.id)
                        ? prev.filter((id) => id !== playbook.id)
                        : [...prev, playbook.id],
                    )
                  }
                />
              );
            })}
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
        itemLabel="playbooks"
      />
    </div>
  );
}
