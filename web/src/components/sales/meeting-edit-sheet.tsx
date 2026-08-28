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
import { useEmployees } from "@/lib/mock-data/employees";
import { updateMeeting, type Meeting } from "@/lib/mock-data/meetings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Edit panel for a Meeting — a Sheet (side drawer), per ADR-003. Also serves as the Reschedule flow (editing the date/time label). */
export function MeetingEditSheet({
  meeting,
  open,
  onOpenChange,
}: {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const employees = useEmployees();
  const [form, setForm] = React.useState(meeting);

  // Genuine external-prop sync — see MEMORY.md / CompanyEditSheet precedent.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm(meeting);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateMeeting(meeting.id, {
      title: form.title,
      dateTimeLabel: form.dateTimeLabel,
      ownerId: form.ownerId,
    });
    toast.success(`${form.title} saved.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit meeting</SheetTitle>
          <SheetDescription>Update or reschedule &quot;{meeting.title}&quot;.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-meeting-title" label="Title">
            <Input
              id="edit-meeting-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="edit-meeting-datetime" label="Date & time">
            <Input
              id="edit-meeting-datetime"
              value={form.dateTimeLabel}
              onChange={(e) => setForm((f) => ({ ...f, dateTimeLabel: e.target.value }))}
            />
          </Field>
          <Field id="edit-meeting-owner" label="Owner">
            <Select
              value={form.ownerId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, ownerId: value }))}
            >
              <SelectTrigger id="edit-meeting-owner" className="w-full">
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
