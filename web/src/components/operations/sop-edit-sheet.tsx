"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { updateSopDocument, type SopDocument } from "@/lib/mock-data/sop-documents";

/** Edit panel for an SOP — a Sheet (side drawer), per ADR-003. Saving pushes the prior content onto `versionHistory`. */
export function SopEditSheet({
  sop,
  open,
  onOpenChange,
}: {
  sop: SopDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = React.useState({
    title: sop.title,
    category: sop.category,
    summary: sop.summary,
    content: sop.content,
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({ title: sop.title, category: sop.category, summary: sop.summary, content: sop.content });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateSopDocument(sop.id, form);
    toast.success(`${form.title} saved — previous version kept in History.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit SOP</SheetTitle>
          <SheetDescription>
            Update &quot;{sop.title}&quot;. The previous version is kept in History.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-sop-title" label="Title">
            <Input
              id="edit-sop-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="edit-sop-category" label="Category">
            <Input
              id="edit-sop-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <Field id="edit-sop-summary" label="Summary">
            <Textarea
              id="edit-sop-summary"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={2}
            />
          </Field>
          <Field id="edit-sop-content" label="Content">
            <Textarea
              id="edit-sop-content"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8}
            />
          </Field>
        </div>
        <SheetFooter>
          <Button onClick={save}>Save changes</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
