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
import { updatePolicyDocument, type PolicyDocument } from "@/lib/mock-data/policy-documents";

/** Edit panel for a Handbook/Policy document — a Sheet, per ADR-003. Saving pushes the prior content onto `versionHistory`. */
export function PolicyDocumentEditSheet({
  document,
  open,
  onOpenChange,
}: {
  document: PolicyDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = React.useState({
    title: document.title,
    summary: document.summary,
    content: document.content,
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({ title: document.title, summary: document.summary, content: document.content });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updatePolicyDocument(document.id, form);
    toast.success(`${form.title} saved — previous version kept in History.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit {document.docType.toLowerCase()}</SheetTitle>
          <SheetDescription>
            Update &quot;{document.title}&quot;. The previous version is kept in History.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-policy-title" label="Title">
            <Input
              id="edit-policy-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="edit-policy-summary" label="Summary">
            <Textarea
              id="edit-policy-summary"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={2}
            />
          </Field>
          <Field id="edit-policy-content" label="Content">
            <Textarea
              id="edit-policy-content"
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
