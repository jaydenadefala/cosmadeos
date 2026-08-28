"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { getWorkspaceIdFromPathname, workspaces } from "@/lib/navigation";
import { getContextKindForWorkspace } from "@/lib/ai-context";

/**
 * AI Assistant Panel (shell) — 06 Platform Core/app-shell.md names this as
 * a first-class, always-present App Shell component (see 07 Enterprise AI/
 * global-ai-experience.md). The source doc's Responsive Behavior section
 * ("Desktop: three-column layout incl. context/AI panel"; "Tablet: AI panel
 * becomes a slide-over drawer") gives two documented layouts; this
 * implements the slide-over pattern platform-wide as the pragmatic single
 * build for this pass — a persistent third desktop column is a larger,
 * cross-cutting layout change tracked separately in ROADMAP.md, not
 * silently dropped.
 */
export function AIPanelTrigger() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const workspaceId = getWorkspaceIdFromPathname(pathname);
  const workspace = workspaces.find((w) => w.id === workspaceId);
  const contextKind = getContextKindForWorkspace(workspaceId);
  const contextLabel = workspace?.label ?? "this page";

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="AI Assistant"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="size-4" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
          <SheetHeader className="sr-only">
            <SheetTitle>AI Assistant</SheetTitle>
            <SheetDescription>
              Contextual AI suggestions for the current workspace.
            </SheetDescription>
          </SheetHeader>
          <AIAssistantPanel contextKind={contextKind} contextLabel={contextLabel} />
        </SheetContent>
      </Sheet>
    </>
  );
}
