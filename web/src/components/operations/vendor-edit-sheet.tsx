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
import { addVendor, updateVendor, VENDOR_CATEGORIES, type Vendor, type VendorCategory } from "@/lib/mock-data/vendors";

/** Create/Edit panel for a Vendor — a Sheet (side drawer), per ADR-003. */
export function VendorEditSheet({
  vendor,
  open,
  onOpenChange,
  onCreated,
}: {
  vendor?: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (vendor: Vendor) => void;
}) {
  const [form, setForm] = React.useState({
    name: vendor?.name ?? "",
    category: vendor?.category ?? ("Equipment Supplier" as VendorCategory),
    contactName: vendor?.contactName ?? "",
    contactEmail: vendor?.contactEmail ?? "",
    phone: vendor?.phone ?? "",
    notes: vendor?.notes ?? "",
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        name: vendor?.name ?? "",
        category: vendor?.category ?? "Equipment Supplier",
        contactName: vendor?.contactName ?? "",
        contactEmail: vendor?.contactEmail ?? "",
        phone: vendor?.phone ?? "",
        notes: vendor?.notes ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    if (!form.name.trim()) {
      toast.error("Give the vendor a name.");
      return;
    }
    if (vendor) {
      updateVendor(vendor.id, form);
      toast.success(`${form.name} saved.`);
    } else {
      const created = addVendor(form);
      toast.success(`${created.name} created.`);
      onCreated?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{vendor ? "Edit vendor" : "New vendor"}</SheetTitle>
          <SheetDescription>
            {vendor ? `Update ${vendor.name}'s details.` : "Add a new vendor."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="vendor-name" label="Vendor name">
            <Input
              id="vendor-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field id="vendor-category" label="Category">
            <Select
              value={form.category}
              onValueChange={(value) => value && setForm((f) => ({ ...f, category: value as VendorCategory }))}
            >
              <SelectTrigger id="vendor-category" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="vendor-contact-name" label="Contact name">
            <Input
              id="vendor-contact-name"
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            />
          </Field>
          <Field id="vendor-contact-email" label="Contact email">
            <Input
              id="vendor-contact-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
            />
          </Field>
          <Field id="vendor-phone" label="Phone">
            <Input
              id="vendor-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Field>
          <Field id="vendor-notes" label="Notes">
            <Textarea
              id="vendor-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
          </Field>
        </div>
        <SheetFooter>
          <Button onClick={save}>{vendor ? "Save changes" : "Create vendor"}</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
