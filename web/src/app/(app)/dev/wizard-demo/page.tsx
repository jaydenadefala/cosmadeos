"use client";

import { notFound } from "next/navigation";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WizardShell, type WizardStep } from "@/components/ui/wizard-shell";

/**
 * Dev-only verification harness for the Multi-Step Wizard Pattern (Phase 3),
 * modeled on the source material's own example: Employee Onboarding.
 */
export default function WizardDemo() {
  if (process.env.NODE_ENV === "production") notFound();

  const [stepIndex, setStepIndex] = React.useState(0);
  const [name, setName] = React.useState("");

  const steps: WizardStep[] = [
    {
      id: "personal-details",
      label: "Personal Details",
      content: (
        <div className="flex max-w-sm flex-col gap-1.5">
          <Label htmlFor="wizard-name">Full name</Label>
          <Input id="wizard-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
      ),
      validate: () => name.trim().length > 0,
    },
    {
      id: "employment",
      label: "Employment",
      content: <p className="text-muted-foreground text-sm">Employment details step content.</p>,
    },
    {
      id: "documents",
      label: "Documents",
      content: <p className="text-muted-foreground text-sm">Document upload step content.</p>,
    },
    {
      id: "review",
      label: "Review",
      content: (
        <p className="text-sm">
          Reviewing onboarding for <strong>{name || "(no name entered)"}</strong>.
        </p>
      ),
    },
  ];

  return (
    <WizardShell
      title="New Hire Onboarding"
      steps={steps}
      currentStepIndex={stepIndex}
      onStepChange={setStepIndex}
      onSaveDraft={() => {}}
      onExit={() => {}}
      onComplete={() => {}}
      completeLabel="Complete Onboarding"
    />
  );
}
