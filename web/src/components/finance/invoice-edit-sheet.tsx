"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

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
import { useCompanies } from "@/lib/mock-data/companies";
import { generateInvoice, updateInvoice, type Invoice, type InvoiceLineItem } from "@/lib/mock-data/invoices";

/**
 * Create/Edit panel for an Invoice — a Sheet (side drawer), per ADR-003.
 * Handles both create ("Generate Invoice," no `invoice` prop) and edit.
 */
export function InvoiceEditSheet({
  invoice,
  open,
  onOpenChange,
  onCreated,
}: {
  invoice?: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (invoice: Invoice) => void;
}) {
  const companies = useCompanies();
  const [companyId, setCompanyId] = React.useState(invoice?.companyId ?? "");
  const [issueDate, setIssueDate] = React.useState(invoice?.issueDate ?? "");
  const [dueDate, setDueDate] = React.useState(invoice?.dueDate ?? "");
  const [lineItems, setLineItems] = React.useState<InvoiceLineItem[]>(
    invoice?.lineItems ?? [{ description: "", amount: 0 }],
  );

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setCompanyId(invoice?.companyId ?? "");
      setIssueDate(invoice?.issueDate ?? "");
      setDueDate(invoice?.dueDate ?? "");
      setLineItems(invoice?.lineItems ?? [{ description: "", amount: 0 }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  function updateLineItem(index: number, updates: Partial<InvoiceLineItem>) {
    setLineItems((items) => items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function addLineItem() {
    setLineItems((items) => [...items, { description: "", amount: 0 }]);
  }

  function removeLineItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  function save() {
    const cleanItems = lineItems.filter((item) => item.description.trim());
    if (!companyId || !issueDate || !dueDate || cleanItems.length === 0) {
      toast.error("Choose a company, both dates, and at least one line item.");
      return;
    }
    if (invoice) {
      updateInvoice(invoice.id, { companyId, issueDate, dueDate, lineItems: cleanItems });
      toast.success(`${invoice.invoiceNumber} saved.`);
    } else {
      const created = generateInvoice({ companyId, issueDate, dueDate, lineItems: cleanItems });
      toast.success(`${created.invoiceNumber} created as a draft.`);
      onCreated?.(created);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{invoice ? `Edit ${invoice.invoiceNumber}` : "Generate invoice"}</SheetTitle>
          <SheetDescription>
            {invoice ? "Update the invoice details." : "Create a new draft invoice."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="invoice-company" label="Company">
            <Select value={companyId} onValueChange={(value) => value && setCompanyId(value)}>
              <SelectTrigger id="invoice-company" className="w-full">
                <SelectValue>
                  {(value: string) => companies.find((c) => c.id === value)?.name ?? "Select a company…"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {companies
                  .filter((c) => !c.archived)
                  .map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="invoice-issue-date" label="Issue date">
              <Input
                id="invoice-issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </Field>
            <Field id="invoice-due-date" label="Due date">
              <Input
                id="invoice-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Line items</span>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addLineItem}>
                <Plus className="size-3.5" />
                Add item
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, { description: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={item.amount || ""}
                    onChange={(e) => updateLineItem(index, { amount: Number(e.target.value) || 0 })}
                    className="w-32"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove line item"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-end text-sm font-medium">
              Total: ${total.toLocaleString()}
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={save}>{invoice ? "Save changes" : "Create draft"}</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
