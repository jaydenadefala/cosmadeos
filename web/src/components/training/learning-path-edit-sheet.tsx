"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { useCourses } from "@/lib/mock-data/courses";
import { addLearningPath, updateLearningPath, type LearningPath } from "@/lib/mock-data/learning-paths";

/** Create/Edit panel for a Learning Path — a Sheet (side drawer), per ADR-003. Courses are chosen in catalog order. */
export function LearningPathEditSheet({
  path,
  open,
  onOpenChange,
  onCreated,
}: {
  path?: LearningPath;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (path: LearningPath) => void;
}) {
  const courses = useCourses();
  const [form, setForm] = React.useState({
    title: path?.title ?? "",
    description: path?.description ?? "",
    targetDepartment: path?.targetDepartment ?? "",
    courseIds: path?.courseIds ?? ([] as string[]),
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens
      setForm({
        title: path?.title ?? "",
        description: path?.description ?? "",
        targetDepartment: path?.targetDepartment ?? "",
        courseIds: path?.courseIds ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function toggleCourse(courseId: string) {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(courseId) ? f.courseIds.filter((id) => id !== courseId) : [...f.courseIds, courseId],
    }));
  }

  function save() {
    if (!form.title.trim()) {
      toast.error("Give the learning path a title.");
      return;
    }
    if (path) {
      updateLearningPath(path.id, form);
      toast.success(`${form.title} saved.`);
    } else {
      const created = addLearningPath(form);
      toast.success(`${created.title} created.`);
      onCreated?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{path ? "Edit learning path" : "New learning path"}</SheetTitle>
          <SheetDescription>
            {path ? `Update ${path.title}'s curriculum.` : "Build a curriculum from existing courses."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="path-title" label="Title">
            <Input id="path-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field id="path-department" label="Target department (optional)">
            <Input
              id="path-department"
              placeholder="e.g. Engineering"
              value={form.targetDepartment}
              onChange={(e) => setForm((f) => ({ ...f, targetDepartment: e.target.value }))}
            />
          </Field>
          <Field id="path-description" label="Description">
            <Textarea
              id="path-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </Field>
          <div>
            <span className="text-sm font-medium">Courses in this path</span>
            <div className="mt-2 flex flex-col gap-2">
              {courses
                .filter((c) => !c.archived)
                .map((course) => (
                  <label key={course.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                    <Checkbox checked={form.courseIds.includes(course.id)} onCheckedChange={() => toggleCourse(course.id)} />
                    {course.title}
                  </label>
                ))}
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={save}>{path ? "Save changes" : "Create path"}</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
