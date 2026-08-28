import * as React from "react";

/**
 * Mock Team Documents dataset + shared store — Policies sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md). Same
 * `useSyncExternalStore` pattern as employees.ts/applicants.ts/job-listings.ts.
 *
 * Seed documents have no real file bytes (there's no backend/storage yet —
 * Volume 2 unauthored) — `fileBlob` is only ever set for documents added
 * through a genuine upload during the session, so Download is honest: it
 * works for session uploads and is disabled (with an explanation, not a
 * silently-dead button) for seed data.
 *
 * `versionHistory` is real (CLAUDE.md "Functionality-First Implementation
 * Rules": documents need Version History) — uploading a file whose name
 * matches an existing, non-archived document is treated as a new version of
 * that document rather than a separate record: the document's *previous*
 * size/uploader/blob is pushed onto `versionHistory` before the new upload
 * becomes current.
 */
export interface DocumentVersion {
  sizeLabel: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedLabel: string;
  fileBlob?: Blob;
}

export type DocumentVisibility = "Everyone" | "HR Admins only";

export interface TeamDocument {
  id: string;
  name: string;
  type: string;
  sizeLabel: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedLabel: string;
  fileBlob?: Blob;
  versionHistory: DocumentVersion[];
  visibility: DocumentVisibility;
  archived: boolean;
}

function fileTypeFromName(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext ?? "File";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const seedDocuments: TeamDocument[] = [
  {
    id: "doc-1",
    name: "Employee Handbook.pdf",
    type: "PDF",
    sizeLabel: "1.2 MB",
    uploadedBy: "Priya Shah",
    uploadedByInitials: "PS",
    uploadedLabel: "3 months ago",
    versionHistory: [],
    visibility: "Everyone",
    archived: false,
  },
  {
    id: "doc-2",
    name: "Benefits Overview.pdf",
    type: "PDF",
    sizeLabel: "480 KB",
    uploadedBy: "Priya Shah",
    uploadedByInitials: "PS",
    uploadedLabel: "3 months ago",
    versionHistory: [],
    visibility: "Everyone",
    archived: false,
  },
  {
    id: "doc-3",
    name: "Remote Work Policy.docx",
    type: "DOCX",
    sizeLabel: "88 KB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "5 months ago",
    versionHistory: [],
    visibility: "Everyone",
    archived: false,
  },
  {
    id: "doc-4",
    name: "Code of Conduct.pdf",
    type: "PDF",
    sizeLabel: "310 KB",
    uploadedBy: "Priya Shah",
    uploadedByInitials: "PS",
    uploadedLabel: "6 months ago",
    versionHistory: [],
    visibility: "Everyone",
    archived: false,
  },
  {
    id: "doc-5",
    name: "Org Chart.pdf",
    type: "PDF",
    sizeLabel: "220 KB",
    uploadedBy: "Jayden Adefala",
    uploadedByInitials: "JA",
    uploadedLabel: "1 month ago",
    versionHistory: [],
    visibility: "HR Admins only",
    archived: false,
  },
];

let state: TeamDocument[] = seedDocuments;
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

export function useTeamDocuments(): TeamDocument[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getTeamDocumentById(id: string): TeamDocument | undefined {
  return state.find((d) => d.id === id);
}

export function addTeamDocument(file: File, uploadedBy: string, uploadedByInitials: string) {
  const existing = state.find(
    (d) => !d.archived && d.name.toLowerCase() === file.name.toLowerCase(),
  );

  if (existing) {
    const previousVersion: DocumentVersion = {
      sizeLabel: existing.sizeLabel,
      uploadedBy: existing.uploadedBy,
      uploadedByInitials: existing.uploadedByInitials,
      uploadedLabel: existing.uploadedLabel,
      fileBlob: existing.fileBlob,
    };
    const updated: TeamDocument = {
      ...existing,
      sizeLabel: formatSize(file.size),
      uploadedBy,
      uploadedByInitials,
      uploadedLabel: "Just now",
      fileBlob: file,
      versionHistory: [previousVersion, ...existing.versionHistory],
    };
    state = state.map((d) => (d.id === existing.id ? updated : d));
    notify();
    return updated;
  }

  const doc: TeamDocument = {
    id: `doc-upload-${Date.now()}`,
    name: file.name,
    type: fileTypeFromName(file.name),
    sizeLabel: formatSize(file.size),
    uploadedBy,
    uploadedByInitials,
    uploadedLabel: "Just now",
    fileBlob: file,
    versionHistory: [],
    visibility: "Everyone",
    archived: false,
  };
  state = [doc, ...state];
  notify();
  return doc;
}

export function renameTeamDocument(id: string, newName: string) {
  state = state.map((d) => (d.id === id ? { ...d, name: newName, type: fileTypeFromName(newName) } : d));
  notify();
}

export function setDocumentVisibility(id: string, visibility: DocumentVisibility) {
  state = state.map((d) => (d.id === id ? { ...d, visibility } : d));
  notify();
}

export function duplicateTeamDocument(id: string): TeamDocument | undefined {
  const source = state.find((d) => d.id === id);
  if (!source) return undefined;
  const copy: TeamDocument = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name.replace(/(\.[^.]+)?$/, " (Copy)$1")}`,
    versionHistory: [],
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveTeamDocuments(ids: string[]) {
  state = state.map((d) => (ids.includes(d.id) ? { ...d, archived: true } : d));
  notify();
}

export function restoreTeamDocument(id: string) {
  state = state.map((d) => (d.id === id ? { ...d, archived: false } : d));
  notify();
}

export function deleteTeamDocument(id: string) {
  state = state.filter((d) => d.id !== id);
  notify();
}
