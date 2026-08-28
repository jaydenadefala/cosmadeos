"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Copy, GraduationCap, Pencil, Plus, Trash2, Upload, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CourseEditSheet } from "@/components/training/course-edit-sheet";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  addLesson,
  archiveCourses,
  deleteCourse,
  duplicateCourse,
  removeLesson,
  restoreCourse,
  setCourseStatus,
  useCourses,
} from "@/lib/mock-data/courses";
import { enrollInCourse, useCourseEnrollments } from "@/lib/mock-data/course-enrollments";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

/** Course detail page — Universal Object Layout instance for the "Training Course" object. */
export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const allCourses = useCourses();
  const allEmployees = useEmployees();
  const allEnrollments = useCourseEnrollments();
  const [editOpen, setEditOpen] = React.useState(false);
  const [lessonOpen, setLessonOpen] = React.useState(false);
  const [lessonForm, setLessonForm] = React.useState({ title: "", summary: "", durationMinutes: "" });
  const [enrollOpen, setEnrollOpen] = React.useState(false);
  const [enrollEmployeeId, setEnrollEmployeeId] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`course:${courseId}`);
  const course = allCourses.find((c) => c.id === courseId);
  if (!course) {
    if (deleting) return null;
    notFound();
  }

  const instructor = allEmployees.find((e) => e.id === course.instructorId);
  const enrollments = allEnrollments.filter((e) => e.courseId === course.id && !e.archived);
  const completedCount = enrollments.filter((e) => e.status === "Completed").length;

  function handleAddLesson() {
    if (!lessonForm.title.trim()) {
      toast.error("Give the lesson a title.");
      return;
    }
    addLesson(course!.id, {
      title: lessonForm.title.trim(),
      summary: lessonForm.summary.trim(),
      durationMinutes: Number(lessonForm.durationMinutes) || 0,
    });
    logHistory("added a lesson", lessonForm.title.trim());
    toast.success(`"${lessonForm.title.trim()}" added to ${course!.title}.`);
    setLessonOpen(false);
    setLessonForm({ title: "", summary: "", durationMinutes: "" });
  }

  function handleEnroll() {
    if (!enrollEmployeeId) {
      toast.error("Choose an employee to enroll.");
      return;
    }
    enrollInCourse({ courseId: course!.id, employeeId: enrollEmployeeId });
    logHistory("enrolled an employee");
    toast.success("Employee enrolled.");
    setEnrollOpen(false);
    setEnrollEmployeeId("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {course.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${course.title}" is archived.`}
          onRestore={() => {
            restoreCourse(course.id);
            logHistory("restored this record");
            toast.success(`"${course.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteCourse(course.id);
            toast.success(`"${course.title}" permanently deleted.`);
            router.push("/training/courses");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={GraduationCap}
            name={course.title}
            status={{ label: course.status }}
            owner={instructor ? { name: instructor.name, initials: instructor.initials } : undefined}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              {
                label: course.status === "Published" ? "Unpublish" : "Publish",
                onClick: () => {
                  const next = course.status === "Published" ? "Draft" : "Published";
                  setCourseStatus(course.id, next);
                  logHistory(next === "Published" ? "published this course" : "unpublished this course");
                  toast.success(`${course.title} ${next === "Published" ? "published" : "unpublished"}.`);
                },
              },
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateCourse(course.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.title} created.`);
                    router.push(`/training/courses/${copy.id}`);
                  }
                },
              },
              {
                label: course.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (course.archived) {
                    restoreCourse(course.id);
                    logHistory("restored this record");
                    toast.success(`"${course.title}" was restored.`);
                  } else {
                    archiveCourses([course.id]);
                    logHistory("archived this record");
                    toast.success(`"${course.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Category" value={course.category} icon={GraduationCap} />
            <MetricCard label="Level" value={course.level} />
            <MetricCard label="Lessons" value={String(course.lessons.length)} />
            <MetricCard label="Enrolled" value={String(enrollments.length)} icon={Users} />
            <MetricCard label="Completed" value={String(completedCount)} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-2xl flex-col gap-5">
              <p className="text-muted-foreground text-sm">{course.description}</p>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Lessons</h3>
                  <Button size="sm" variant="outline" onClick={() => setLessonOpen(true)}>
                    <Upload className="size-4" />
                    Upload Lesson
                  </Button>
                </div>
                {course.lessons.length === 0 ? (
                  <EmptyState
                    title="No lessons yet"
                    description="Upload the first lesson to start building this course."
                    action={
                      <Button size="sm" onClick={() => setLessonOpen(true)}>
                        <Upload className="size-4" />
                        Upload Lesson
                      </Button>
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    {course.lessons.map((lesson, i) => (
                      <div key={lesson.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                        <div>
                          <span className="text-sm font-medium">
                            {i + 1}. {lesson.title}
                          </span>
                          <p className="text-muted-foreground mt-1 text-xs">{lesson.summary}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {lesson.durationMinutes} min
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={`Remove ${lesson.title}`}
                            onClick={() => {
                              removeLesson(course!.id, lesson.id);
                              toast.success(`"${lesson.title}" removed.`);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Enrolled employees</h3>
                  <Button size="sm" variant="outline" onClick={() => setEnrollOpen(true)}>
                    <Plus className="size-4" />
                    Assign Training
                  </Button>
                </div>
                {enrollments.length === 0 ? (
                  <EmptyState title="No one enrolled yet" description="Assign this course to an employee to start tracking progress." />
                ) : (
                  <div className="flex flex-col gap-2">
                    {enrollments.map((enrollment) => {
                      const employee = allEmployees.find((e) => e.id === enrollment.employeeId);
                      return (
                        <div key={enrollment.id} className="flex items-center justify-between rounded-lg border p-3">
                          <span className="text-sm font-medium">{employee?.name ?? "—"}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-xs">{enrollment.progressPercent}%</span>
                            <Badge variant="outline" className="font-normal">
                              {enrollment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ),
          activity: <EntityComments entityKey={`course:${course.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="training" contextLabel="this course" />,
          history: <RecordHistory entityKey={`course:${course.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete "${course.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteCourse(course.id);
                toast.success(`"${course.title}" permanently deleted.`);
                router.push("/training/courses");
              }}
            />
          ),
        }}
      />

      <CourseEditSheet course={course} open={editOpen} onOpenChange={setEditOpen} />

      <Dialog open={lessonOpen} onOpenChange={setLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload lesson</DialogTitle>
            <DialogDescription>Add a lesson to {course.title}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="lesson-title" label="Title">
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>
            <Field id="lesson-summary" label="Summary">
              <Textarea
                id="lesson-summary"
                value={lessonForm.summary}
                onChange={(e) => setLessonForm((f) => ({ ...f, summary: e.target.value }))}
                rows={3}
              />
            </Field>
            <Field id="lesson-duration" label="Duration (minutes)">
              <Input
                id="lesson-duration"
                type="number"
                min={0}
                value={lessonForm.durationMinutes}
                onChange={(e) => setLessonForm((f) => ({ ...f, durationMinutes: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleAddLesson}>Add lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign training</DialogTitle>
            <DialogDescription>Enroll an employee in {course.title}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="enroll-employee" label="Employee">
              <Select value={enrollEmployeeId} onValueChange={(value) => value && setEnrollEmployeeId(value)}>
                <SelectTrigger id="enroll-employee" className="w-full">
                  <SelectValue>
                    {(value: string) => allEmployees.find((e) => e.id === value)?.name ?? "Select an employee…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allEmployees
                    .filter((e) => !e.archived)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleEnroll}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
