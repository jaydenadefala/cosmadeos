"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { workspaces } from "@/lib/navigation";
import { AIPanelTrigger } from "@/components/shell/ai-panel-trigger";
import { CommandPalette } from "@/components/shell/command-palette";
import { DeveloperPreviewToolbar } from "@/components/shell/developer-preview-toolbar";
import { NotificationsPopover } from "@/components/shell/notifications-popover";
import { OrganizationSelector } from "@/components/shell/organization-selector";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { ProfileMenu } from "@/components/shell/profile-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { SessionUser } from "@/lib/mock-session";

/**
 * Global Navigation Bar — top horizontal bar, workspace switcher.
 * Placement decided by ADR-004 (see DECISIONS.md): workspaces live here,
 * not in the left sidebar, matching 11 UX System/design-system-teardown.md.
 * Active tab: subtle light-gray background + slight emphasis — "not blue,
 * not heavily highlighted, very subtle."
 */
export function TopNavBar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  return (
    <header className="bg-background sticky top-0 z-40 flex h-14 w-full items-center gap-3 border-b px-3 sm:px-4">
      <Link
        href="/"
        className="mr-1 flex shrink-0 items-center gap-2 font-semibold tracking-tight"
      >
        <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md text-xs font-bold">
          C
        </span>
        <span className="hidden sm:inline">Cosmade OS</span>
      </Link>

      <div className="hidden shrink-0 items-center gap-1 border-l pl-2 md:flex">
        <OrganizationSelector />
      </div>

      <ScrollArea className="hidden min-w-0 flex-1 sm:block">
        <nav className="flex items-center gap-0.5 py-1" aria-label="Workspaces">
          {workspaces.map((workspace) => {
            const isActive =
              workspace.href === "/"
                ? pathname === "/"
                : pathname.startsWith(workspace.href);
            return (
              <Link
                key={workspace.id}
                href={workspace.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {workspace.label}
              </Link>
            );
          })}
        </nav>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <div className="hidden md:block">
          <CommandPalette />
        </div>
        <div className="hidden lg:block">
          <DeveloperPreviewToolbar />
        </div>
        <AIPanelTrigger />
        <NotificationsPopover />
        <ThemeToggle />
        <ProfileMenu user={user} />
      </div>
    </header>
  );
}
