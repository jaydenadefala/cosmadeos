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
import { KnowledgeArticleCard } from "@/components/sales/knowledge-article-card";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveKnowledgeArticles,
  deleteKnowledgeArticle,
  toggleArticleFavorite,
  useKnowledgeArticles,
} from "@/lib/mock-data/knowledge-articles";

/**
 * Knowledge — Sales sidebar group (05 Department Operating Systems/Sales/
 * sales-operating-system.md). A card grid, same pattern as Playbooks — this
 * is reference content to browse and read, not a working record set, so the
 * Universal Toolbar's table-oriented controls (columns, density) are
 * intentionally omitted. See knowledge-articles.ts for how this is scoped
 * distinctly from Playbooks (reference material vs. process guides).
 */
export default function KnowledgePage() {
  const allArticles = useKnowledgeArticles();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);

  const articles = React.useMemo(() => allArticles.filter((a) => !a.archived), [allArticles]);

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
        options: Array.from(new Set(articles.map((a) => a.category))).map((c) => ({
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
    [articles],
  );

  const filtered = React.useMemo(() => {
    let rows = articles;
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
  }, [articles, search, filters]);

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
        <h1 className="text-lg font-semibold">Knowledge</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {articles.length} articles
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search knowledge…"
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
            pageKey="sales-knowledge"
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
              archiveKnowledgeArticles(selected);
              toast.success(`${selected.length} article${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteKnowledgeArticle(id));
              toast.success(`${selected.length} article${selected.length === 1 ? "" : "s"} deleted.`);
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
            title="No articles match your search"
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
            {pagination.pageItems.map((article) => {
              const author = employeeById.get(article.authorId);
              return (
                <KnowledgeArticleCard
                  key={article.id}
                  article={article}
                  authorName={author?.name ?? "—"}
                  authorInitials={author?.initials ?? "—"}
                  onToggleFavorite={() => toggleArticleFavorite(article.id)}
                  selected={selected.includes(article.id)}
                  onToggleSelect={() =>
                    setSelected((prev) =>
                      prev.includes(article.id)
                        ? prev.filter((id) => id !== article.id)
                        : [...prev, article.id],
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
        itemLabel="articles"
      />
    </div>
  );
}
