"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, MoreHorizontal, Pencil, SearchX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { JobListingEditSheet } from "@/components/hr/job-listing-edit-sheet";
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
import { useApplicants } from "@/lib/mock-data/applicants";
import {
  archiveJobListings,
  deleteJobListing,
  duplicateJobListing,
  setJobListingStatus,
  useJobListings,
  type JobListing,
  type JobListingStatus,
} from "@/lib/mock-data/job-listings";

const STATUS_TONE: Record<JobListingStatus, string> = {
  Open: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Closed: "bg-muted text-foreground/70",
  Draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: JobListing[]) {
  const header = ["Title", "Department", "Location", "Type", "Status", "Posted"];
  const lines = rows.map((r) =>
    [r.title, r.department, r.location, r.employmentType, r.status, r.postedLabel]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "job-listings.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Job Listings — Recruitment sidebar group (05 Department Operating
 * Systems/HR/hr-operating-system.md). Applicant counts are derived live from
 * the applicants store, not stored redundantly on the listing itself.
 */
export default function JobListingsPage() {
  const allJobListings = useJobListings();
  const applicants = useApplicants();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editingListing, setEditingListing] = React.useState<JobListing | null>(null);
  const columnVisibility = useColumnVisibility([
    { id: "department", label: "Department" },
    { id: "location", label: "Location" },
    { id: "type", label: "Type" },
    { id: "applicants", label: "Applicants" },
  ]);

  const jobListings = React.useMemo(
    () => allJobListings.filter((j) => !j.archived),
    [allJobListings],
  );

  const applicantCountByListing = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const applicant of applicants) {
      if (applicant.archived) continue;
      counts.set(applicant.jobListingId, (counts.get(applicant.jobListingId) ?? 0) + 1);
    }
    return counts;
  }, [applicants]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "department",
        label: "Department",
        options: Array.from(new Set(jobListings.map((j) => j.department))).map((d) => ({
          value: d,
          label: d,
        })),
      },
      {
        id: "status",
        label: "Status",
        options: [
          { value: "Open", label: "Open" },
          { value: "Closed", label: "Closed" },
          { value: "Draft", label: "Draft" },
        ],
      },
    ],
    [jobListings],
  );

  const filtered = React.useMemo(() => {
    let rows = jobListings;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((j) => j.title.toLowerCase().includes(q));
    }
    if (filters.department) rows = rows.filter((j) => j.department === filters.department);
    if (filters.status) rows = rows.filter((j) => j.status === filters.status);
    return rows;
  }, [jobListings, search, filters]);

  const pagination = usePagination(filtered);

  function toggleStatus(id: string, current: JobListingStatus) {
    const next = current === "Open" ? "Closed" : "Open";
    setJobListingStatus(id, next);
    toast.success(`Listing ${next === "Open" ? "reopened" : "closed"}.`);
  }

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
        <h1 className="text-lg font-semibold">Job Listings</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {jobListings.length} listings
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search listings…"
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
            pageKey="hr-job-listings"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Job listings exported.");
        }}
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveJobListings(selected);
              toast.success(`${selected.length} listing${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteJobListing(id));
              toast.success(`${selected.length} listing${selected.length === 1 ? "" : "s"} deleted.`);
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
            title="No listings match your search"
            description="Try a different title or clear your filters."
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
                      pagination.pageItems.every((j) => selected.includes(j.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((j) => prev.includes(j.id))
                          ? prev.filter((id) => !pagination.pageItems.some((j) => j.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((j) => j.id)])],
                      )
                    }
                      aria-label="Select all listings"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  {columnVisibility.isVisible("department") ? <TableHead>Department</TableHead> : null}
                  {columnVisibility.isVisible("location") ? <TableHead>Location</TableHead> : null}
                  {columnVisibility.isVisible("type") ? <TableHead>Type</TableHead> : null}
                  <TableHead>Status</TableHead>
                  {columnVisibility.isVisible("applicants") ? <TableHead>Applicants</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((listing) => (
                  <TableRow
                    key={listing.id}
                    data-state={selected.includes(listing.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(listing.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(listing.id)
                              ? prev.filter((id) => id !== listing.id)
                              : [...prev, listing.id],
                          )
                        }
                        aria-label={`Select ${listing.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/hr/recruitment/job-listings/${listing.id}`}
                        className="hover:underline"
                      >
                        {listing.title}
                      </Link>
                    </TableCell>
                    {columnVisibility.isVisible("department") ? <TableCell>{listing.department}</TableCell> : null}
                    {columnVisibility.isVisible("location") ? <TableCell>{listing.location}</TableCell> : null}
                    {columnVisibility.isVisible("type") ? <TableCell>{listing.employmentType}</TableCell> : null}
                    <TableCell>
                      <Badge className={`border-0 font-medium ${STATUS_TONE[listing.status]}`}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    {columnVisibility.isVisible("applicants") ? (
                      <TableCell>{applicantCountByListing.get(listing.id) ?? 0}</TableCell>
                    ) : null}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${listing.title}`} />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingListing(listing)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const copy = duplicateJobListing(listing.id);
                              if (copy) toast.success(`${copy.title} created.`);
                            }}
                          >
                            <Copy className="size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(listing.id, listing.status)}>
                            {listing.status === "Open" ? "Close listing" : "Reopen listing"}
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
        itemLabel="listings"
      />
      {editingListing ? (
        <JobListingEditSheet
          jobListing={editingListing}
          open={!!editingListing}
          onOpenChange={(open) => !open && setEditingListing(null)}
        />
      ) : null}
    </div>
  );
}
