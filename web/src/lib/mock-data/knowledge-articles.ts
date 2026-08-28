import * as React from "react";

/**
 * Mock Knowledge Articles dataset + shared store for the Sales workspace
 * (05 Department Operating Systems/Sales/sales-operating-system.md lists
 * "Knowledge" as its own sidebar item, distinct from "Playbooks
 * (Knowledge-adjacent content)" — the source material doesn't specify the
 * distinction further, so this models Knowledge as sales *reference*
 * material (product specs, compliance, competitor comparisons) as opposed
 * to Playbooks' step-by-step process guides. Same shape/lifecycle pattern
 * as `playbooks.ts` (this session's proven template for Knowledge-adjacent
 * content), reused rather than reinvented. `authorId` references a real
 * Employee id (referential-integrity pattern).
 */
export interface KnowledgeArticleVersion {
  title: string;
  summary: string;
  content: string;
  savedLabel: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  authorId: string;
  lastUpdatedLabel: string;
  favorited: boolean;
  archived: boolean;
  versionHistory: KnowledgeArticleVersion[];
}

const seedArticles: KnowledgeArticle[] = [
  {
    id: "kb-x200-specs",
    title: "MedTech X200 Ventilator — Product Specifications",
    category: "Product Info",
    summary: "Full technical specifications, power requirements, and included accessories.",
    content:
      "The X200 supports invasive and non-invasive ventilation modes, a 10-hour battery backup, and integrated SpO2 monitoring. Power: 100–240V AC, 50/60Hz. Weight: 14.2 kg. Includes a mobile stand, backup battery pack, and a 2-year manufacturer warranty. Requires biannual calibration by a certified technician.",
    authorId: "sam-okafor",
    lastUpdatedLabel: "1 week ago",
    favorited: true,
    archived: false,
    versionHistory: [],
  },
  {
    id: "kb-compliance-overview",
    title: "FDA & NAFDAC Compliance Certification Overview",
    category: "Compliance",
    summary: "Which certifications each product line carries and how to verify them for procurement.",
    content:
      "All ventilator and monitoring lines carry FDA 510(k) clearance and NAFDAC registration for the Nigerian market. Certification numbers are printed on the device nameplate and available on request from Regulatory Affairs. Hospitals requiring proof for tender documents should request a Certificate of Conformance at least 5 business days before the procurement deadline.",
    authorId: "jayden-adefala",
    lastUpdatedLabel: "3 weeks ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
  {
    id: "kb-competitor-comparison",
    title: "Competitor Comparison: Cosmade vs. GlobalHealth Systems",
    category: "Competitor",
    summary: "Feature-by-feature comparison against our most common competitive displacement target.",
    content:
      "GlobalHealth's equivalent unit has a shorter 6-hour battery backup and requires quarterly (not biannual) calibration, raising their total cost of ownership. Our service response SLA is 24 hours nationwide versus their 72-hour standard. Use this when a prospect is currently under a GlobalHealth service contract.",
    authorId: "sam-okafor",
    lastUpdatedLabel: "2 days ago",
    favorited: true,
    archived: false,
    versionHistory: [],
  },
  {
    id: "kb-warranty-terms",
    title: "Equipment Warranty & Service Terms",
    category: "Technical Docs",
    summary: "Standard warranty coverage, extended warranty options, and service response SLAs.",
    content:
      "Standard warranty: 2 years parts and labor. Extended warranty (years 3–5) available at 8% of unit price per year, covers parts, labor, and one biannual calibration visit. Service response SLA: 24 hours nationwide, 4 hours for hospitals within Lagos, Abuja, or Port Harcourt metro areas.",
    authorId: "jayden-adefala",
    lastUpdatedLabel: "1 month ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
  {
    id: "kb-procurement-guide",
    title: "Hospital Procurement Process in Nigeria — Reference Guide",
    category: "Reference",
    summary: "How public and private hospital procurement typically works, and where deals stall.",
    content:
      "Public hospital procurement typically requires a competitive tender process with a minimum 3-vendor bid, sign-off from the hospital's procurement committee, and budget approval from the state or federal ministry of health depending on funding source. Private hospitals move faster — often a single decision-maker (Medical Director or CMO) can approve directly. Deals most often stall at the budget-approval stage for public hospitals — build in extra follow-up time there.",
    authorId: "sam-okafor",
    lastUpdatedLabel: "5 days ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
  {
    id: "kb-technical-faq",
    title: "Frequently Asked Technical Questions",
    category: "Technical Docs",
    summary: "The technical questions clinical staff ask most often during demos and evaluations.",
    content:
      "Q: Does the unit work during a power outage? A: Yes, 10-hour battery backup on the X200. Q: What's the noise level? A: Under 45dB at 1 meter, suitable for ICU environments. Q: Can it integrate with our existing patient monitoring system? A: Yes, via standard HL7 interface — confirm with Engineering before the demo if the hospital names a specific EMR vendor.",
    authorId: "jayden-adefala",
    lastUpdatedLabel: "4 days ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
];

let state: KnowledgeArticle[] = seedArticles;
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

export function useKnowledgeArticles(): KnowledgeArticle[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function toggleArticleFavorite(id: string) {
  state = state.map((a) => (a.id === id ? { ...a, favorited: !a.favorited } : a));
  notify();
}

export function updateKnowledgeArticle(
  id: string,
  updates: Partial<Pick<KnowledgeArticle, "title" | "category" | "summary" | "content">>,
) {
  state = state.map((a) => {
    if (a.id !== id) return a;
    const previousVersion: KnowledgeArticleVersion = {
      title: a.title,
      summary: a.summary,
      content: a.content,
      savedLabel: a.lastUpdatedLabel,
    };
    return {
      ...a,
      ...updates,
      lastUpdatedLabel: "Just now",
      versionHistory: [previousVersion, ...a.versionHistory],
    };
  });
  notify();
}

export function duplicateKnowledgeArticle(id: string): KnowledgeArticle | undefined {
  const source = state.find((a) => a.id === id);
  if (!source) return undefined;
  const copy: KnowledgeArticle = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    title: `${source.title} (Copy)`,
    archived: false,
    favorited: false,
    versionHistory: [],
    lastUpdatedLabel: "Just now",
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveKnowledgeArticles(ids: string[]) {
  state = state.map((a) => (ids.includes(a.id) ? { ...a, archived: true } : a));
  notify();
}

export function restoreKnowledgeArticle(id: string) {
  state = state.map((a) => (a.id === id ? { ...a, archived: false } : a));
  notify();
}

export function deleteKnowledgeArticle(id: string) {
  state = state.filter((a) => a.id !== id);
  notify();
}
