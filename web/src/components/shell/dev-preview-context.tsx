"use client";

import * as React from "react";

import { availableCompanies, availableRoles } from "@/lib/mock-session";

/**
 * Developer Preview Toolbar state.
 * Source: 06 Platform Core/developer-preview-toolbar.md
 * Dev-mode only — never mounted in production (enforced by DeveloperPreviewToolbar's
 * own guard, not here, so this context stays safe to import anywhere).
 */

export const viewportPresets = {
  none: { label: "Actual size", width: undefined, height: undefined },
  "desktop-xl": { label: "Desktop XL", width: 1920, height: 1080 },
  desktop: { label: "Desktop", width: 1440, height: 900 },
  laptop: { label: "Laptop", width: 1280, height: 800 },
  "tablet-landscape": { label: "Tablet Landscape", width: 1024, height: 768 },
  "tablet-portrait": { label: "Tablet Portrait", width: 768, height: 1024 },
  "mobile-large": { label: "Mobile Large", width: 430, height: 932 },
  "mobile-small": { label: "Mobile Small", width: 360, height: 780 },
} as const;

export type ViewportPresetId = keyof typeof viewportPresets;
export type Role = (typeof availableRoles)[number];
export type Company = (typeof availableCompanies)[number];

interface DevPreviewState {
  role: Role;
  setRole: (role: Role) => void;
  company: Company;
  setCompany: (company: Company) => void;
  viewport: ViewportPresetId;
  setViewport: (viewport: ViewportPresetId) => void;
  /**
   * Workflow State Switcher (first real piece — 06 Platform Core/
   * developer-preview-toolbar.md names this as a planned-but-unbuilt
   * toggle; ROADMAP.md Phase 1 tracked it as "not yet"). Simulates the
   * Maintenance Universal State (CLAUDE.md's UI Philosophy: "Every screen
   * defines all Universal States... Maintenance") platform-wide, since no
   * real backend exists to drive a genuine maintenance flag from.
   */
  maintenanceMode: boolean;
  setMaintenanceMode: (value: boolean) => void;
  /**
   * Grid Overlay — 06 Platform Core/developer-preview-toolbar.md: "Displays
   * 8px spacing grid, layout columns, responsive breakpoints, safe areas."
   * Purely visual, no dependency on any unbuilt system, unlike most of the
   * toolbar's remaining "not yet" items.
   */
  gridOverlay: boolean;
  setGridOverlay: (value: boolean) => void;
}

const DevPreviewContext = React.createContext<DevPreviewState | null>(null);

export function DevPreviewProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>("Owner");
  const [company, setCompany] = React.useState<Company>("Cosmade Medical");
  const [viewport, setViewport] = React.useState<ViewportPresetId>("none");
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [gridOverlay, setGridOverlay] = React.useState(false);

  const value = React.useMemo(
    () => ({
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
    }),
    [role, company, viewport, maintenanceMode, gridOverlay],
  );

  return (
    <DevPreviewContext.Provider value={value}>
      {children}
    </DevPreviewContext.Provider>
  );
}

export function useDevPreview() {
  const ctx = React.useContext(DevPreviewContext);
  if (!ctx) {
    throw new Error("useDevPreview must be used within a DevPreviewProvider");
  }
  return ctx;
}
