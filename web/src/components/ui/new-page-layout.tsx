"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * New Page — 03 Design Principles/interaction-patterns.md (Mandatory Modal
 * vs. Drawer vs. New Page rule): complex authoring work (Knowledge Editor,
 * Campaign Builder, Research Workspace, Workflow Builder, Report Designer,
 * Document Editor) always gets a full page, never a modal. This is the
 * shared layout every one of those surfaces builds on: a sticky header with
 * back navigation, title/subtitle, and a primary/secondary action slot,
 * above a scrollable content area.
 */
export function NewPageLayout({
  title,
  subtitle,
  onBack,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  /** Defaults to browser back navigation if omitted. */
  onBack?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <header className="bg-background sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          onClick={onBack ?? (() => router.back())}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          {subtitle ? (
            <p className="text-muted-foreground truncate text-xs">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
