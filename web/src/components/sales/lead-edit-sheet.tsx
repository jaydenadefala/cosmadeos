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
import { useEmployees } from "@/lib/mock-data/employees";
import { updateLead, type Lead } from "@/lib/mock-data/leads";

/** Edit panel for a Lead — a Sheet (side drawer), per ADR-003. */
export function LeadEditSheet({
  lead,
  open,
  onOpenChange,
}: {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const employees = useEmployees();
  const [form, setForm] = React.useState(lead);

  // Genuine external-prop sync — see MEMORY.md / CompanyEditSheet precedent.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm(lead);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateLead(lead.id, {
      contactName: form.contactName,
      email: form.email,
      value: form.value,
      ownerId: form.ownerId,
    });
    toast.success(`${form.contactName} saved.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit deal</SheetTitle>
          <SheetDescription>Update {lead.contactName}&apos;s deal details.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-lead-contact" label="Contact name">
            <Input
              id="edit-lead-contact"
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            />
          </Field>
          <Field id="edit-lead-email" label="Email">
            <Input
              id="edit-lead-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field id="edit-lead-value" label="Deal value">
            <Input
              id="edit-lead-value"
              type="number"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))}
            />
          </Field>
          <Field id="edit-lead-owner" label="Owner">
            <Select
              value={form.ownerId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, ownerId: value }))}
            >
              <SelectTrigger id="edit-lead-owner" className="w-full">
                <SelectValue>
                  {(value: string) => employees.find((e) => e.id === value)?.name ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
