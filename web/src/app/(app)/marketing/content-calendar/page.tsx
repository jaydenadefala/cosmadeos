"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/ui/calendar-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { ContentPostEditSheet } from "@/components/marketing/content-post-edit-sheet";
import { useCampaigns } from "@/lib/mock-data/campaigns";
import {
  CONTENT_STATUSES,
  CONTENT_TYPES,
  archiveContentPosts,
  deleteContentPost,
  duplicateContentPost,
  useContentPosts,
  type ContentPost,
  type ContentStatus,
} from "@/lib/mock-data/content-posts";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<ContentStatus, string> = {
  Draft: "bg-muted-foreground/40",
  Scheduled: "bg-sky-500",
  Published: "bg-emerald-500",
};

/**
 * Content Calendar — Marketing sidebar (05 Department Operating Systems/
 * Marketing/marketing-operating-system.md: "Content Calendar (Calendar View
 * Universal Workspace Component)"). Built on the new shared `CalendarView`
 * component (the platform's first Calendar View instance, parallel to
 * `KanbanBoard` as the first Board View). Clicking an empty day schedules a
 * new post on that date; clicking an existing post opens it for editing.
 */
export default function ContentCalendarPage() {
  const allPosts = useContentPosts();
  const campaigns = useCampaigns();
  const [month, setMonth] = React.useState(() => new Date());
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [editingPost, setEditingPost] = React.useState<ContentPost | null>(null);
  const [creatingDate, setCreatingDate] = React.useState<string | null>(null);

  const posts = React.useMemo(() => allPosts.filter((p) => !p.archived), [allPosts]);

  const campaignById = React.useMemo(() => {
    const map = new Map<string, (typeof campaigns)[number]>();
    for (const campaign of campaigns) map.set(campaign.id, campaign);
    return map;
  }, [campaigns]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "contentType", label: "Type", options: CONTENT_TYPES.map((t) => ({ value: t, label: t })) },
      { id: "status", label: "Status", options: CONTENT_STATUSES.map((s) => ({ value: s, label: s })) },
      {
        id: "campaignId",
        label: "Campaign",
        options: campaigns.map((c) => ({ value: c.id, label: c.name })),
      },
    ],
    [campaigns],
  );

  const filtered = React.useMemo(() => {
    let rows = posts;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (filters.contentType) rows = rows.filter((p) => p.contentType === filters.contentType);
    if (filters.status) rows = rows.filter((p) => p.status === filters.status);
    if (filters.campaignId) rows = rows.filter((p) => p.campaignId === filters.campaignId);
    return rows;
  }, [posts, search, filters]);

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Content Calendar</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} scheduled item{filtered.length === 1 ? "" : "s"} — click a day to add
            content
          </p>
        </div>
        <Button size="sm" onClick={() => setCreatingDate("")}>
          New Content
        </Button>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search content…"
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
            pageKey="marketing-content-calendar"
            snapshot={{ search, filters }}
            onApply={applyView}
          />
        }
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <CalendarView
        month={month}
        onMonthChange={setMonth}
        items={filtered}
        getItemDate={(post) => post.scheduledDate}
        onDayClick={(iso) => setCreatingDate(iso)}
        renderItem={(post) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  title={
                    post.campaignId ? campaignById.get(post.campaignId)?.name : undefined
                  }
                  className="hover:bg-accent flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[11px]"
                />
              }
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[post.status])} />
              <span className="truncate">{post.title}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setEditingPost(post)}>Open</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const copy = duplicateContentPost(post.id);
                  if (copy) toast.success(`${copy.title} created.`);
                }}
              >
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  archiveContentPosts([post.id]);
                  toast.success(`${post.title} archived.`);
                }}
              >
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  deleteContentPost(post.id);
                  toast.success(`${post.title} permanently deleted.`);
                }}
              >
                <Trash2 className="size-4" />
                Delete permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <div className="flex flex-wrap items-center gap-4 border-t px-4 py-2 sm:px-6">
        {CONTENT_STATUSES.map((status) => (
          <span key={status} className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
            {status}
          </span>
        ))}
      </div>

      {editingPost ? (
        <ContentPostEditSheet
          post={editingPost}
          open={!!editingPost}
          onOpenChange={(open) => !open && setEditingPost(null)}
        />
      ) : null}
      {creatingDate !== null ? (
        <ContentPostEditSheet
          defaultDate={creatingDate}
          open={creatingDate !== null}
          onOpenChange={(open) => !open && setCreatingDate(null)}
        />
      ) : null}
    </div>
  );
}
