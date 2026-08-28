"use client";

import * as React from "react";
import { toast } from "sonner";
import { CalendarClock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { InterviewEditSheet } from "@/components/hr/interview-edit-sheet";
import { useApplicants } from "@/lib/mock-data/applicants";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  INTERVIEW_OUTCOMES,
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  addInterview,
  archiveInterviews,
  cancelInterview,
  deleteInterview,
  recordOutcome,
  useInterviews,
  type Interview,
  type InterviewOutcome,
  type InterviewStatus,
  type InterviewType,
} from "@/lib/mock-data/interviews";
import { useJobListings } from "@/lib/mock-data/job-listings";

const STATUS_TONE: Record<InterviewStatus, string> = {
  Scheduled: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cancelled: "bg-muted text-foreground/70",
};

const OUTCOME_TONE: Record<InterviewOutcome, string> = {
  Pending: "bg-muted text-foreground/70",
  Advance: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Reject: "bg-destructive/10 text-destructive",
};

/**
 * Interviews — Recruitment sidebar group (05 Department Operating Systems/
 * HR/hr-operating-system.md, "Hire pipeline": Applicants/Interviews/Job
 * Listings/Careers Page). Real cross-references to Applicants (via
 * applicantId), Job Listings (derived through the applicant), and Employees
 * (interviewer) — CLAUDE.md's "Every Module Must Be Connected."
 */
export default function InterviewsPage() {
  const allInterviews = useInterviews();
  const applicants = useApplicants();
  const jobListings = useJobListings();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editingInterview, setEditingInterview] = React.useState<Interview | null>(null);
  const [outcomeInterview, setOutcomeInterview] = React.useState<Interview | null>(null);
  const [outcomeForm, setOutcomeForm] = React.useState<{ outcome: InterviewOutcome; notes: string }>({
    outcome: "Advance",
    notes: "",
  });
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleForm, setScheduleForm] = React.useState({
    applicantId: "",
    interviewerId: "",
    type: "Phone Screen" as InterviewType,
    scheduledDate: "",
  });
  const columnVisibility = useColumnVisibility([
    { id: "jobListing", label: "Job Listing" },
    { id: "type", label: "Type" },
    { id: "interviewer", label: "Interviewer" },
    { id: "date", label: "Date" },
    { id: "outcome", label: "Outcome" },
  ]);

  const interviews = React.useMemo(() => allInterviews.filter((i) => !i.archived), [allInterviews]);

  const applicantById = React.useMemo(() => {
    const map = new Map<string, (typeof applicants)[number]>();
    for (const applicant of applicants) map.set(applicant.id, applicant);
    return map;
  }, [applicants]);

  const jobListingById = React.useMemo(() => {
    const map = new Map<string, (typeof jobListings)[number]>();
    for (const job of jobListings) map.set(job.id, job);
    return map;
  }, [jobListings]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "type", label: "Type", options: INTERVIEW_TYPES.map((t) => ({ value: t, label: t })) },
      { id: "status", label: "Status", options: INTERVIEW_STATUSES.map((s) => ({ value: s, label: s })) },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = interviews;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((i) => applicantById.get(i.applicantId)?.name.toLowerCase().includes(q));
    }
    if (filters.type) rows = rows.filter((i) => i.type === filters.type);
    if (filters.status) rows = rows.filter((i) => i.status === filters.status);
    return rows;
  }, [interviews, search, filters, applicantById]);

  const pagination = usePagination(filtered);

  function handleSchedule() {
    if (!scheduleForm.applicantId || !scheduleForm.interviewerId || !scheduleForm.scheduledDate) {
      toast.error("Choose an applicant, interviewer, and date.");
      return;
    }
    addInterview(scheduleForm);
    toast.success("Interview scheduled.");
    setScheduleOpen(false);
    setScheduleForm({ applicantId: "", interviewerId: "", type: "Phone Screen", scheduledDate: "" });
  }

  function handleRecordOutcome() {
    if (!outcomeInterview) return;
    recordOutcome(outcomeInterview.id, outcomeForm.outcome, outcomeForm.notes);
    toast.success("Outcome recorded.");
    setOutcomeInterview(null);
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
        <h1 className="text-lg font-semibold">Interviews</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {interviews.length} interviews
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by applicant…"
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
            pageKey="hr-interviews"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setScheduleOpen(true)}
        createLabel="Schedule Interview"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveInterviews(selected);
              toast.success(`${selected.length} interview${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteInterview(id));
              toast.success(`${selected.length} interview${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {interviews.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No interviews scheduled yet"
            description="Schedule an interview for an applicant to start tracking the hire pipeline."
            action={
              <Button size="sm" onClick={() => setScheduleOpen(true)}>
                Schedule Interview
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No interviews match your search"
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
                      pagination.pageItems.every((i) => selected.includes(i.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((i) => prev.includes(i.id))
                          ? prev.filter((id) => !pagination.pageItems.some((i) => i.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((i) => i.id)])],
                      )
                    }
                      aria-label="Select all interviews"
                    />
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  {columnVisibility.isVisible("jobListing") ? <TableHead>Job Listing</TableHead> : null}
                  {columnVisibility.isVisible("type") ? <TableHead>Type</TableHead> : null}
                  {columnVisibility.isVisible("interviewer") ? <TableHead>Interviewer</TableHead> : null}
                  {columnVisibility.isVisible("date") ? <TableHead>Date</TableHead> : null}
                  <TableHead>Status</TableHead>
                  {columnVisibility.isVisible("outcome") ? <TableHead>Outcome</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((interview) => {
                  const applicant = applicantById.get(interview.applicantId);
                  const job = applicant ? jobListingById.get(applicant.jobListingId) : undefined;
                  const interviewer = employeeById.get(interview.interviewerId);
                  return (
                    <TableRow
                      key={interview.id}
                      data-state={selected.includes(interview.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(interview.id)}
                          onCheckedChange={() =>
                            setSelected((prev) =>
                              prev.includes(interview.id)
                                ? prev.filter((id) => id !== interview.id)
                                : [...prev, interview.id],
                            )
                          }
                          aria-label={`Select interview with ${applicant?.name ?? "applicant"}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{applicant?.name ?? "—"}</TableCell>
                      {columnVisibility.isVisible("jobListing") ? <TableCell>{job?.title ?? "—"}</TableCell> : null}
                      {columnVisibility.isVisible("type") ? <TableCell>{interview.type}</TableCell> : null}
                      {columnVisibility.isVisible("interviewer") ? (
                        <TableCell>{interviewer?.name ?? "—"}</TableCell>
                      ) : null}
                      {columnVisibility.isVisible("date") ? <TableCell>{interview.scheduledDate}</TableCell> : null}
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[interview.status]}`}>
                          {interview.status}
                        </Badge>
                      </TableCell>
                      {columnVisibility.isVisible("outcome") ? (
                        <TableCell>
                          <Badge className={`border-0 font-medium ${OUTCOME_TONE[interview.outcome]}`}>
                            {interview.outcome}
                          </Badge>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for interview with ${applicant?.name ?? "applicant"}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setOutcomeForm({ outcome: "Advance", notes: interview.notes });
                                setOutcomeInterview(interview);
                              }}
                            >
                              Record Outcome
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingInterview(interview)}>
                              <Pencil className="size-4" />
                              Reschedule
                            </DropdownMenuItem>
                            {interview.status !== "Cancelled" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  cancelInterview(interview.id);
                                  toast.success("Interview cancelled.");
                                }}
                              >
                                Cancel
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => {
                                archiveInterviews([interview.id]);
                                toast.success("Interview archived.");
                              }}
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                deleteInterview(interview.id);
                                toast.success("Interview permanently deleted.");
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
        itemLabel="interviews"
      />

      {editingInterview ? (
        <InterviewEditSheet
          interview={editingInterview}
          open={!!editingInterview}
          onOpenChange={(open) => !open && setEditingInterview(null)}
        />
      ) : null}

      <Dialog open={!!outcomeInterview} onOpenChange={(open) => !open && setOutcomeInterview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record interview outcome</DialogTitle>
            <DialogDescription>
              {outcomeInterview ? applicantById.get(outcomeInterview.applicantId)?.name : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="outcome-select" label="Outcome">
              <Select
                value={outcomeForm.outcome}
                onValueChange={(value) =>
                  value && setOutcomeForm((f) => ({ ...f, outcome: value as InterviewOutcome }))
                }
              >
                <SelectTrigger id="outcome-select" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_OUTCOMES.filter((o) => o !== "Pending").map((outcome) => (
                    <SelectItem key={outcome} value={outcome}>
                      {outcome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="outcome-notes" label="Notes">
              <Textarea
                id="outcome-notes"
                value={outcomeForm.notes}
                onChange={(e) => setOutcomeForm((f) => ({ ...f, notes: e.target.value }))}
                rows={4}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleRecordOutcome}>Save outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule interview</DialogTitle>
            <DialogDescription>Pick an applicant, interviewer, type, and date.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="schedule-applicant" label="Applicant">
              <Select
                value={scheduleForm.applicantId}
                onValueChange={(value) => value && setScheduleForm((f) => ({ ...f, applicantId: value }))}
              >
                <SelectTrigger id="schedule-applicant" className="w-full">
                  <SelectValue>
                    {(value: string) => applicantById.get(value)?.name ?? "Select an applicant…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {applicants
                    .filter((a) => !a.archived)
                    .map((applicant) => (
                      <SelectItem key={applicant.id} value={applicant.id}>
                        {applicant.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="schedule-interviewer" label="Interviewer">
              <Select
                value={scheduleForm.interviewerId}
                onValueChange={(value) => value && setScheduleForm((f) => ({ ...f, interviewerId: value }))}
              >
                <SelectTrigger id="schedule-interviewer" className="w-full">
                  <SelectValue>
                    {(value: string) => employeeById.get(value)?.name ?? "Select an interviewer…"}
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
            <Field id="schedule-type" label="Type">
              <Select
                value={scheduleForm.type}
                onValueChange={(value) =>
                  value && setScheduleForm((f) => ({ ...f, type: value as InterviewType }))
                }
              >
                <SelectTrigger id="schedule-type" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="schedule-date" label="Date">
              <Input
                id="schedule-date"
                type="date"
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm((f) => ({ ...f, scheduledDate: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleSchedule}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
