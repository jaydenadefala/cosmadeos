"use client";

import * as React from "react";
import { Sparkles, ThumbsUp, ThumbsDown, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getSuggestionsForContext,
  type AIContextKind,
  type AISuggestion,
} from "@/lib/ai-context";

/**
 * AI Assistant Panel — 07 Enterprise AI/global-ai-experience.md.
 * A contextual suggestion list, not a chatbot: every response is a labeled
 * suggestion the user explicitly requests, reviews, and accepts or dismisses
 * — never an autonomous or unlabeled change (CLAUDE.md AI Philosophy).
 * Reused in two places: the App Shell's global panel (06 Platform Core/
 * app-shell.md) and every object detail page's "AI" tab (Universal Object
 * Layout) — one component, one behavior, per that document's own Components
 * list naming both as the same underlying capability.
 */
export function AIAssistantPanel({
  contextKind,
  contextLabel,
}: {
  contextKind: AIContextKind;
  contextLabel: string;
}) {
  const suggestions = getSuggestionsForContext(contextKind);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [acceptedIds, setAcceptedIds] = React.useState<Set<string>>(new Set());

  const active: AISuggestion | undefined = suggestions.find((s) => s.id === activeId);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary size-4" />
          <p className="text-sm font-medium">AI Assistant</p>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Aware of: {contextLabel}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {!active ? (
          <div className="space-y-2">
            <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
              Suggested
            </p>
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="text-muted-foreground size-3.5 shrink-0" />
                  {s.prompt}
                </span>
                {acceptedIds.has(s.id) ? (
                  <Check className="text-primary size-3.5 shrink-0" />
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ← Back to suggestions
            </button>
            <div className="bg-accent/40 rounded-md border p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                <Sparkles className="text-primary size-3.5" />
                {active.prompt}
              </p>
              <p className="text-foreground text-sm leading-relaxed">{active.response}</p>
              <p className="text-muted-foreground mt-2 text-[10px] uppercase tracking-wide">
                AI-generated suggestion — review before acting
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setAcceptedIds((prev) => new Set(prev).add(active.id));
                  toast.success("Suggestion accepted.");
                  setActiveId(null);
                }}
              >
                <Check className="size-3.5" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={() => toast.info("Regenerating isn't available in this preview.")}
              >
                <RotateCcw className="size-3.5" />
                Regenerate
              </Button>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Helpful"
                  onClick={() => toast.success("Thanks for the feedback.")}
                >
                  <ThumbsUp className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Not helpful"
                  onClick={() => toast.info("Thanks for the feedback.")}
                >
                  <ThumbsDown className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AIAssistantPanelCompact({
  contextKind,
  contextLabel,
  className,
}: {
  contextKind: AIContextKind;
  contextLabel: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border", className)}>
      <AIAssistantPanel contextKind={contextKind} contextLabel={contextLabel} />
    </div>
  );
}
