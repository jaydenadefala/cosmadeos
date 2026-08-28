"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ClipboardCheck, MoreHorizontal, Trash2 } from "lucide-react";
import { useCourses } from "@/lib/mock-data/courses";
import { addAssessment, archiveAssessments, deleteAssessment, useAssessments } from "@/lib/mock-data/assessments";

/** CLAUDE.md's Training action set: "Create Quiz." Assessments — Training Center sidebar. */
export default function AssessmentsPage() {
  const router = useRouter();
  const allAssessments = useAssessments();
  const courses = useCourses();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", courseId: "", passingScorePercent: "70" });
  const columnVisibility = useColumnVisibility([
    { id: "course", label: "Course" },
    { id: "passingScore", label: "Passing score" },
    { id: "questions", label: "Questions" },
  ]);

  const assessments = React.useMemo(() => allAssessments.filter((a) => !a.archived), [allAssessments]);

  const courseById = React.useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    for (const course of courses) map.set(course.id, course);
    return map;
  }, [courses]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return assessments;
    const q = search.trim().toLowerCase();
    return assessments.filter((a) => a.title.toLowerCase().includes(q));
  }, [assessments, search]);

  const pagination = usePagination(filtered);

  function handleCreate() {
    if (!form.title.trim() || !form.courseId) {
      toast.error("Give the quiz a title and choose a course.");
      return;
    }
    const created = addAssessment({
      title: form.title.trim(),
      courseId: form.courseId,
      passingScorePercent: Number(form.passingScorePercent) || 70,
      questions: [],
    });
    toast.success(`${created.title} created.`);
    setCreateOpen(false);
    setForm({ title: "", courseId: "", passingScorePercent: "70" });
    router.push(`/training/assessments/${created.id}`);
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
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
        <h1 className="text-lg font-semibold">Assessments</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {assessments.length} assessments
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assessments…"
        savedViewsControl={
          <SavedViewsMenu
            pageKey="training-assessments"
            snapshot={{ search, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setCreateOpen(true)}
        createLabel="Create Quiz"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveAssessments(selected);
              toast.success(`${selected.length} assessment${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteAssessment(id));
              toast.success(`${selected.length} assessment${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {assessments.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title="No assessments yet"
            description="Create a quiz to test knowledge on a course."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Create Quiz
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No assessments match your search"
            description="Try a different name or clear your search."
            action={
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
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
                      aria-label="Select all assessments"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  {columnVisibility.isVisible("course") ? <TableHead>Course</TableHead> : null}
                  {columnVisibility.isVisible("passingScore") ? <TableHead>Passing score</TableHead> : null}
                  {columnVisibility.isVisible("questions") ? <TableHead>Questions</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((assessment) => (
                  <TableRow key={assessment.id} data-state={selected.includes(assessment.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(assessment.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(assessment.id) ? prev.filter((id) => id !== assessment.id) : [...prev, assessment.id],
                          )
                        }
                        aria-label={`Select ${assessment.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <button className="hover:underline" onClick={() => router.push(`/training/assessments/${assessment.id}`)}>
                        {assessment.title}
                      </button>
                    </TableCell>
                    {columnVisibility.isVisible("course") ? (
                      <TableCell>{courseById.get(assessment.courseId)?.title ?? "—"}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("passingScore") ? (
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {assessment.passingScorePercent}%
                        </Badge>
                      </TableCell>
                    ) : null}
                    {columnVisibility.isVisible("questions") ? (
                      <TableCell>{assessment.questions.length}</TableCell>
                    ) : null}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" aria-label={`Actions for ${assessment.title}`} />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/training/assessments/${assessment.id}`)}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              archiveAssessments([assessment.id]);
                              toast.success(`${assessment.title} archived.`);
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteAssessment(assessment.id);
                              toast.success(`${assessment.title} permanently deleted.`);
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
        itemLabel="assessments"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create quiz</DialogTitle>
            <DialogDescription>Questions are added from the quiz page after creation.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="quiz-title" label="Title">
              <Input id="quiz-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </Field>
            <Field id="quiz-course" label="Course">
              <Select value={form.courseId} onValueChange={(value) => value && setForm((f) => ({ ...f, courseId: value }))}>
                <SelectTrigger id="quiz-course" className="w-full">
                  <SelectValue>{(value: string) => courseById.get(value)?.title ?? "Select a course…"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="quiz-passing" label="Passing score (%)">
              <Input
                id="quiz-passing"
                type="number"
                min={0}
                max={100}
                value={form.passingScorePercent}
                onChange={(e) => setForm((f) => ({ ...f, passingScorePercent: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create quiz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
