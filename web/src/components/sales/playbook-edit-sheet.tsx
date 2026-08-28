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
import { updatePlaybook, type Playbook } from "@/lib/mock-data/playbooks";

/** Edit panel for a Playbook — a Sheet (side drawer), per ADR-003. Saving pushes the prior content onto `versionHistory`. */
export function PlaybookEditSheet({
  playbook,
  open,
  onOpenChange,
}: {
  playbook: Playbook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = React.useState({
    title: playbook.title,
    category: playbook.category,
    summary: playbook.summary,
    stepsText: playbook.steps.join("\n"),
  });

  // Genuine external-prop sync — see MEMORY.md / CompanyEditSheet precedent.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        title: playbook.title,
        category: playbook.category,
        summary: playbook.summary,
        stepsText: playbook.steps.join("\n"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updatePlaybook(playbook.id, {
      title: form.title,
      category: form.category,
      summary: form.summary,
      steps: form.stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    toast.success(`${form.title} saved — previous version kept in History.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit playbook</SheetTitle>
          <SheetDescription>
            Update &quot;{playbook.title}&quot;. The previous version is kept in History.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-playbook-title" label="Title">
            <Input
              id="edit-playbook-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="edit-playbook-category" label="Category">
            <Input
              id="edit-playbook-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <Field id="edit-playbook-summary" label="Summary">
            <Textarea
              id="edit-playbook-summary"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={3}
            />
          </Field>
          <Field id="edit-playbook-steps" label="Steps (one per line)">
            <Textarea
              id="edit-playbook-steps"
              value={form.stepsText}
              onChange={(e) => setForm((f) => ({ ...f, stepsText: e.target.value }))}
              rows={6}
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
