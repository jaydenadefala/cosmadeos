"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, MoreHorizontal, Pencil, Sparkles, Upload, Megaphone } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  archiveCampaigns,
  CAMPAIGN_CHANNELS,
  CAMPAIGN_STATUSES,
  deleteCampaign,
  duplicateCampaign,
  formatDate,
  importCampaigns,
  useCampaigns,
  type Campaign,
  type CampaignChannel,
  type CampaignStatus,
} from "@/lib/mock-data/campaigns";
import { useEmployees } from "@/lib/mock-data/employees";

const STATUS_TONE: Record<CampaignStatus, string> = {
  Draft: "bg-muted text-foreground/70",
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Completed: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

const EXAMPLE_CAMPAIGNS = [
  {
    name: "Product launch email sequence",
    description:
      "A 3-part email series announcing a new equipment line to existing customers, ending with a demo booking link.",
  },
  {
    name: "Trade show event campaign",
    description:
      "Pre-show teaser posts, an on-site lead-capture form, and a post-show nurture sequence for booth visitors.",
  },
  {
    name: "Compliance webinar",
    description:
      "A gated educational webinar positioning your team as the compliant, trustworthy vendor in a regulated market.",
  },
];

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Campaign[]) {
  const header = ["Name", "Channel", "Status", "Budget", "Start Date", "End Date"];
  const lines = rows.map((r) =>
    [r.name, r.channel, r.status, String(r.budget), r.startDate, r.endDate]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "campaigns.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Parses "name,channel,budget" rows, tolerating a header row and unknown channels (defaults to Content). */
function parseCampaignCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: { name: string; channel: CampaignChannel; budget: number }[] = [];
  for (const line of lines) {
    const [rawName, rawChannel, rawBudget] = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    if (!rawName || rawName.toLowerCase() === "name") continue;
    const channel = (CAMPAIGN_CHANNELS as readonly string[]).includes(rawChannel)
      ? (rawChannel as CampaignChannel)
      : "Content";
    rows.push({ name: rawName, channel, budget: Number(rawBudget) || 0 });
  }
  return rows;
}

/**
 * Campaigns — Marketing sidebar, default landing page for the workspace
 * (05 Department Operating Systems/Marketing/marketing-operating-system.md,
 * ADR-002: workspaces open on a working surface, not a dashboard). The true
 * zero-campaigns empty state matches the documented spec exactly
 * (03 Design Principles/states-and-feedback.md): Create / Import / View
 * Examples / Watch Tutorial / Generate with AI. "Watch Tutorial" and
 * "Generate with AI" are honestly non-functional placeholders — no video and
 * no AI backend exist yet — per CLAUDE.md's AI Philosophy ("AI actions are
 * never silent or fabricated"), they say so rather than faking output.
 */
export default function CampaignsPage() {
  const router = useRouter();
  const allCampaigns = useCampaigns();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [showExamples, setShowExamples] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const columnVisibility = useColumnVisibility([
    { id: "channel", label: "Channel" },
    { id: "status", label: "Status" },
    { id: "budget", label: "Budget" },
    { id: "dates", label: "Dates" },
    { id: "owner", label: "Owner" },
  ]);

  const campaigns = React.useMemo(() => allCampaigns.filter((c) => !c.archived), [allCampaigns]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "channel",
        label: "Channel",
        options: CAMPAIGN_CHANNELS.map((c) => ({ value: c, label: c })),
      },
      {
        id: "status",
        label: "Status",
        options: CAMPAIGN_STATUSES.map((s) => ({ value: s, label: s })),
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = campaigns;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (filters.channel) rows = rows.filter((c) => c.channel === filters.channel);
    if (filters.status) rows = rows.filter((c) => c.status === filters.status);
    return rows;
  }, [campaigns, search, filters]);

  const pagination = usePagination(filtered);

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

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then((text) => {
      const rows = parseCampaignCsv(text);
      if (rows.length === 0) {
        toast.error("No valid campaign rows found. Expected columns: name, channel, budget.");
        return;
      }
      const created = importCampaigns(rows);
      toast.success(`Imported ${created.length} campaign${created.length === 1 ? "" : "s"} as drafts.`);
    });
  }

  function handleGenerateWithAi() {
    toast.info("AI campaign generation isn't connected yet — this action is a placeholder.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileSelected}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Campaigns</h1>
          <p className="text-muted-foreground text-sm">
            Showing {filtered.length} out of {campaigns.length} campaigns
          </p>
        </div>
        {campaigns.length > 0 ? (
          <Button size="sm" onClick={() => router.push("/marketing/campaigns/new")}>
            New Campaign
          </Button>
        ) : null}
      </div>

      {campaigns.length > 0 ? (
        <>
          <PageToolbar
            density={density}
            onDensityChange={setDensity}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search campaigns…"
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
                pageKey="marketing-campaigns"
                snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
                onApply={applyView}
              />
            }
            columns={columnVisibility.columns}
            onColumnToggle={columnVisibility.toggle}
            onExport={() => {
              exportToCsv(filtered);
              toast.success("Campaigns exported.");
            }}
            onImport={handleImportClick}
            selectedCount={selected.length}
            onClearSelection={() => setSelected([])}
            bulkActions={[
              {
                label: "Archive",
                onClick: () => {
                  archiveCampaigns(selected);
                  toast.success(`${selected.length} campaign${selected.length === 1 ? "" : "s"} archived.`);
                  setSelected([]);
                },
              },
              {
                label: "Delete",
                variant: "destructive",
                onClick: () => {
                  selected.forEach((id) => deleteCampaign(id));
                  toast.success(`${selected.length} campaign${selected.length === 1 ? "" : "s"} deleted.`);
                  setSelected([]);
                },
              },
            ]}
          />
          <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />
        </>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto">
        {campaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No Campaigns Yet"
            description="Create your first campaign to start planning and tracking marketing work."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" onClick={() => router.push("/marketing/campaigns/new")}>
                  Create Campaign
                </Button>
                <Button size="sm" variant="outline" onClick={handleImportClick}>
                  <Upload className="size-3.5" />
                  Import Campaign
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowExamples(true)}>
                  View Examples
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("No tutorial video is available yet.")}
                >
                  Watch Tutorial
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleGenerateWithAi}>
                  <Sparkles className="size-3.5" />
                  Generate with AI
                </Button>
              </div>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No campaigns match your search"
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
                      pagination.pageItems.every((c) => selected.includes(c.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((c) => prev.includes(c.id))
                          ? prev.filter((id) => !pagination.pageItems.some((c) => c.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((c) => c.id)])],
                      )
                    }
                      aria-label="Select all campaigns"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {columnVisibility.isVisible("channel") ? <TableHead>Channel</TableHead> : null}
                  {columnVisibility.isVisible("status") ? <TableHead>Status</TableHead> : null}
                  {columnVisibility.isVisible("budget") ? <TableHead>Budget</TableHead> : null}
                  {columnVisibility.isVisible("dates") ? <TableHead>Dates</TableHead> : null}
                  {columnVisibility.isVisible("owner") ? <TableHead>Owner</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((campaign) => {
                  const designer = campaign.designerId ? employeeById.get(campaign.designerId) : undefined;
                  return (
                    <TableRow
                      key={campaign.id}
                      data-state={selected.includes(campaign.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(campaign.id)}
                          onCheckedChange={() =>
                            setSelected((prev) =>
                              prev.includes(campaign.id)
                                ? prev.filter((id) => id !== campaign.id)
                                : [...prev, campaign.id],
                            )
                          }
                          aria-label={`Select ${campaign.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/marketing/campaigns/${campaign.id}`} className="hover:underline">
                          {campaign.name}
                        </Link>
                      </TableCell>
                      {columnVisibility.isVisible("channel") ? <TableCell>{campaign.channel}</TableCell> : null}
                      {columnVisibility.isVisible("status") ? (
                        <TableCell>
                          <Badge className={`border-0 font-medium ${STATUS_TONE[campaign.status]}`}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                      ) : null}
                      {columnVisibility.isVisible("budget") ? (
                        <TableCell>${campaign.budget.toLocaleString()}</TableCell>
                      ) : null}
                      {columnVisibility.isVisible("dates") ? (
                        <TableCell className="text-muted-foreground text-xs">
                          {campaign.startDate ? formatDate(campaign.startDate) : "—"} –{" "}
                          {campaign.endDate ? formatDate(campaign.endDate) : "—"}
                        </TableCell>
                      ) : null}
                      {columnVisibility.isVisible("owner") ? (
                        <TableCell>{designer?.name ?? "Unassigned"}</TableCell>
                      ) : null}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${campaign.name}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/marketing/campaigns/${campaign.id}`)}
                            >
                              <Pencil className="size-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const copy = duplicateCampaign(campaign.id);
                                if (copy) toast.success(`${copy.name} created.`);
                              }}
                            >
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        itemLabel="campaigns"
      />

      <Dialog open={showExamples} onOpenChange={setShowExamples}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Example campaigns</DialogTitle>
            <DialogDescription>
              A few common campaign types to help you get started. These are illustrative — not real
              campaign data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 px-4 pb-4">
            {EXAMPLE_CAMPAIGNS.map((example) => (
              <div key={example.name} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{example.name}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">{example.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
