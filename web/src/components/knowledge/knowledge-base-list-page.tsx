"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { KnowledgeBaseCard } from "@/components/knowledge/knowledge-base-card";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveKnowledgeBaseEntries,
  deleteKnowledgeBaseEntry,
  toggleKnowledgeBaseFavorite,
  useKnowledgeBaseEntries,
  type KnowledgeBaseSection,
} from "@/lib/mock-data/knowledge-base";

/**
 * Shared list-page renderer for /knowledge/templates, /meeting-notes,
 * /lessons-learned, /best-practices — same store (knowledge-base.ts),
 * filtered by `section`. "New" routes to the Knowledge Editor New Page
 * (/knowledge/articles/new) rather than opening a dialog — the source doc
 * names "Knowledge Editor — a New Page pattern... never a modal" explicitly
 * for this workspace, unlike the lighter Dialog-based creation used by
 * Handbooks/SOPs/Playbooks elsewhere.
 */
export function KnowledgeBaseListPage({ section, title }: { section: KnowledgeBaseSection; title: string }) {
  const router = useRouter();
  const allEntries = useKnowledgeBaseEntries();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);

  const entries = React.useMemo(
    () => allEntries.filter((e) => !e.archived && e.section === section),
    [allEntries, section],
  );

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
        options: Array.from(new Set(entries.map((e) => e.category))).map((c) => ({ value: c, label: c })),
      },
      { id: "favorited", label: "Favorites", options: [{ value: "true", label: "Favorited only" }] },
    ],
    [entries],
  );

  const filtered = React.useMemo(() => {
    let rows = entries;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (e) => e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q) || e.content.toLowerCase().includes(q),
      );
    }
    if (filters.category) rows = rows.filter((e) => e.category === filters.category);
    if (filters.favorited === "true") rows = rows.filter((e) => e.favorited);
    return rows;
  }, [entries, search, filters]);

  const pagination = usePagination(filtered);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {entries.length} entr{entries.length === 1 ? "y" : "ies"}
        </p>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        onCreate={() => router.push(`/knowledge/articles/new?section=${encodeURIComponent(section)}`)}
        createLabel="New"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveKnowledgeBaseEntries(selected);
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteKnowledgeBaseEntry(id));
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={`No ${title.toLowerCase()} yet`}
            description={`Add your first ${title.toLowerCase().replace(/s$/, "")}.`}
            action={
              <Button size="sm" onClick={() => router.push(`/knowledge/articles/new?section=${encodeURIComponent(section)}`)}>
                New
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No entries match your search"
            description="Try a different term or clear your filters."
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
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {pagination.pageItems.map((entry) => {
              const author = employeeById.get(entry.authorId);
              const authorName = author?.name ?? "Unknown";
              const authorInitials = author?.initials ?? "?";
              return (
                <KnowledgeBaseCard
                  key={entry.id}
                  entry={entry}
                  authorName={authorName}
                  authorInitials={authorInitials}
                  onToggleFavorite={() => toggleKnowledgeBaseFavorite(entry.id)}
                  selected={selected.includes(entry.id)}
                  onToggleSelect={() =>
                    setSelected((prev) =>
                      prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : [...prev, entry.id],
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
        itemLabel="entries"
      />
    </div>
  );
}
