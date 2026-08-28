"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getWorkspaceIdFromPathname, workspaces, workspaceSidebars } from "@/lib/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { GridOverlay } from "@/components/ui/grid-overlay";
import { MaintenanceBanner } from "@/components/ui/maintenance-banner";
import { SyncStatusBanner } from "@/components/ui/sync-status-banner";
import { MobileBottomNav } from "@/components/shell/mobile-bottom-nav";
import { TopNavBar } from "@/components/shell/top-nav-bar";
import { WorkspaceSidebar } from "@/components/shell/workspace-sidebar";
import { useDevPreview, viewportPresets } from "@/components/shell/dev-preview-context";
import { useOnlineStatus } from "@/lib/use-online-status";
import type { SessionUser } from "@/lib/mock-session";

/**
 * App Shell — the persistent frame every user lives inside (ADR-001).
 * Composition: TopNavBar (workspace switcher, ADR-004) + WorkspaceSidebar
 * (grouped sections, only rendered when the active workspace defines one)
 * + main content. Wrapped in the Viewport Simulator container so the
 * Developer Preview Toolbar can shrink the app to a device size without
 * leaving the browser.
 */
export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  const pathname = usePathname();
  const workspaceId = getWorkspaceIdFromPathname(pathname);
  const hasSidebar = Boolean(workspaceSidebars[workspaceId]);
  const workspaceLabel = workspaces.find((w) => w.id === workspaceId)?.label ?? workspaceId;
  const { viewport, maintenanceMode, gridOverlay } = useDevPreview();
  const preset = viewportPresets[viewport];
  const isOnline = useOnlineStatus();

  const shell = (
    <div className="flex h-full min-h-svh w-full flex-col">
      <TopNavBar user={user} />
      {maintenanceMode ? <MaintenanceBanner className="border-b" /> : null}
      {!isOnline ? <SyncStatusBanner status="offline" className="border-b" /> : null}
      <SidebarProvider className="min-h-0 flex-1">
        {hasSidebar ? <WorkspaceSidebar workspaceId={workspaceId} /> : null}
        <SidebarInset className="min-w-0">
          {hasSidebar ? (
            <div className="flex items-center gap-2 border-b px-4 py-2 md:hidden">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground text-sm">{workspaceLabel}</span>
            </div>
          ) : null}
          <main className="flex min-w-0 flex-1 flex-col pb-14 sm:pb-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <MobileBottomNav />
      {gridOverlay ? <GridOverlay /> : null}
    </div>
  );

  if (!preset.width) {
    return shell;
  }

  return (
    <div className="bg-muted flex min-h-svh w-full items-start justify-center overflow-auto py-6">
      <div
        style={{ width: preset.width, height: preset.height }}
        className={cn(
          "bg-background overflow-auto rounded-lg border shadow-lg",
          "ring-border ring-1",
        )}
      >
        {shell}
      </div>
    </div>
  );
}
