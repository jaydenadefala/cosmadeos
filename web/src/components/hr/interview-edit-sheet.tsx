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
import {
  INTERVIEW_TYPES,
  updateInterview,
  type Interview,
  type InterviewType,
} from "@/lib/mock-data/interviews";

/** Reschedule/edit panel for an Interview — a Sheet (side drawer), per ADR-003. */
export function InterviewEditSheet({
  interview,
  open,
  onOpenChange,
}: {
  interview: Interview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const employees = useEmployees();
  const [form, setForm] = React.useState({
    type: interview.type,
    scheduledDate: interview.scheduledDate,
    interviewerId: interview.interviewerId,
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        type: interview.type,
        scheduledDate: interview.scheduledDate,
        interviewerId: interview.interviewerId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateInterview(interview.id, form);
    toast.success("Interview rescheduled.");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reschedule interview</SheetTitle>
          <SheetDescription>Update the type, date, or interviewer.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="interview-type" label="Type">
            <Select
              value={form.type}
              onValueChange={(value) => value && setForm((f) => ({ ...f, type: value as InterviewType }))}
            >
              <SelectTrigger id="interview-type" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="interview-date" label="Scheduled date">
            <Input
              id="interview-date"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
            />
          </Field>
          <Field id="interview-interviewer" label="Interviewer">
            <Select
              value={form.interviewerId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, interviewerId: value }))}
            >
              <SelectTrigger id="interview-interviewer" className="w-full">
                <SelectValue>
                  {(value: string) => employees.find((e) => e.id === value)?.name ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {employees
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
        <SheetFooter>
          <Button onClick={save}>Save changes</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
