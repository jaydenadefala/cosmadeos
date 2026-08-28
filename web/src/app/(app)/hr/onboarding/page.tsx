"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardShell, type WizardStep } from "@/components/ui/wizard-shell";
import { addEmployee, useEmployees, type AccessLevel } from "@/lib/mock-data/employees";

const DRAFT_KEY = "cosmade-onboarding-draft";

interface OnboardingForm {
  fullName: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  managerId: string;
  startDate: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  access: AccessLevel;
  idDocumentName: string;
  offerLetterName: string;
  healthPlan: string;
  dependents: string;
  equipment: string[];
  trainingCourses: string[];
}

const EMPTY_FORM: OnboardingForm = {
  fullName: "",
  email: "",
  phone: "",
  title: "",
  department: "",
  managerId: "",
  startDate: "",
  employmentType: "Full-time",
  access: "Employee",
  idDocumentName: "",
  offerLetterName: "",
  healthPlan: "None",
  dependents: "0",
  equipment: [],
  trainingCourses: [],
};

const EQUIPMENT_OPTIONS = ["Laptop", "Monitor", "Phone", "Access Badge"];
const TRAINING_OPTIONS = ["Safety Training", "Compliance Training", "Product Training"];

/**
 * New Hire Onboarding — the source material's own worked example of the
 * Multi-Step Wizard Pattern (03 Design Principles/interaction-patterns.md):
 * Personal Details → Employment → Documents → Benefits → Equipment →
 * Training → Review → Complete. "Complete" here is the redirect to the new
 * employee's real profile, not a separate step.
 */
export default function NewHireOnboardingPage() {
  const router = useRouter();
  const employees = useEmployees();
  const [form, setForm] = React.useState<OnboardingForm>(EMPTY_FORM);
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    // Hydrating from an external system (localStorage) on mount is exactly
    // the documented exception to this rule — not a cascading-render risk.
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as { form: OnboardingForm; stepIndex: number };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(draft.form);
      setStepIndex(draft.stepIndex);
      toast("Resumed your saved draft.");
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  function update<K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleListValue(key: "equipment" | "trainingCourses", value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, stepIndex }));
  }

  const activeManagers = employees.filter((e) => !e.archived);
  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const steps: WizardStep[] = [
    {
      id: "personal-details",
      label: "Personal Details",
      validate: () => Boolean(form.fullName.trim() && form.email.includes("@")),
      content: (
        <div className="flex max-w-md flex-col gap-4">
          <Field id="fullName" label="Full name">
            <Input id="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jordan Blake" />
          </Field>
          <Field id="email" label="Email">
            <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jordan.blake@cosmademedical.com" />
          </Field>
          <Field id="phone" label="Phone">
            <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 010 1234" />
          </Field>
        </div>
      ),
    },
    {
      id: "employment",
      label: "Employment",
      validate: () => Boolean(form.title.trim() && form.department && form.startDate),
      content: (
        <div className="flex max-w-md flex-col gap-4">
          <Field id="title" label="Job title">
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Field Service Engineer" />
          </Field>
          <Field id="department" label="Department">
            <Select value={form.department} onValueChange={(v) => update("department", String(v))}>
              <SelectTrigger id="department" className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="manager" label="Manager">
            <Select value={form.managerId} onValueChange={(v) => update("managerId", String(v))}>
              <SelectTrigger id="manager" className="w-full">
                <SelectValue>
                  {(value: string) => activeManagers.find((m) => m.id === value)?.name ?? "Select a manager"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activeManagers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="startDate" label="Start date">
            <Input id="startDate" type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
          </Field>
          <Field id="employmentType" label="Employment type">
            <Select value={form.employmentType} onValueChange={(v) => update("employmentType", v as OnboardingForm["employmentType"])}>
              <SelectTrigger id="employmentType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="access" label="Access level">
            <Select value={form.access} onValueChange={(v) => update("access", v as AccessLevel)}>
              <SelectTrigger id="access" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      ),
    },
    {
      id: "documents",
      label: "Documents",
      content: (
        <div className="flex max-w-md flex-col gap-4">
          <Field id="idDocument" label="Government ID">
            <Input
              id="idDocument"
              type="file"
              onChange={(e) => update("idDocumentName", e.target.files?.[0]?.name ?? "")}
            />
            {form.idDocumentName ? (
              <p className="text-muted-foreground text-xs">Selected: {form.idDocumentName}</p>
            ) : null}
          </Field>
          <Field id="offerLetter" label="Signed offer letter">
            <Input
              id="offerLetter"
              type="file"
              onChange={(e) => update("offerLetterName", e.target.files?.[0]?.name ?? "")}
            />
            {form.offerLetterName ? (
              <p className="text-muted-foreground text-xs">Selected: {form.offerLetterName}</p>
            ) : null}
          </Field>
        </div>
      ),
    },
    {
      id: "benefits",
      label: "Benefits",
      content: (
        <div className="flex max-w-md flex-col gap-4">
          <Field id="healthPlan" label="Health plan">
            <Select value={form.healthPlan} onValueChange={(v) => update("healthPlan", String(v))}>
              <SelectTrigger id="healthPlan" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="dependents" label="Dependents">
            <Input
              id="dependents"
              type="number"
              min={0}
              value={form.dependents}
              onChange={(e) => update("dependents", e.target.value)}
            />
          </Field>
        </div>
      ),
    },
    {
      id: "equipment",
      label: "Equipment",
      content: (
        <div className="flex flex-col gap-3">
          {EQUIPMENT_OPTIONS.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.equipment.includes(item)}
                onCheckedChange={() => toggleListValue("equipment", item)}
              />
              {item}
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "training",
      label: "Training",
      content: (
        <div className="flex flex-col gap-3">
          {TRAINING_OPTIONS.map((item) => (
            <label key={item} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.trainingCourses.includes(item)}
                onCheckedChange={() => toggleListValue("trainingCourses", item)}
              />
              {item}
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "review",
      label: "Review",
      content: (
        <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{form.fullName || "—"}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd>{form.email || "—"}</dd>
          <dt className="text-muted-foreground">Title</dt>
          <dd>{form.title || "—"}</dd>
          <dt className="text-muted-foreground">Department</dt>
          <dd>{form.department || "—"}</dd>
          <dt className="text-muted-foreground">Manager</dt>
          <dd>{activeManagers.find((m) => m.id === form.managerId)?.name ?? "—"}</dd>
          <dt className="text-muted-foreground">Start date</dt>
          <dd>{form.startDate || "—"}</dd>
          <dt className="text-muted-foreground">Employment type</dt>
          <dd>{form.employmentType}</dd>
          <dt className="text-muted-foreground">Health plan</dt>
          <dd>{form.healthPlan}</dd>
          <dt className="text-muted-foreground">Equipment</dt>
          <dd>{form.equipment.join(", ") || "None"}</dd>
          <dt className="text-muted-foreground">Training</dt>
          <dd>{form.trainingCourses.join(", ") || "None"}</dd>
        </dl>
      ),
    },
  ];

  return (
    <WizardShell
      title="New Hire Onboarding"
      steps={steps}
      currentStepIndex={stepIndex}
      onStepChange={setStepIndex}
      onSaveDraft={() => {
        saveDraft();
        toast.success("Draft saved.");
      }}
      onExit={() => {
        saveDraft();
        router.push("/hr/directory");
      }}
      completeLabel="Complete Onboarding"
      onComplete={() => {
        const manager = activeManagers.find((m) => m.id === form.managerId);
        const employee = addEmployee({
          name: form.fullName,
          email: form.email,
          title: form.title,
          department: form.department,
          access: form.access,
          managerName: manager?.name,
          managerInitials: manager?.initials,
        });
        localStorage.removeItem(DRAFT_KEY);
        toast.success(`${employee.name} added — invite sent.`);
        router.push(`/hr/directory/${employee.id}`);
      }}
    />
  );
}
