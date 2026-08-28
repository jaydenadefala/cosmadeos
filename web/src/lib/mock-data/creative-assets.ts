import * as React from "react";

/**
 * Mock Creative/Media Library dataset + shared store — Marketing sidebar
 * (05 Department Operating Systems/Marketing/marketing-operating-system.md:
 * "Creative Library (media/document management, supports drag-and-drop per
 * the platform's Drag & Drop standard)"). Same `useSyncExternalStore`
 * pattern as team-documents.ts. `campaignId` is a real, optional link back
 * to a Campaign (CLAUDE.md "Every Module Must Be Connected" — an asset
 * created for a campaign shows up on that campaign, not as an orphan row).
 *
 * As with team-documents.ts, seed assets carry no real file bytes (no
 * backend/storage yet); `fileBlob` is only set for assets genuinely
 * uploaded during the session, so Download/Preview are honest — disabled
 * with an explanation for seed data, real for session uploads.
 */
export const ASSET_TYPES = ["Image", "Video", "Document", "Other"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export interface CreativeAsset {
  id: string;
  name: string;
  assetType: AssetType;
  sizeLabel: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedLabel: string;
  campaignId?: string;
  fileBlob?: Blob;
  archived: boolean;
}

function assetTypeFromMime(mime: string, name: string): AssetType {
  if (mime.startsWith("image/")) return "Image";
  if (mime.startsWith("video/")) return "Video";
  if (mime === "application/pdf" || /\.(docx?|pdf|xlsx?|pptx?)$/i.test(name)) return "Document";
  return "Other";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const seedAssets: CreativeAsset[] = [
  {
    id: "asset-tradeshow-banner",
    name: "Trade Show Booth Banner.png",
    assetType: "Image",
    sizeLabel: "3.4 MB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "3 days ago",
    campaignId: "campaign-q3-tradeshow",
    archived: false,
  },
  {
    id: "asset-tradeshow-onepager",
    name: "X200 Ventilator One-Pager.pdf",
    assetType: "Document",
    sizeLabel: "1.1 MB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "3 days ago",
    campaignId: "campaign-q3-tradeshow",
    archived: false,
  },
  {
    id: "asset-linkedin-headshot-template",
    name: "LinkedIn Post Template.png",
    assetType: "Image",
    sizeLabel: "820 KB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "1 week ago",
    campaignId: "campaign-linkedin-thought-leadership",
    archived: false,
  },
  {
    id: "asset-webinar-recording",
    name: "NAFDAC Webinar Recording.mp4",
    assetType: "Video",
    sizeLabel: "142 MB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "3 weeks ago",
    campaignId: "campaign-nafdac-webinar",
    archived: false,
  },
  {
    id: "asset-brand-logo-pack",
    name: "Cosmade Logo Pack.zip",
    assetType: "Other",
    sizeLabel: "5.6 MB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "2 months ago",
    archived: false,
  },
];

let state: CreativeAsset[] = seedAssets;
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

export function useCreativeAssets(): CreativeAsset[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addCreativeAsset(
  file: File,
  uploadedBy: string,
  uploadedByInitials: string,
  campaignId?: string,
): CreativeAsset {
  const asset: CreativeAsset = {
    id: `asset-upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    assetType: assetTypeFromMime(file.type, file.name),
    sizeLabel: formatSize(file.size),
    uploadedBy,
    uploadedByInitials,
    uploadedLabel: "Just now",
    campaignId,
    fileBlob: file,
    archived: false,
  };
  state = [asset, ...state];
  notify();
  return asset;
}

export function assignAssetToCampaign(id: string, campaignId: string | undefined) {
  state = state.map((a) => (a.id === id ? { ...a, campaignId } : a));
  notify();
}

export function renameCreativeAsset(id: string, newName: string) {
  state = state.map((a) => (a.id === id ? { ...a, name: newName } : a));
  notify();
}

export function duplicateCreativeAsset(id: string): CreativeAsset | undefined {
  const source = state.find((a) => a.id === id);
  if (!source) return undefined;
  const copy: CreativeAsset = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: source.name.replace(/(\.[^.]+)?$/, " (Copy)$1"),
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveCreativeAssets(ids: string[]) {
  state = state.map((a) => (ids.includes(a.id) ? { ...a, archived: true } : a));
  notify();
}

export function restoreCreativeAsset(id: string) {
  state = state.map((a) => (a.id === id ? { ...a, archived: false } : a));
  notify();
}

export function deleteCreativeAsset(id: string) {
  state = state.filter((a) => a.id !== id);
  notify();
}
