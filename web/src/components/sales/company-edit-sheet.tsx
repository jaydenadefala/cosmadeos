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
import { updateCompany, type Company, type CompanyStatus } from "@/lib/mock-data/companies";

const STATUS_OPTIONS: CompanyStatus[] = ["Customer", "Prospect", "Lost"];

/**
 * Edit panel for a Company — a Sheet (side drawer), per ADR-003: drawers are
 * for viewing/editing, never a full new page for a form this small.
 */
export function CompanyEditSheet({
  company,
  open,
  onOpenChange,
}: {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = React.useState(company);

  // Genuine external-prop sync: the Sheet is controlled by the parent's
  // `open` state (no internal SheetTrigger here), so there's no event
  // handler to hook into when it transitions open — this must be an effect.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm(company);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateCompany(company.id, {
      name: form.name,
      industry: form.industry,
      location: form.location,
      website: form.website,
      phone: form.phone,
      status: form.status,
    });
    toast.success(`${form.name} saved.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit company</SheetTitle>
          <SheetDescription>Update {company.name}&apos;s details.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-company-name" label="Name">
            <Input
              id="edit-company-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field id="edit-company-industry" label="Industry">
            <Input
              id="edit-company-industry"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            />
          </Field>
          <Field id="edit-company-location" label="Location">
            <Input
              id="edit-company-location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </Field>
          <Field id="edit-company-website" label="Website">
            <Input
              id="edit-company-website"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            />
          </Field>
          <Field id="edit-company-phone" label="Phone">
            <Input
              id="edit-company-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>
          <Field id="edit-company-status" label="Status">
            <Select
              value={form.status}
              onValueChange={(value) => value && setForm((f) => ({ ...f, status: value as CompanyStatus }))}
            >
              <SelectTrigger id="edit-company-status" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
