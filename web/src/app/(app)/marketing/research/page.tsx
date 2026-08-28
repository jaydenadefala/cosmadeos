"use client";

import * as React from "react";
import { toast } from "sonner";
import { SearchX } from "lucide-react";

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
import { ResearchItemCard } from "@/components/marketing/research-item-card";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  RESEARCH_CATEGORIES,
  archiveResearchItems,
  deleteResearchItem,
  toggleResearchItemFavorite,
  useResearchItems,
} from "@/lib/mock-data/research-items";

/**
 * Research — Marketing sidebar (05 Department Operating Systems/Marketing/
 * marketing-operating-system.md: "Research library"). A card grid, same
 * pattern as Knowledge/Playbooks — reference content to browse and read,
 * not a working record set.
 */
export default function ResearchPage() {
  const allItems = useResearchItems();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);

  const items = React.useMemo(() => allItems.filter((a) => !a.archived), [allItems]);

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
        options: RESEARCH_CATEGORIES.map((c) => ({ value: c, label: c })),
      },
      {
        id: "favorited",
        label: "Favorites",
        options: [{ value: "true", label: "Favorited only" }],
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q),
      );
    }
    if (filters.category) rows = rows.filter((a) => a.category === filters.category);
    if (filters.favorited === "true") rows = rows.filter((a) => a.favorited);
    return rows;
  }, [items, search, filters]);

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
        <h1 className="text-lg font-semibold">Research</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {items.length} items
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search research…"
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
            pageKey="marketing-research"
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
              archiveResearchItems(selected);
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteResearchItem(id));
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No research matches your search"
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
            {pagination.pageItems.map((item) => {
              const author = employeeById.get(item.authorId);
              return (
                <ResearchItemCard
                  key={item.id}
                  item={item}
                  authorName={author?.name ?? "—"}
                  authorInitials={author?.initials ?? "—"}
                  onToggleFavorite={() => toggleResearchItemFavorite(item.id)}
                  selected={selected.includes(item.id)}
                  onToggleSelect={() =>
                    setSelected((prev) =>
                      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
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
        itemLabel="items"
      />
    </div>
  );
}
