import * as React from "react";

/**
 * Mock Knowledge Base dataset + shared store — Knowledge Base workspace
 * (05 Department Operating Systems/Knowledge/knowledge-operating-system.md).
 * Covers the four sidebar sections not already owned by another workspace:
 * Templates, Meeting Notes, Lessons Learned, Best Practices. Handbooks and
 * SOPs are deliberately NOT duplicated here — the Knowledge Base workspace
 * is documented as a cross-cutting hub ("every business object across the
 * platform links into Knowledge via its Knowledge tab"), so `/knowledge/
 * handbooks` and `/knowledge/sops` instead surface the real, existing
 * `policy-documents.ts` (HR) and `sop-documents.ts` (Operations) stores —
 * one system of record each, not a fork. `authorId` references a real
 * Employee (referential-integrity pattern); `relatedMeetingId` optionally
 * references a real Sales Meeting for Meeting Notes entries.
 */
export const KNOWLEDGE_BASE_SECTIONS = ["Template", "Meeting Notes", "Lessons Learned", "Best Practice"] as const;
export type KnowledgeBaseSection = (typeof KNOWLEDGE_BASE_SECTIONS)[number];

export interface KnowledgeBaseVersion {
  title: string;
  content: string;
  savedLabel: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  section: KnowledgeBaseSection;
  title: string;
  category: string;
  summary: string;
  content: string;
  authorId: string;
  relatedMeetingId?: string;
  lastUpdatedLabel: string;
  favorited: boolean;
  versionHistory: KnowledgeBaseVersion[];
  archived: boolean;
}

const seedEntries: KnowledgeBaseEntry[] = [
  {
    id: "kbase-site-visit-report",
    section: "Template",
    title: "Field Site Visit Report Template",
    category: "Field Service",
    summary: "Standard structure for documenting an on-site equipment installation or service visit.",
    content:
      "1. Site & contact details. 2. Equipment serviced (model, serial number). 3. Work performed. 4. Parts used/replaced. 5. Follow-up required (Y/N) — if yes, log a Compliance or Operations Request. 6. Customer sign-off.",
    authorId: "alexandre-hamilton",
    lastUpdatedLabel: "2 weeks ago",
    favorited: true,
    versionHistory: [],
    archived: false,
  },
  {
    id: "kbase-customer-onboarding-checklist",
    section: "Template",
    title: "Customer Onboarding Checklist Template",
    category: "Sales",
    summary: "Steps to complete after a deal closes, before the account moves to Customer Success.",
    content:
      "1. Send welcome email with support contacts. 2. Schedule installation/training visit. 3. Confirm invoice and payment terms. 4. Add primary contact to the Customers workspace. 5. Log first 90-day check-in on the calendar.",
    authorId: "sam-okafor",
    lastUpdatedLabel: "1 month ago",
    favorited: false,
    versionHistory: [],
    archived: false,
  },
  {
    id: "kbase-weekly-ops-sync",
    section: "Meeting Notes",
    title: "Weekly Operations Sync — Warehouse Capacity Review",
    category: "Operations",
    summary: "Notes from the recurring weekly ops sync covering warehouse capacity and reorder thresholds.",
    content:
      "Discussed Low Stock items (Ventilator Backup Battery Packs) and agreed to raise the reorder threshold from 5 to 8 units given longer vendor lead times. Alexandre to submit a procurement request. Also reviewed the Q3 vendor onboarding checklist — no changes needed.",
    authorId: "alexandre-hamilton",
    lastUpdatedLabel: "3 days ago",
    favorited: false,
    versionHistory: [],
    archived: false,
  },
  {
    id: "kbase-discovery-call-notes",
    section: "Meeting Notes",
    title: "Kano Teaching Hospital — Discovery Call Notes",
    category: "Sales",
    summary: "Notes from the initial equipment needs discovery call with Kano Teaching Hospital.",
    content:
      "Hospital is evaluating 3 vendors for ICU ventilator replacement (12 units). Budget approval is pending from the state ministry of health — expect a 4–6 week delay. Key decision-maker is the Medical Director, not procurement. Follow up in 3 weeks.",
    authorId: "sam-okafor",
    relatedMeetingId: "meeting-1",
    lastUpdatedLabel: "1 week ago",
    favorited: true,
    versionHistory: [],
    archived: false,
  },
  {
    id: "kbase-calibration-toolkit-shortage",
    section: "Lessons Learned",
    title: "Calibration Toolkit Shortage Delayed the Kano Multi-Site Trip",
    category: "Operations",
    summary: "Postmortem on why the Kano trip needed a last-minute procurement request for extra equipment.",
    content:
      "Root cause: multi-site trips were being planned without checking calibration toolkit availability against the number of sites first. Corrective action: added a step to the Vendor Onboarding Checklist SOP requiring an equipment availability check before confirming any multi-site itinerary with more than 2 stops.",
    authorId: "daniel-kim",
    lastUpdatedLabel: "2 weeks ago",
    favorited: false,
    versionHistory: [],
    archived: false,
  },
  {
    id: "kbase-invoice-delay-lesson",
    section: "Lessons Learned",
    title: "Late Invoice Sends Correlate with Longer Payment Delays",
    category: "Finance",
    summary: "What we learned after reviewing overdue invoices from the last two quarters.",
    content:
      "Invoices sent more than 5 business days after the agreed issue date were overdue at 2x the rate of on-time invoices. Corrective action: Finance now sends invoices the same day a deal is marked Won, rather than batching them weekly.",
    authorId: "maria-santos",
    lastUpdatedLabel: "1 month ago",
    favorited: false,
    versionHistory: [],
    archived: false,
  },
  {
    id: "kbase-demo-best-practice",
    section: "Best Practice",
    title: "Running a Strong Equipment Demo for Hospital Evaluators",
    category: "Sales",
    summary: "What consistently works when demoing ventilators and monitoring equipment to clinical staff.",
    content:
      "Lead with the noise level and battery backup — these are the two things ICU staff ask about first. Bring the Technical FAQ knowledge article on a tablet for anything you can't answer live. Never schedule a demo during a shift change; evaluators are distracted and rushed.",
    authorId: "sam-okafor",
    lastUpdatedLabel: "5 days ago",
    favorited: true,
    versionHistory: [],
    archived: false,
  },
  {
    id: "kbase-onboarding-best-practice",
    section: "Best Practice",
    title: "Making a New Hire's First Week Actually Useful",
    category: "HR",
    summary: "What separates onboarding weeks that stick from ones new hires forget by week three.",
    content:
      "Assign a peer buddy on day one, not just a manager. Front-load the compliance training (it's dry, get it out of the way) and save the hands-on equipment training for days 3–5 when it's more memorable. Schedule a 30-minute manager check-in at the end of week one specifically to ask what was confusing.",
    authorId: "priya-shah",
    lastUpdatedLabel: "3 weeks ago",
    favorited: false,
    versionHistory: [],
    archived: false,
  },
];

let state: KnowledgeBaseEntry[] = seedEntries;
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

export function useKnowledgeBaseEntries(): KnowledgeBaseEntry[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addKnowledgeBaseEntry(input: {
  section: KnowledgeBaseSection;
  title: string;
  category: string;
  summary: string;
  content: string;
  authorId: string;
  relatedMeetingId?: string;
}): KnowledgeBaseEntry {
  const entry: KnowledgeBaseEntry = {
    id: `kbase-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    section: input.section,
    title: input.title,
    category: input.category,
    summary: input.summary,
    content: input.content,
    authorId: input.authorId,
    relatedMeetingId: input.relatedMeetingId,
    lastUpdatedLabel: "Just now",
    favorited: false,
    versionHistory: [],
    archived: false,
  };
  state = [entry, ...state];
  notify();
  return entry;
}

export function updateKnowledgeBaseEntry(
  id: string,
  updates: Partial<Pick<KnowledgeBaseEntry, "title" | "category" | "summary" | "content">>,
) {
  state = state.map((e) => {
    if (e.id !== id) return e;
    const previousVersion: KnowledgeBaseVersion = {
      title: e.title,
      content: e.content,
      savedLabel: e.lastUpdatedLabel,
    };
    return {
      ...e,
      ...updates,
      lastUpdatedLabel: "Just now",
      versionHistory: [previousVersion, ...e.versionHistory],
    };
  });
  notify();
}

export function toggleKnowledgeBaseFavorite(id: string) {
  state = state.map((e) => (e.id === id ? { ...e, favorited: !e.favorited } : e));
  notify();
}

export function duplicateKnowledgeBaseEntry(id: string): KnowledgeBaseEntry | undefined {
  const source = state.find((e) => e.id === id);
  if (!source) return undefined;
  const copy: KnowledgeBaseEntry = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    title: `${source.title} (Copy)`,
    favorited: false,
    versionHistory: [],
    archived: false,
    lastUpdatedLabel: "Just now",
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveKnowledgeBaseEntries(ids: string[]) {
  state = state.map((e) => (ids.includes(e.id) ? { ...e, archived: true } : e));
  notify();
}

export function restoreKnowledgeBaseEntry(id: string) {
  state = state.map((e) => (e.id === id ? { ...e, archived: false } : e));
  notify();
}

export function deleteKnowledgeBaseEntry(id: string) {
  state = state.filter((e) => e.id !== id);
  notify();
}
