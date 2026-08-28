"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal, Star, Trash2 } from "lucide-react";

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
  DialogFooter,
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
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  REVIEW_STATUSES,
  archiveReviews,
  deleteReview,
  startReviewCycle,
  submitReview,
  usePerformanceReviews,
  type PerformanceReview,
  type ReviewStatus,
} from "@/lib/mock-data/performance-reviews";

const STATUS_TONE: Record<ReviewStatus, string> = {
  Draft: "bg-muted text-foreground/70",
  "In Progress": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

/**
 * Performance Reviews — Performance sidebar group (05 Department Operating
 * Systems/HR/hr-operating-system.md). Real Employee/reviewer cross-
 * references, full review-cycle lifecycle (start cycle → submit → closed).
 */
export default function PerformancePage() {
  const allReviews = usePerformanceReviews();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [startOpen, setStartOpen] = React.useState(false);
  const [startForm, setStartForm] = React.useState({ employeeId: "", reviewerId: "", cycle: "" });
  const [submittingReview, setSubmittingReview] = React.useState<PerformanceReview | null>(null);
  const [submitForm, setSubmitForm] = React.useState({ rating: "5", summary: "" });
  const columnVisibility = useColumnVisibility([
    { id: "reviewer", label: "Reviewer" },
    { id: "cycle", label: "Cycle" },
    { id: "rating", label: "Rating" },
  ]);

  const reviews = React.useMemo(() => allReviews.filter((r) => !r.archived), [allReviews]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [{ id: "status", label: "Status", options: REVIEW_STATUSES.map((s) => ({ value: s, label: s })) }],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = reviews;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => employeeById.get(r.employeeId)?.name.toLowerCase().includes(q));
    }
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);
    return rows;
  }, [reviews, search, filters, employeeById]);

  const pagination = usePagination(filtered);

  function handleStart() {
    if (!startForm.employeeId || !startForm.reviewerId || !startForm.cycle.trim()) {
      toast.error("Choose an employee, reviewer, and cycle name.");
      return;
    }
    startReviewCycle({
      employeeId: startForm.employeeId,
      reviewerId: startForm.reviewerId,
      cycle: startForm.cycle.trim(),
    });
    toast.success("Review cycle started.");
    setStartOpen(false);
    setStartForm({ employeeId: "", reviewerId: "", cycle: "" });
  }

  function handleSubmit() {
    if (!submittingReview) return;
    submitReview(submittingReview.id, Number(submitForm.rating), submitForm.summary);
    toast.success("Review submitted.");
    setSubmittingReview(null);
    setSubmitForm({ rating: "5", summary: "" });
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
        <h1 className="text-lg font-semibold">Performance Reviews</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {reviews.length} reviews
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee…"
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
            pageKey="hr-performance"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setStartOpen(true)}
        createLabel="Start Review Cycle"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveReviews(selected);
              toast.success(`${selected.length} review${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteReview(id));
              toast.success(`${selected.length} review${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No review cycles yet"
            description="Start a review cycle for an employee to begin tracking performance."
            action={
              <Button size="sm" onClick={() => setStartOpen(true)}>
                Start Review Cycle
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No reviews match your search"
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
                      pagination.pageItems.every((r) => selected.includes(r.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((r) => prev.includes(r.id))
                          ? prev.filter((id) => !pagination.pageItems.some((r) => r.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((r) => r.id)])],
                      )
                    }
                      aria-label="Select all reviews"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  {columnVisibility.isVisible("reviewer") ? <TableHead>Reviewer</TableHead> : null}
                  {columnVisibility.isVisible("cycle") ? <TableHead>Cycle</TableHead> : null}
                  {columnVisibility.isVisible("rating") ? <TableHead>Rating</TableHead> : null}
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((review) => {
                  const employee = employeeById.get(review.employeeId);
                  const reviewer = employeeById.get(review.reviewerId);
                  return (
                    <TableRow
                      key={review.id}
                      data-state={selected.includes(review.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(review.id)}
                          onCheckedChange={() =>
                            setSelected((prev) =>
                              prev.includes(review.id)
                                ? prev.filter((id) => id !== review.id)
                                : [...prev, review.id],
                            )
                          }
                          aria-label={`Select review for ${employee?.name ?? "employee"}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{employee?.name ?? "—"}</TableCell>
                      {columnVisibility.isVisible("reviewer") ? <TableCell>{reviewer?.name ?? "—"}</TableCell> : null}
                      {columnVisibility.isVisible("cycle") ? <TableCell>{review.cycle}</TableCell> : null}
                      {columnVisibility.isVisible("rating") ? (
                        <TableCell>{review.rating ? `${review.rating} / 5` : "—"}</TableCell>
                      ) : null}
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[review.status]}`}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${employee?.name ?? "review"}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {review.status !== "Completed" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSubmitForm({ rating: "5", summary: review.summary });
                                  setSubmittingReview(review);
                                }}
                              >
                                Submit Review
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => {
                                archiveReviews([review.id]);
                                toast.success("Review archived.");
                              }}
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                deleteReview(review.id);
                                toast.success("Review permanently deleted.");
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
        itemLabel="reviews"
      />

      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start review cycle</DialogTitle>
            <DialogDescription>Begin a performance review for an employee.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="review-employee" label="Employee">
              <Select
                value={startForm.employeeId}
                onValueChange={(value) => value && setStartForm((f) => ({ ...f, employeeId: value }))}
              >
                <SelectTrigger id="review-employee" className="w-full">
                  <SelectValue>
                    {(value: string) => employeeById.get(value)?.name ?? "Select an employee…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => !e.archived)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="review-reviewer" label="Reviewer">
              <Select
                value={startForm.reviewerId}
                onValueChange={(value) => value && setStartForm((f) => ({ ...f, reviewerId: value }))}
              >
                <SelectTrigger id="review-reviewer" className="w-full">
                  <SelectValue>
                    {(value: string) => employeeById.get(value)?.name ?? "Select a reviewer…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => !e.archived)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="review-cycle" label="Cycle name">
              <Input
                id="review-cycle"
                placeholder="e.g. H2 2026"
                value={startForm.cycle}
                onChange={(e) => setStartForm((f) => ({ ...f, cycle: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleStart}>Start cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!submittingReview} onOpenChange={(open) => !open && setSubmittingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit review</DialogTitle>
            <DialogDescription>
              {submittingReview ? employeeById.get(submittingReview.employeeId)?.name : ""} —{" "}
              {submittingReview?.cycle}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="submit-rating" label="Rating (1–5)">
              <Select
                value={submitForm.rating}
                onValueChange={(value) => value && setSubmitForm((f) => ({ ...f, rating: value }))}
              >
                <SelectTrigger id="submit-rating" className="w-full">
                  <SelectValue>{(value: string) => `${value} / 5`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="submit-summary" label="Summary">
              <Textarea
                id="submit-summary"
                value={submitForm.summary}
                onChange={(e) => setSubmitForm((f) => ({ ...f, summary: e.target.value }))}
                rows={5}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>Submit review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
