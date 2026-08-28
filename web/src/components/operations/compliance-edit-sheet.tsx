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
  addComplianceItem,
  COMPLIANCE_CATEGORIES,
  updateComplianceItem,
  type ComplianceCategory,
  type ComplianceItem,
} from "@/lib/mock-data/compliance";

/** Create/Edit panel for a Compliance item — a Sheet (side drawer), per ADR-003. */
export function ComplianceEditSheet({
  item,
  open,
  onOpenChange,
  onCreated,
}: {
  item?: ComplianceItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (item: ComplianceItem) => void;
}) {
  const [form, setForm] = React.useState({
    title: item?.title ?? "",
    category: item?.category ?? ("Regulatory" as ComplianceCategory),
    dueDate: item?.dueDate ?? "",
    notes: item?.notes ?? "",
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        title: item?.title ?? "",
        category: item?.category ?? "Regulatory",
        dueDate: item?.dueDate ?? "",
        notes: item?.notes ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    if (!form.title.trim() || !form.dueDate) {
      toast.error("Enter a title and due date.");
      return;
    }
    if (item) {
      updateComplianceItem(item.id, form);
      toast.success(`${form.title} saved.`);
    } else {
      const created = addComplianceItem(form);
      toast.success(`${created.title} created.`);
      onCreated?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{item ? "Edit compliance item" : "New compliance item"}</SheetTitle>
          <SheetDescription>
            {item ? `Update ${item.title}.` : "Track a new regulatory or safety requirement."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="compliance-title" label="Title">
            <Input
              id="compliance-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="compliance-category" label="Category">
            <Select
              value={form.category}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, category: value as ComplianceCategory }))
              }
            >
              <SelectTrigger id="compliance-category" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COMPLIANCE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="compliance-due-date" label="Due date">
            <Input
              id="compliance-due-date"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </Field>
          <Field id="compliance-notes" label="Notes">
            <Textarea
              id="compliance-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={4}
            />
          </Field>
        </div>
        <SheetFooter>
          <Button onClick={save}>{item ? "Save changes" : "Create"}</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
