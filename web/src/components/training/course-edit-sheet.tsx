"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  addCourse,
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  updateCourse,
  type Course,
  type CourseCategory,
  type CourseLevel,
} from "@/lib/mock-data/courses";

/** Create/Edit panel for a Course — a Sheet (side drawer), per ADR-003. Lesson authoring happens on the detail page. */
export function CourseEditSheet({
  course,
  open,
  onOpenChange,
  onCreated,
}: {
  course?: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (course: Course) => void;
}) {
  const employees = useEmployees();
  const [form, setForm] = React.useState({
    title: course?.title ?? "",
    category: course?.category ?? ("Compliance" as CourseCategory),
    description: course?.description ?? "",
    level: course?.level ?? ("Beginner" as CourseLevel),
    instructorId: course?.instructorId ?? "",
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens
      setForm({
        title: course?.title ?? "",
        category: course?.category ?? "Compliance",
        description: course?.description ?? "",
        level: course?.level ?? "Beginner",
        instructorId: course?.instructorId ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function save() {
    if (!form.title.trim()) {
      toast.error("Give the course a title.");
      return;
    }
    if (course) {
      updateCourse(course.id, form);
      toast.success(`${form.title} saved.`);
    } else {
      const created = addCourse(form);
      toast.success(`${created.title} created as a draft.`);
      onCreated?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{course ? "Edit course" : "New course"}</SheetTitle>
          <SheetDescription>
            {course ? `Update ${course.title}'s details.` : "Add a course to the catalog. Lessons are added from the course page."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="course-title" label="Title">
            <Input id="course-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field id="course-category" label="Category">
            <Select
              value={form.category}
              onValueChange={(value) => value && setForm((f) => ({ ...f, category: value as CourseCategory }))}
            >
              <SelectTrigger id="course-category" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COURSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="course-level" label="Level">
            <Select value={form.level} onValueChange={(value) => value && setForm((f) => ({ ...f, level: value as CourseLevel }))}>
              <SelectTrigger id="course-level" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COURSE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="course-instructor" label="Instructor">
            <Select
              value={form.instructorId || "none"}
              onValueChange={(value) => value && setForm((f) => ({ ...f, instructorId: value === "none" ? "" : value }))}
            >
              <SelectTrigger id="course-instructor" className="w-full">
                <SelectValue>
                  {(value: string) => (value === "none" || !value ? "Unassigned" : employees.find((e) => e.id === value)?.name ?? "Unassigned")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="course-description" label="Description">
            <Textarea
              id="course-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
            />
          </Field>
        </div>
        <SheetFooter>
          <Button onClick={save}>{course ? "Save changes" : "Create course"}</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
