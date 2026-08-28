"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { FlaskConical, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getWorkspaceIdFromPathname, workspaces, workspaceSidebars } from "@/lib/navigation";
import { availableCompanies, availableRoles } from "@/lib/mock-session";
import { generateTestNotification, type NotificationKind } from "@/lib/mock-data/notifications";
import { cn } from "@/lib/utils";
import {
  useDevPreview,
  viewportPresets,
  type ViewportPresetId,
} from "@/components/shell/dev-preview-context";

const NOTIFICATION_KINDS: { id: NotificationKind; label: string }[] = [
  { id: "success", label: "Success" },
  { id: "error", label: "Error" },
  { id: "warning", label: "Warning" },
  { id: "information", label: "Information" },
  { id: "approval", label: "Approval Request" },
  { id: "mention", label: "Mention" },
  { id: "reminder", label: "Reminder" },
];

/**
 * Developer Preview Toolbar — DEV MODE ONLY.
 * Source: 06 Platform Core/developer-preview-toolbar.md
 *
 * Implemented now (wired to real state): Department Switcher, Screen
 * Switcher, Role Switcher, Company Switcher, Theme Switcher, Viewport
 * Simulator, Workflow State Switcher (Maintenance Mode), Grid Overlay,
 * Notification Generator (pushes a real entry into the Notification Center
 * store — 06 Platform Core/app-shell.md).
 * Not yet implemented (still need a target system that doesn't exist —
 * listed disabled rather than faked): Density Switcher (a *global preview*
 * switcher is what's still missing; per-page Density is real now, see
 * ROADMAP.md Phase 3), Language Switcher (no i18n), Permission Overlay (no
 * RBAC), Component Inspector (no component-metadata system), Sample Data
 * Switcher (no alternate dataset generation).
 * See ROADMAP.md Phase 1 for tracked follow-up.
 */
export function DeveloperPreviewToolbar() {
  if (process.env.NODE_ENV === "production") return null;
  return <DeveloperPreviewToolbarInner />;
}

function DeveloperPreviewToolbarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const {
    role,
    setRole,
    company,
    setCompany,
    viewport,
    setViewport,
    maintenanceMode,
    setMaintenanceMode,
    gridOverlay,
    setGridOverlay,
  } = useDevPreview();

  const activeWorkspaceId = getWorkspaceIdFromPathname(pathname);
  const screens = React.useMemo(
    () => (workspaceSidebars[activeWorkspaceId] ?? []).flatMap((section) => section.items),
    [activeWorkspaceId],
  );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-xs font-medium"
          />
        }
      >
        <FlaskConical className="size-3.5" />
        Dev Preview
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Developer Preview Toolbar</p>
          <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
            Dev only
          </span>
        </div>

        <Field label="Department">
          <Select onValueChange={(href: string | null) => href && router.push(href)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Jump to department…" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.href}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Screen"
          hint={
            screens.length === 0
              ? "Current department has no sub-screens to jump between."
              : "Switches directly to a screen within the current department."
          }
        >
          <Select
            onValueChange={(href: string | null) => href && router.push(href)}
            disabled={screens.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Jump to screen…">
                {(href: string) => screens.find((s) => s.href === href)?.label ?? "Jump to screen…"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {screens.map((s) => (
                <SelectItem key={s.href} value={s.href}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Role" hint="Refreshes visible menus, actions, and restricted pages.">
          <Select value={role} onValueChange={(v: string | null) => v && setRole(v as typeof role)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Company">
          <Select value={company} onValueChange={(v: string | null) => v && setCompany(v as typeof company)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCompanies.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Theme">
          <Select
            value={theme ?? "system"}
            onValueChange={(v: string | null) => setTheme(v ?? "system")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Viewport" hint="Resizes the app container to simulate the device.">
          <Select
            value={viewport}
            onValueChange={(v: string | null) => v && setViewport(v as ViewportPresetId)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(viewportPresets).map(([id, preset]) => (
                <SelectItem key={id} value={id}>
                  {preset.label}
                  {preset.width ? ` (${preset.width}×${preset.height})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Separator />

        <Field
          id="dev-preview-maintenance"
          label="Maintenance Mode"
          hint="Simulates the Maintenance Universal State platform-wide."
          className="flex-row items-center justify-between gap-4"
        >
          <Switch
            id="dev-preview-maintenance"
            checked={maintenanceMode}
            onCheckedChange={(checked) => setMaintenanceMode(checked === true)}
          />
        </Field>

        <Field
          id="dev-preview-grid"
          label="Grid Overlay"
          hint="8px spacing grid + 12-column layout guides."
          className="flex-row items-center justify-between gap-4"
        >
          <Switch
            id="dev-preview-grid"
            checked={gridOverlay}
            onCheckedChange={(checked) => setGridOverlay(checked === true)}
          />
        </Field>

        <Field label="Notification Generator" hint="Pushes a real test notification into the Notification Center.">
          <Select onValueChange={(kind: string | null) => kind && generateTestNotification(kind as NotificationKind)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Generate…" />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_KINDS.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  <Sparkles className="size-3.5" />
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Separator />

        <div className="space-y-1.5">
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
            Not yet available
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            A global Density preview switcher (per-page Density is real now
            — see ROADMAP.md Phase 3), Language Switcher, Permission
            Overlay, and Component Inspector are specified in the
            documentation but need a target system that doesn&apos;t exist
            yet (i18n, RBAC, component metadata) — tracked in ROADMAP.md.
            Sample Data Switcher also remains unbuilt.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Field({
  id,
  label,
  hint,
  className,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-muted-foreground text-[11px]">{hint}</p> : null}
    </div>
  );
}
