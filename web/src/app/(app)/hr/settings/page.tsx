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
import { Switch } from "@/components/ui/switch";
import { setEmployeeAccess, useEmployees, type AccessLevel } from "@/lib/mock-data/employees";
import {
  addDepartment,
  removeDepartment,
  setWorkflowSetting,
  useDepartments,
  useHrWorkflowSettings,
} from "@/lib/mock-data/hr-settings";

const ACCESS_LEVELS: AccessLevel[] = ["Employee", "Manager", "Admin", "Owner"];

/**
 * Settings — one of the six authoritative HR sidebar sections
 * (05 Department Operating Systems/HR/hr-operating-system.md: "Settings is
 * one of the six authoritative grouping sections itself"). Real, editable
 * surfaces: per-employee Access Levels, the canonical Departments list
 * (used everywhere Employee.department is set), and workflow toggles.
 */
export default function HrSettingsPage() {
  const employees = useEmployees();
  const departments = useDepartments();
  const workflowSettings = useHrWorkflowSettings();
  const [newDepartment, setNewDepartment] = React.useState("");

  const activeEmployees = employees.filter((e) => !e.archived);

  function handleAddDepartment() {
    if (!newDepartment.trim()) return;
    addDepartment(newDepartment);
    toast.success(`${newDepartment.trim()} added.`);
    setNewDepartment("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Access levels, departments, and workflow preferences</p>
      </div>

      <div className="flex flex-col gap-8 p-4 sm:p-6">
        <div>
          <h2 className="mb-1 text-sm font-semibold">Access Levels</h2>
          <p className="text-muted-foreground mb-3 text-sm">
            Control what each employee can see and do across Cosmade OS.
          </p>
          <div className="flex flex-col divide-y rounded-lg border">
            {activeEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium">{employee.name}</p>
                  <p className="text-muted-foreground text-xs">{employee.title}</p>
                </div>
                <Select
                  value={employee.access}
                  onValueChange={(value) => {
                    if (!value) return;
                    setEmployeeAccess(employee.id, value as AccessLevel);
                    toast.success(`${employee.name} is now ${value}.`);
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue>{(value: string) => value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-1 text-sm font-semibold">Departments</h2>
          <p className="text-muted-foreground mb-3 text-sm">
            The canonical department list used across the Employee Directory.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {departments.map((department) => (
              <span
                key={department}
                className="bg-muted flex items-center gap-1.5 rounded-full py-1 pr-1 pl-3 text-sm"
              >
                {department}
                <button
                  aria-label={`Remove ${department}`}
                  onClick={() => {
                    removeDepartment(department);
                    toast.success(`${department} removed.`);
                  }}
                  className="hover:bg-background flex size-5 items-center justify-center rounded-full"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex max-w-sm items-center gap-2">
            <Input
              placeholder="New department name"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDepartment()}
            />
            <Button size="sm" className="gap-1.5" onClick={handleAddDepartment}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
        </div>

        <div>
          <h2 className="mb-1 text-sm font-semibold">Workflow Preferences</h2>
          <p className="text-muted-foreground mb-3 text-sm">
            Control automation and approval requirements across HR workflows.
          </p>
          <div className="flex flex-col divide-y rounded-lg border">
            <Field
              id="setting-leave-approval"
              label="Require manager approval for time off"
              className="flex-row items-center justify-between gap-4 p-3"
            >
              <Switch
                id="setting-leave-approval"
                checked={workflowSettings.requireManagerApprovalForLeave}
                onCheckedChange={(checked) => setWorkflowSetting("requireManagerApprovalForLeave", checked)}
              />
            </Field>
            <Field
              id="setting-onboarding-emails"
              label="Automatically send onboarding emails"
              className="flex-row items-center justify-between gap-4 p-3"
            >
              <Switch
                id="setting-onboarding-emails"
                checked={workflowSettings.autoSendOnboardingEmails}
                onCheckedChange={(checked) => setWorkflowSetting("autoSendOnboardingEmails", checked)}
              />
            </Field>
            <Field
              id="setting-job-listing-approval"
              label="Require approval before publishing new job listings"
              className="flex-row items-center justify-between gap-4 p-3"
            >
              <Switch
                id="setting-job-listing-approval"
                checked={workflowSettings.requireApprovalForNewJobListings}
                onCheckedChange={(checked) =>
                  setWorkflowSetting("requireApprovalForNewJobListings", checked)
                }
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
