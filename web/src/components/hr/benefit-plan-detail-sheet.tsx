"use client";

import * as React from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  BENEFIT_CATEGORIES,
  enrollEmployee,
  updateBenefitPlan,
  waiveEmployee,
  type BenefitCategory,
  type BenefitPlan,
} from "@/lib/mock-data/benefit-plans";
import { useEmployees } from "@/lib/mock-data/employees";

const UNASSIGNED = "unassigned";

/** Edit + enrollment panel for a Benefit Plan — a Sheet (side drawer), per ADR-003. */
export function BenefitPlanDetailSheet({
  plan,
  open,
  onOpenChange,
}: {
  plan: BenefitPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const employees = useEmployees();
  const [form, setForm] = React.useState({
    name: plan.name,
    category: plan.category,
    provider: plan.provider,
    employeeCost: String(plan.employeeCost),
    employerCost: String(plan.employerCost),
    description: plan.description,
  });
  const [addEmployeeId, setAddEmployeeId] = React.useState(UNASSIGNED);

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        name: plan.name,
        category: plan.category,
        provider: plan.provider,
        employeeCost: String(plan.employeeCost),
        employerCost: String(plan.employerCost),
        description: plan.description,
      });
      setAddEmployeeId(UNASSIGNED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  const enrolledEmployees = plan.enrolledEmployeeIds
    .map((id) => employees.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => !!e);

  const availableEmployees = employees.filter(
    (e) => !e.archived && !plan.enrolledEmployeeIds.includes(e.id),
  );

  function save() {
    updateBenefitPlan(plan.id, {
      name: form.name,
      category: form.category,
      provider: form.provider,
      employeeCost: Number(form.employeeCost) || 0,
      employerCost: Number(form.employerCost) || 0,
      description: form.description,
    });
    toast.success(`${form.name} saved.`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit benefit plan</SheetTitle>
          <SheetDescription>Update &quot;{plan.name}&quot; and manage enrollment.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="benefit-name" label="Plan name">
            <Input
              id="benefit-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field id="benefit-category" label="Category">
            <Select
              value={form.category}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, category: value as BenefitCategory }))
              }
            >
              <SelectTrigger id="benefit-category" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BENEFIT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="benefit-provider" label="Provider">
            <Input
              id="benefit-provider"
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="benefit-employee-cost" label="Employee cost (₦/mo)">
              <Input
                id="benefit-employee-cost"
                type="number"
                min={0}
                value={form.employeeCost}
                onChange={(e) => setForm((f) => ({ ...f, employeeCost: e.target.value }))}
              />
            </Field>
            <Field id="benefit-employer-cost" label="Employer cost (₦/mo)">
              <Input
                id="benefit-employer-cost"
                type="number"
                min={0}
                value={form.employerCost}
                onChange={(e) => setForm((f) => ({ ...f, employerCost: e.target.value }))}
              />
            </Field>
          </div>
          <Field id="benefit-description" label="Description">
            <Textarea
              id="benefit-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </Field>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">
              Enrolled Employees ({enrolledEmployees.length})
            </h3>
            {enrolledEmployees.length === 0 ? (
              <p className="text-muted-foreground text-sm">No one enrolled yet.</p>
            ) : (
              <ul className="mb-3 flex flex-col gap-1.5">
                {enrolledEmployees.map((employee) => (
                  <li key={employee.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">{employee.initials}</AvatarFallback>
                      </Avatar>
                      {employee.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Waive ${employee.name}`}
                      onClick={() => {
                        waiveEmployee(plan.id, employee.id);
                        toast.success(`${employee.name} waived from ${plan.name}.`);
                      }}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2">
              <Select value={addEmployeeId} onValueChange={(v) => v && setAddEmployeeId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === UNASSIGNED
                        ? "Select an employee…"
                        : (employees.find((e) => e.id === value)?.name ?? "Select an employee…")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Select an employee…</SelectItem>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={addEmployeeId === UNASSIGNED}
                onClick={() => {
                  const employee = employees.find((e) => e.id === addEmployeeId);
                  if (!employee) return;
                  enrollEmployee(plan.id, employee.id);
                  toast.success(`${employee.name} enrolled in ${plan.name}.`);
                  setAddEmployeeId(UNASSIGNED);
                }}
              >
                Enroll
              </Button>
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={save}>Save changes</Button>
          <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
