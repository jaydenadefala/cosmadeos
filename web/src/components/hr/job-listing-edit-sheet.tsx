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
import { updateJobListing, type EmploymentType, type JobListing } from "@/lib/mock-data/job-listings";

const EMPLOYMENT_TYPES: EmploymentType[] = ["Full-time", "Part-time", "Contract"];

/** Edit panel for a Job Listing — a Sheet (side drawer), per ADR-003. */
export function JobListingEditSheet({
  jobListing,
  open,
  onOpenChange,
}: {
  jobListing: JobListing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = React.useState(jobListing);

  // Genuine external-prop sync — see MEMORY.md / CompanyEditSheet precedent.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm(jobListing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateJobListing(jobListing.id, {
      title: form.title,
      department: form.department,
      location: form.location,
      employmentType: form.employmentType,
      description: form.description,
    });
    toast.success(`${form.title} saved.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit job listing</SheetTitle>
          <SheetDescription>Update {jobListing.title}&apos;s details.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-job-title" label="Title">
            <Input
              id="edit-job-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="edit-job-department" label="Department">
            <Input
              id="edit-job-department"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </Field>
          <Field id="edit-job-location" label="Location">
            <Input
              id="edit-job-location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </Field>
          <Field id="edit-job-type" label="Employment type">
            <Select
              value={form.employmentType}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, employmentType: value as EmploymentType }))
              }
            >
              <SelectTrigger id="edit-job-type" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="edit-job-description" label="Description">
            <Textarea
              id="edit-job-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
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
