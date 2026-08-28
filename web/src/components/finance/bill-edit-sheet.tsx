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
import { addBill, BILL_CATEGORIES, updateBill, type Bill, type BillCategory } from "@/lib/mock-data/bills";
import { useVendors } from "@/lib/mock-data/vendors";

/** Create/Edit panel for a Bill — a Sheet (side drawer), per ADR-003. `vendorId` references a real Vendor (Operations). */
export function BillEditSheet({
  bill,
  open,
  onOpenChange,
  onCreated,
}: {
  bill?: Bill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (bill: Bill) => void;
}) {
  const vendors = useVendors();
  const [form, setForm] = React.useState({
    vendorId: bill?.vendorId ?? "",
    category: bill?.category ?? ("Rent" as BillCategory),
    amount: String(bill?.amount ?? ""),
    issueDate: bill?.issueDate ?? "",
    dueDate: bill?.dueDate ?? "",
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        vendorId: bill?.vendorId ?? "",
        category: bill?.category ?? "Rent",
        amount: String(bill?.amount ?? ""),
        issueDate: bill?.issueDate ?? "",
        dueDate: bill?.dueDate ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    if (!form.vendorId || !form.issueDate || !form.dueDate) {
      toast.error("Choose a vendor and both dates.");
      return;
    }
    const payload = {
      vendorId: form.vendorId,
      category: form.category,
      amount: Number(form.amount) || 0,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
    };
    if (bill) {
      updateBill(bill.id, payload);
      toast.success(`${bill.billNumber} saved.`);
    } else {
      const created = addBill(payload);
      toast.success(`${created.billNumber} created.`);
      onCreated?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{bill ? `Edit ${bill.billNumber}` : "New bill"}</SheetTitle>
          <SheetDescription>
            {bill ? "Update the bill details." : "Record a new vendor bill."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="bill-vendor" label="Vendor">
            <Select
              value={form.vendorId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, vendorId: value }))}
            >
              <SelectTrigger id="bill-vendor" className="w-full">
                <SelectValue>
                  {(value: string) => vendors.find((v) => v.id === value)?.name ?? "Select a vendor…"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {vendors
                  .filter((v) => !v.archived)
                  .map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="bill-category" label="Category">
            <Select
              value={form.category}
              onValueChange={(value) => value && setForm((f) => ({ ...f, category: value as BillCategory }))}
            >
              <SelectTrigger id="bill-category" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BILL_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="bill-amount" label="Amount (₦)">
            <Input
              id="bill-amount"
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="bill-issue-date" label="Issue date">
              <Input
                id="bill-issue-date"
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
              />
            </Field>
            <Field id="bill-due-date" label="Due date">
              <Input
                id="bill-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </Field>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={save}>{bill ? "Save changes" : "Create bill"}</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
