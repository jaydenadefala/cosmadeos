"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { CourseEditSheet } from "@/components/training/course-edit-sheet";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveCourses,
  COURSE_CATEGORIES,
  COURSE_STATUSES,
  deleteCourse,
  duplicateCourse,
  setCourseStatus,
  useCourses,
  type Course,
  type CourseStatus,
} from "@/lib/mock-data/courses";

const STATUS_TONE: Record<CourseStatus, string> = {
  Draft: "bg-muted text-foreground/70",
  Published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Archived: "bg-muted text-foreground/70",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Course[], instructorName: (id?: string) => string) {
  const header = ["Title", "Category", "Level", "Instructor", "Lessons", "Status"];
  const lines = rows.map((r) =>
    [r.title, r.category, r.level, instructorName(r.instructorId), String(r.lessons.length), r.status]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "courses.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Courses — Training Center sidebar (05 Department Operating Systems/
 * Training/training-operating-system.md: "Course catalog... as the primary
 * table/board surface"). CLAUDE.md's Training action set: "Create Course."
 */
export default function CoursesPage() {
  const router = useRouter();
  const allCourses = useCourses();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<"title-asc" | "title-desc">("title-asc");
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const columnVisibility = useColumnVisibility([
    { id: "category", label: "Category" },
    { id: "level", label: "Level" },
    { id: "instructor", label: "Instructor" },
    { id: "lessons", label: "Lessons" },
  ]);

  const courses = React.useMemo(() => allCourses.filter((c) => !c.archived), [allCourses]);

  const instructorById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const instructorName = React.useCallback(
    (id?: string) => (id ? instructorById.get(id)?.name ?? "—" : "Unassigned"),
    [instructorById],
  );

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "category", label: "Category", options: COURSE_CATEGORIES.map((c) => ({ value: c, label: c })) },
      { id: "status", label: "Status", options: COURSE_STATUSES.map((s) => ({ value: s, label: s })) },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = courses;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (filters.category) rows = rows.filter((c) => c.category === filters.category);
    if (filters.status) rows = rows.filter((c) => c.status === filters.status);
    rows = [...rows].sort((a, b) =>
      sort === "title-asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title),
    );
    return rows;
  }, [courses, search, filters, sort]);

  const pagination = usePagination(filtered);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.sort === "title-asc" || snapshot.sort === "title-desc") setSort(snapshot.sort);
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
        <h1 className="text-lg font-semibold">Courses</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {courses.length} courses
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search courses…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        sortOptions={[
          { label: "Title (A–Z)", onSelect: () => setSort("title-asc") },
          { label: "Title (Z–A)", onSelect: () => setSort("title-desc") },
        ]}
        savedViewsControl={
          <SavedViewsMenu
            pageKey="training-courses"
            snapshot={{ search, filters, sort, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onExport={() => {
          exportToCsv(filtered, instructorName);
          toast.success("Courses exported.");
        }}
        onRefresh={handleRefresh}
        onCreate={() => setCreateOpen(true)}
        createLabel="Create Course"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveCourses(selected);
              toast.success(`${selected.length} course${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteCourse(id));
              toast.success(`${selected.length} course${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No courses yet"
            description="Create your first course to start building the catalog."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Create Course
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No courses match your search"
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
                      aria-label="Select all courses"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  {columnVisibility.isVisible("level") ? <TableHead>Level</TableHead> : null}
                  {columnVisibility.isVisible("instructor") ? <TableHead>Instructor</TableHead> : null}
                  {columnVisibility.isVisible("lessons") ? <TableHead>Lessons</TableHead> : null}
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((course) => (
                  <TableRow key={course.id} data-state={selected.includes(course.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(course.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(course.id) ? prev.filter((id) => id !== course.id) : [...prev, course.id],
                          )
                        }
                        aria-label={`Select ${course.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/training/courses/${course.id}`} className="hover:underline">
                        {course.title}
                      </Link>
                    </TableCell>
                    {columnVisibility.isVisible("category") ? <TableCell>{course.category}</TableCell> : null}
                    {columnVisibility.isVisible("level") ? <TableCell>{course.level}</TableCell> : null}
                    {columnVisibility.isVisible("instructor") ? (
                      <TableCell>{instructorName(course.instructorId)}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("lessons") ? <TableCell>{course.lessons.length}</TableCell> : null}
                    <TableCell>
                      <Badge className={`border-0 font-medium ${STATUS_TONE[course.status]}`}>{course.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" aria-label={`Actions for ${course.title}`} />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/training/courses/${course.id}`)}>
                            Open
                          </DropdownMenuItem>
                          {course.status !== "Published" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setCourseStatus(course.id, "Published");
                                toast.success(`${course.title} published.`);
                              }}
                            >
                              Publish
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setCourseStatus(course.id, "Draft");
                                toast.success(`${course.title} unpublished.`);
                              }}
                            >
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              const copy = duplicateCourse(course.id);
                              if (copy) toast.success(`${copy.title} created.`);
                            }}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              archiveCourses([course.id]);
                              toast.success(`${course.title} archived.`);
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteCourse(course.id);
                              toast.success(`${course.title} permanently deleted.`);
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete permanently
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
        itemLabel="courses"
      />

      <CourseEditSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(course) => router.push(`/training/courses/${course.id}`)}
      />
    </div>
  );
}
