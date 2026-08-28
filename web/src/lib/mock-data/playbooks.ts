import * as React from "react";

/**
 * Mock Playbooks dataset + shared store for the Sales workspace
 * (05 Department Operating Systems/Sales/sales-operating-system.md:
 * "Playbooks (Knowledge-adjacent content)" — the source material leaves the
 * exact shape as a gap, so this models a playbook as a structured sales
 * guide: category, summary, ordered steps, and an author. `authorId`
 * references a real Employee id (sixth use of the referential-integrity
 * pattern). `favorited` + `toggleFavorite` give the page a genuine mutator
 * (bookmarking reference content a rep uses often, matching how Notion/
 * HubSpot content libraries behave) rather than an inert read-only array.
 *
 * `versionHistory` is real (CLAUDE.md "Functionality-First Implementation
 * Rules": Knowledge/document-type content needs Version History) — every
 * edit via `updatePlaybook` pushes the record's *previous* title/summary/
 * steps onto the array before applying the change, so History shows genuine
 * prior states, not a decorative "no history yet" placeholder.
 */
export interface PlaybookVersion {
  title: string;
  summary: string;
  steps: string[];
  savedLabel: string;
}

export interface Playbook {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
  authorId: string;
  lastUpdatedLabel: string;
  favorited: boolean;
  archived: boolean;
  versionHistory: PlaybookVersion[];
}

const seedPlaybooks: Playbook[] = [
  {
    id: "playbook-discovery-call",
    title: "Hospital Discovery Call Framework",
    category: "Discovery",
    summary:
      "A structured first call for new hospital and clinic accounts — surface budget, timeline, and current equipment pain points before proposing anything.",
    steps: [
      "Confirm who owns the purchasing decision and who else needs to sign off.",
      "Ask about current equipment age, maintenance costs, and outstanding compliance gaps.",
      "Quantify budget range and fiscal-year timing before mentioning price.",
      "Book the next step (facilities walkthrough or demo) before ending the call.",
    ],
    authorId: "sam-okafor",
    lastUpdatedLabel: "2 weeks ago",
    favorited: true,
    archived: false,
    versionHistory: [],
  },
  {
    id: "playbook-objection-budget",
    title: "Handling Budget Objections",
    category: "Objection Handling",
    summary:
      "Responses for the most common budget pushback from hospital procurement — reframing cost against downtime and compliance risk.",
    steps: [
      "Acknowledge the constraint before responding — never argue the number first.",
      "Reframe cost per year of equipment life, not sticker price.",
      "Offer financing or phased rollout as a genuine alternative, not a discount.",
      "If still stuck, escalate to a manager-level call rather than self-discounting.",
    ],
    authorId: "sam-okafor",
    lastUpdatedLabel: "1 month ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
  {
    id: "playbook-equipment-demo",
    title: "Equipment Demo Best Practices",
    category: "Demos",
    summary:
      "Running an onsite or virtual equipment demo for clinical staff, not just procurement — the people who'll use it daily decide as much as the budget owner.",
    steps: [
      "Invite the actual clinical staff who'll operate the equipment, not just procurement.",
      "Lead with the workflow it replaces, not the spec sheet.",
      "Leave time for hands-on use, not just a scripted walkthrough.",
      "Follow up within 24 hours with answers to any open questions raised live.",
    ],
    authorId: "jayden-adefala",
    lastUpdatedLabel: "3 weeks ago",
    favorited: true,
    archived: false,
    versionHistory: [],
  },
  {
    id: "playbook-multiyear-contracts",
    title: "Negotiating Multi-Year Contracts",
    category: "Negotiation",
    summary: "How to structure multi-year service and supply agreements with hospital systems.",
    steps: [
      "Anchor on a 3-year term with an annual service review checkpoint.",
      "Bundle maintenance and consumables rather than negotiating them separately.",
      "Get legal review on any custom SLA language before it reaches the customer.",
      "Confirm renewal terms are explicit — silent auto-renewal erodes trust.",
    ],
    authorId: "jayden-adefala",
    lastUpdatedLabel: "2 months ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
  {
    id: "playbook-new-account-onboarding",
    title: "Onboarding a New Hospital Account",
    category: "Onboarding",
    summary: "The handoff from closed deal to a healthy, referenceable customer relationship.",
    steps: [
      "Schedule the install/training date within 5 business days of signing.",
      "Introduce the account to their dedicated support contact by name.",
      "Set a 30-day check-in before problems have a chance to compound.",
      "Ask for a reference or case study only after the 30-day check-in goes well.",
    ],
    authorId: "sam-okafor",
    lastUpdatedLabel: "1 week ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
  {
    id: "playbook-competitive-displacement",
    title: "Competitive Displacement Playbook",
    category: "Competitive",
    summary: "Winning accounts currently under contract with a competitor's equipment.",
    steps: [
      "Identify the competitor's contract renewal date before the first call.",
      "Lead with total cost of ownership, not just the headline price.",
      "Offer a side-by-side trial period where the existing contract allows it.",
      "Document every service complaint the prospect mentions about the incumbent.",
    ],
    authorId: "jayden-adefala",
    lastUpdatedLabel: "4 days ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
];

let state: Playbook[] = seedPlaybooks;
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

export function usePlaybooks(): Playbook[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function toggleFavorite(id: string) {
  state = state.map((p) => (p.id === id ? { ...p, favorited: !p.favorited } : p));
  notify();
}

export function updatePlaybook(
  id: string,
  updates: Partial<Pick<Playbook, "title" | "category" | "summary" | "steps">>,
) {
  state = state.map((p) => {
    if (p.id !== id) return p;
    const previousVersion: PlaybookVersion = {
      title: p.title,
      summary: p.summary,
      steps: p.steps,
      savedLabel: p.lastUpdatedLabel,
    };
    return {
      ...p,
      ...updates,
      lastUpdatedLabel: "Just now",
      versionHistory: [previousVersion, ...p.versionHistory],
    };
  });
  notify();
}

export function duplicatePlaybook(id: string): Playbook | undefined {
  const source = state.find((p) => p.id === id);
  if (!source) return undefined;
  const copy: Playbook = {
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

export function archivePlaybooks(ids: string[]) {
  state = state.map((p) => (ids.includes(p.id) ? { ...p, archived: true } : p));
  notify();
}

export function restorePlaybook(id: string) {
  state = state.map((p) => (p.id === id ? { ...p, archived: false } : p));
  notify();
}

export function deletePlaybook(id: string) {
  state = state.filter((p) => p.id !== id);
  notify();
}
