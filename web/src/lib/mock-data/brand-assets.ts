import * as React from "react";

/**
 * Mock Brand Assets dataset + shared store — Marketing sidebar
 * (05 Department Operating Systems/Marketing/marketing-operating-system.md:
 * "Brand Assets repository" — a documented Gap on data model detail, so this
 * is a reasonable inference from the sidebar item name: canonical, official
 * brand materials (logos, color palettes, typography, templates,
 * guidelines), distinct from Creative Library's campaign-specific working
 * assets — brand assets have no `campaignId`, they're the shared source of
 * truth every campaign draws from.
 */
export const BRAND_ASSET_CATEGORIES = [
  "Logo",
  "Color Palette",
  "Typography",
  "Template",
  "Guideline",
] as const;
export type BrandAssetCategory = (typeof BRAND_ASSET_CATEGORIES)[number];

export interface BrandAsset {
  id: string;
  name: string;
  category: BrandAssetCategory;
  description: string;
  sizeLabel: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedLabel: string;
  fileBlob?: Blob;
  archived: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const seedAssets: BrandAsset[] = [
  {
    id: "brand-primary-logo",
    name: "Cosmade Primary Logo.svg",
    category: "Logo",
    description: "Full-color primary logo for light backgrounds.",
    sizeLabel: "48 KB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "6 months ago",
    archived: false,
  },
  {
    id: "brand-logo-reverse",
    name: "Cosmade Logo (Reverse).svg",
    category: "Logo",
    description: "White/reverse logo for dark backgrounds.",
    sizeLabel: "46 KB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "6 months ago",
    archived: false,
  },
  {
    id: "brand-color-palette",
    name: "Brand Color Palette.pdf",
    category: "Color Palette",
    description: "Primary, secondary, and accent color hex/RGB values with usage guidance.",
    sizeLabel: "210 KB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "6 months ago",
    archived: false,
  },
  {
    id: "brand-typography-guide",
    name: "Typography Guide.pdf",
    category: "Typography",
    description: "Approved typefaces, weights, and sizing scale for print and digital.",
    sizeLabel: "180 KB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "6 months ago",
    archived: false,
  },
  {
    id: "brand-onepager-template",
    name: "One-Pager Template.pptx",
    category: "Template",
    description: "Editable PowerPoint template for product one-pagers.",
    sizeLabel: "2.1 MB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "2 months ago",
    archived: false,
  },
  {
    id: "brand-guidelines",
    name: "Brand Guidelines.pdf",
    category: "Guideline",
    description: "Full brand book: voice and tone, logo usage rules, imagery style, do's and don'ts.",
    sizeLabel: "4.8 MB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "6 months ago",
    archived: false,
  },
];

let state: BrandAsset[] = seedAssets;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useBrandAssets(): BrandAsset[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addBrandAsset(
  file: File,
  category: BrandAssetCategory,
  description: string,
  uploadedBy: string,
  uploadedByInitials: string,
): BrandAsset {
  const asset: BrandAsset = {
    id: `brand-upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    category,
    description,
    sizeLabel: formatSize(file.size),
    uploadedBy,
    uploadedByInitials,
    uploadedLabel: "Just now",
    fileBlob: file,
    archived: false,
  };
  state = [asset, ...state];
  notify();
  return asset;
}

export function updateBrandAsset(
  id: string,
  updates: Partial<Pick<BrandAsset, "name" | "category" | "description">>,
) {
  state = state.map((a) => (a.id === id ? { ...a, ...updates } : a));
  notify();
}

export function duplicateBrandAsset(id: string): BrandAsset | undefined {
  const source = state.find((a) => a.id === id);
  if (!source) return undefined;
  const copy: BrandAsset = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: source.name.replace(/(\.[^.]+)?$/, " (Copy)$1"),
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveBrandAssets(ids: string[]) {
  state = state.map((a) => (ids.includes(a.id) ? { ...a, archived: true } : a));
  notify();
}

export function restoreBrandAsset(id: string) {
  state = state.map((a) => (a.id === id ? { ...a, archived: false } : a));
  notify();
}

export function deleteBrandAsset(id: string) {
  state = state.filter((a) => a.id !== id);
  notify();
}
