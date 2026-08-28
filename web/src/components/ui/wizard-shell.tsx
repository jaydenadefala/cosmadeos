"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  label: string;
  content: React.ReactNode;
  /** Return false (or reject) to block advancing past this step. */
  validate?: () => boolean | Promise<boolean>;
}

/**
 * Multi-Step Wizard Pattern — 03 Design Principles/interaction-patterns.md:
 * "Long workflows use guided steps... Every wizard supports: Save Draft,
 * Back, Forward, Exit, Resume Later, Progress Indicator, Validation."
 * "Resume Later" is realized as Save Draft + Exit together, not a separate
 * control — the source material doesn't specify a distinct mechanism.
 */
export function WizardShell({
  title,
  steps,
  currentStepIndex,
  onStepChange,
  onSaveDraft,
  onExit,
  onComplete,
  completeLabel = "Complete",
}: {
  title: string;
  steps: WizardStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onSaveDraft?: () => void;
  onExit?: () => void;
  onComplete?: () => void | Promise<void>;
  completeLabel?: string;
}) {
  const [validating, setValidating] = React.useState(false);
  const step = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  async function handleForward() {
    setValidating(true);
    try {
      const valid = step.validate ? await step.validate() : true;
      if (!valid) return;

      if (isLastStep) {
        await onComplete?.();
      } else {
        onStepChange(currentStepIndex + 1);
      }
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="bg-background sticky top-0 z-10 flex flex-col gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h1>
          {onSaveDraft ? (
            <Button variant="ghost" size="sm" onClick={onSaveDraft}>
              Save draft
            </Button>
          ) : null}
          {onExit ? (
            <ConfirmationDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label="Exit">
                  <X className="size-4" />
                </Button>
              }
              title="Exit this workflow?"
              description="Your progress is kept as a draft. You can resume later from where you left off."
              confirmLabel="Exit"
              onConfirm={onExit}
            />
          ) : null}
        </div>

        <ol className="flex items-center gap-1.5 overflow-x-auto">
          {steps.map((s, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <li key={s.id} className="flex shrink-0 items-center gap-1.5">
                {index > 0 ? <Separator className="w-4" /> : null}
                <button
                  type="button"
                  disabled={index > currentStepIndex}
                  onClick={() => index < currentStepIndex && onStepChange(index)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    isCurrent && "bg-accent text-accent-foreground",
                    isComplete && "text-foreground hover:bg-accent/60",
                    !isCurrent && !isComplete && "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full text-[10px]",
                      isCurrent && "bg-primary text-primary-foreground",
                      isComplete && "bg-primary/20 text-primary",
                      !isCurrent && !isComplete && "bg-muted",
                    )}
                  >
                    {isComplete ? <Check className="size-3" /> : index + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">{step.content}</div>

      <footer className="bg-background sticky bottom-0 flex items-center justify-between border-t px-4 py-3 sm:px-6">
        <Button
          variant="outline"
          disabled={currentStepIndex === 0}
          onClick={() => onStepChange(currentStepIndex - 1)}
        >
          Back
        </Button>
        <Button onClick={handleForward} disabled={validating}>
          {validating ? "Checking…" : isLastStep ? completeLabel : "Continue"}
        </Button>
      </footer>
    </div>
  );
}
