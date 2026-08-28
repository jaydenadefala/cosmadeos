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
import {
  RESEARCH_CATEGORIES,
  updateResearchItem,
  type ResearchCategory,
  type ResearchItem,
} from "@/lib/mock-data/research-items";

/** Edit panel for a Research item — a Sheet (side drawer), per ADR-003. Saving pushes the prior content onto `versionHistory`. */
export function ResearchItemEditSheet({
  item,
  open,
  onOpenChange,
}: {
  item: ResearchItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = React.useState({
    title: item.title,
    category: item.category,
    summary: item.summary,
    content: item.content,
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        title: item.title,
        category: item.category,
        summary: item.summary,
        content: item.content,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateResearchItem(item.id, form);
    toast.success(`${form.title} saved — previous version kept in History.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit research</SheetTitle>
          <SheetDescription>
            Update &quot;{item.title}&quot;. The previous version is kept in History.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-research-title" label="Title">
            <Input
              id="edit-research-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="edit-research-category" label="Category">
            <Select
              value={form.category}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, category: value as ResearchCategory }))
              }
            >
              <SelectTrigger id="edit-research-category" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RESEARCH_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="edit-research-summary" label="Summary">
            <Textarea
              id="edit-research-summary"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={2}
            />
          </Field>
          <Field id="edit-research-content" label="Content">
            <Textarea
              id="edit-research-content"
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
