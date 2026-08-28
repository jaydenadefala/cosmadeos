"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { workspaces, getWorkspaceIdFromPathname, type WorkspaceId } from "@/lib/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * Mobile Bottom Navigation — 04 Enterprise Architecture/
 * enterprise-information-architecture.md: "Mobile: Bottom navigation for
 * primary workspaces..." Previously the top bar's horizontal-scrolling
 * workspace switcher (ADR-004) was the only workspace-switching surface at
 * every width, including mobile — this replaces it below the `sm`
 * breakpoint with the source doc's specified pattern; the top bar's
 * scrolling switcher remains for tablet/desktop.
 *
 * "Primary workspaces" was not enumerated in source material — the four
 * shown here (Dashboard + the three highest-traffic built departments) are
 * a reasonable interpretation, not a sourced decision; "More" surfaces
 * every other workspace in a bottom sheet (itself the doc's own specified
 * mobile pattern for secondary content, reused here for consistency).
 */
const PINNED_WORKSPACE_IDS: WorkspaceId[] = ["dashboard", "hr", "sales", "finance"];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const activeWorkspaceId = getWorkspaceIdFromPathname(pathname);

  const pinned = PINNED_WORKSPACE_IDS.map((id) => workspaces.find((w) => w.id === id)).filter(
    (w): w is NonNullable<typeof w> => Boolean(w),
  );
  const isMoreActive = !PINNED_WORKSPACE_IDS.includes(activeWorkspaceId);

  return (
    <>
      <nav
        aria-label="Primary workspaces"
        className="bg-background fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch border-t sm:hidden"
      >
        {pinned.map((workspace) => {
          const isActive = workspace.id === activeWorkspaceId;
          return (
            <Link
              key={workspace.id}
              href={workspace.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <workspace.icon className="size-5" />
              <span className="truncate px-1">{workspace.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More workspaces"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
            isMoreActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          <MoreHorizontal className="size-5" />
          <span>More</span>
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[75vh] p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="text-sm">All workspaces</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 overflow-auto p-4">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === activeWorkspaceId;
              return (
                <Link
                  key={workspace.id}
                  href={workspace.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-3 text-center text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <workspace.icon className="size-5" />
                  <span className="leading-tight">{workspace.label}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
