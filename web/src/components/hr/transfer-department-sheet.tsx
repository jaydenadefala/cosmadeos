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
import { updateEmployee, type Employee } from "@/lib/mock-data/employees";

/** Transfer Department — a Sheet (side drawer), per ADR-003: editing is a drawer job, not a modal. */
export function TransferDepartmentSheet({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [department, setDepartment] = React.useState(employee.department);
  const [title, setTitle] = React.useState(employee.title);

  // Genuine external-prop sync — see MEMORY.md / CompanyEditSheet precedent.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setDepartment(employee.department);
      setTitle(employee.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateEmployee(employee.id, { department, title });
    toast.success(`${employee.name} transferred to ${department}.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Transfer department</SheetTitle>
          <SheetDescription>Move {employee.name} to a new department or title.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="transfer-department" label="Department">
            <Input
              id="transfer-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </Field>
          <Field id="transfer-title" label="Title">
            <Input id="transfer-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>
        <SheetFooter>
          <Button onClick={save}>Save transfer</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
