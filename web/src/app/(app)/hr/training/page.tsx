"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { GraduationCap, MoreHorizontal, Trash2 } from "lucide-react";

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
import { useCourses } from "@/lib/mock-data/courses";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  TRAINING_CATEGORIES,
  TRAINING_STATUSES,
  archiveTrainingAssignments,
  assignTraining,
  deleteTrainingAssignment,
  setTrainingStatus,
  useTrainingAssignments,
  type TrainingCategory,
  type TrainingStatus,
} from "@/lib/mock-data/training-assignments";

const STATUS_TONE: Record<TrainingStatus, string> = {
  "Not Started": "bg-muted text-foreground/70",
  "In Progress": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

/**
 * Training (HR-scoped) — Learning sidebar group (05 Department Operating
 * Systems/HR/hr-operating-system.md). Tracks which employee is assigned
 * which course and its completion status. Distinct from the top-level
 * Training Center workspace (course catalog/authoring), which is a separate,
 * still-unstarted workspace.
 */
export default function HrTrainingPage() {
  const allAssignments = useTrainingAssignments();
  const employees = useEmployees();
  const courses = useCourses();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignForm, setAssignForm] = React.useState({
    employeeId: "",
    courseId: "",
    category: "Compliance" as TrainingCategory,
    dueDate: "",
  });
  const columnVisibility = useColumnVisibility([
    { id: "category", label: "Category" },
    { id: "dueDate", label: "Due Date" },
  ]);

  const assignments = React.useMemo(() => allAssignments.filter((a) => !a.archived), [allAssignments]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const courseById = React.useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    for (const course of courses) map.set(course.id, course);
    return map;
  }, [courses]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "category", label: "Category", options: TRAINING_CATEGORIES.map((c) => ({ value: c, label: c })) },
      { id: "status", label: "Status", options: TRAINING_STATUSES.map((s) => ({ value: s, label: s })) },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = assignments;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (a) =>
          courseById.get(a.courseId)?.title.toLowerCase().includes(q) ||
          employeeById.get(a.employeeId)?.name.toLowerCase().includes(q),
      );
    }
    if (filters.category) rows = rows.filter((a) => a.category === filters.category);
    if (filters.status) rows = rows.filter((a) => a.status === filters.status);
    return rows;
  }, [assignments, search, filters, employeeById, courseById]);

  const pagination = usePagination(filtered);

  function handleAssign() {
    if (!assignForm.employeeId || !assignForm.courseId || !assignForm.dueDate) {
      toast.error("Choose an employee, course, and due date.");
      return;
    }
    assignTraining({
      employeeId: assignForm.employeeId,
      courseId: assignForm.courseId,
      category: assignForm.category,
      dueDate: assignForm.dueDate,
    });
    toast.success("Training assigned.");
    setAssignOpen(false);
    setAssignForm({ employeeId: "", courseId: "", category: "Compliance", dueDate: "" });
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
        <h1 className="text-lg font-semibold">Training</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {assignments.length} assignments
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by course or employee…"
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
            pageKey="hr-training"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setAssignOpen(true)}
        createLabel="Assign Training"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveTrainingAssignments(selected);
              toast.success(`${selected.length} assignment${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteTrainingAssignment(id));
              toast.success(`${selected.length} assignment${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {assignments.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No training assigned yet"
            description="Assign a course to an employee to start tracking completion."
            action={
              <Button size="sm" onClick={() => setAssignOpen(true)}>
                Assign Training
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No assignments match your search"
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
                      pagination.pageItems.every((a) => selected.includes(a.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((a) => prev.includes(a.id))
                          ? prev.filter((id) => !pagination.pageItems.some((a) => a.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((a) => a.id)])],
                      )
                    }
                      aria-label="Select all assignments"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Course</TableHead>
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  {columnVisibility.isVisible("dueDate") ? <TableHead>Due Date</TableHead> : null}
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((assignment) => {
                  const employee = employeeById.get(assignment.employeeId);
                  const course = courseById.get(assignment.courseId);
                  return (
                    <TableRow
                      key={assignment.id}
                      data-state={selected.includes(assignment.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(assignment.id)}
                          onCheckedChange={() =>
                            setSelected((prev) =>
                              prev.includes(assignment.id)
                                ? prev.filter((id) => id !== assignment.id)
                                : [...prev, assignment.id],
                            )
                          }
                          aria-label={`Select ${course?.title ?? "assignment"}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{employee?.name ?? "—"}</TableCell>
                      <TableCell>
                        {course ? (
                          <Link href={`/training/courses/${course.id}`} className="hover:underline">
                            {course.title}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      {columnVisibility.isVisible("category") ? <TableCell>{assignment.category}</TableCell> : null}
                      {columnVisibility.isVisible("dueDate") ? <TableCell>{assignment.dueDate}</TableCell> : null}
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[assignment.status]}`}>
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${course?.title ?? "assignment"}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {TRAINING_STATUSES.filter((s) => s !== assignment.status).map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => {
                                  setTrainingStatus(assignment.id, status);
                                  toast.success(`Marked as ${status}.`);
                                }}
                              >
                                Mark as {status}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              onClick={() => {
                                archiveTrainingAssignments([assignment.id]);
                                toast.success("Assignment archived.");
                              }}
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                deleteTrainingAssignment(assignment.id);
                                toast.success("Assignment permanently deleted.");
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
        itemLabel="assignments"
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign training</DialogTitle>
            <DialogDescription>Assign a course to an employee.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="assign-employee" label="Employee">
              <Select
                value={assignForm.employeeId}
                onValueChange={(value) => value && setAssignForm((f) => ({ ...f, employeeId: value }))}
              >
                <SelectTrigger id="assign-employee" className="w-full">
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
            <Field id="assign-course" label="Course">
              <Select
                value={assignForm.courseId}
                onValueChange={(value) => value && setAssignForm((f) => ({ ...f, courseId: value }))}
              >
                <SelectTrigger id="assign-course" className="w-full">
                  <SelectValue>{(value: string) => courseById.get(value)?.title ?? "Select a course…"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {courses
                    .filter((c) => !c.archived)
                    .map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="assign-category" label="Category">
              <Select
                value={assignForm.category}
                onValueChange={(value) =>
                  value && setAssignForm((f) => ({ ...f, category: value as TrainingCategory }))
                }
              >
                <SelectTrigger id="assign-category" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="assign-due-date" label="Due date">
              <Input
                id="assign-due-date"
                type="date"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
