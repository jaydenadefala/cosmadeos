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
import { updateApplicant, type Applicant } from "@/lib/mock-data/applicants";
import { useJobListings } from "@/lib/mock-data/job-listings";

/** Edit panel for an Applicant — a Sheet (side drawer), per ADR-003. */
export function ApplicantEditSheet({
  applicant,
  open,
  onOpenChange,
}: {
  applicant: Applicant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const jobListings = useJobListings();
  const [form, setForm] = React.useState(applicant);

  // Genuine external-prop sync — see MEMORY.md / CompanyEditSheet precedent.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm(applicant);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateApplicant(applicant.id, {
      name: form.name,
      email: form.email,
      jobListingId: form.jobListingId,
    });
    toast.success(`${form.name} saved.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit applicant</SheetTitle>
          <SheetDescription>Update {applicant.name}&apos;s details.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-applicant-name" label="Name">
            <Input
              id="edit-applicant-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field id="edit-applicant-email" label="Email">
            <Input
              id="edit-applicant-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field id="edit-applicant-job" label="Job listing">
            <Select
              value={form.jobListingId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, jobListingId: value }))}
            >
              <SelectTrigger id="edit-applicant-job" className="w-full">
                <SelectValue>
                  {(value: string) => jobListings.find((j) => j.id === value)?.title ?? value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {jobListings.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
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
