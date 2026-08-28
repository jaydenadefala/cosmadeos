import * as React from "react";

/**
 * Mock Research dataset + shared store — Marketing sidebar
 * (05 Department Operating Systems/Marketing/marketing-operating-system.md:
 * "Research library" — a documented Gap on data model detail). Modeled as
 * Marketing reference material (competitor analysis, market research,
 * customer insights, industry trends) — same shape/lifecycle pattern as
 * `knowledge-articles.ts` (this session's proven template for reference-
 * content sidebar items), reused rather than reinvented. `authorId`
 * references a real Employee id.
 */
export const RESEARCH_CATEGORIES = [
  "Competitor Analysis",
  "Market Research",
  "Customer Insights",
  "Industry Trends",
] as const;
export type ResearchCategory = (typeof RESEARCH_CATEGORIES)[number];

export interface ResearchItemVersion {
  title: string;
  summary: string;
  content: string;
  savedLabel: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  category: ResearchCategory;
  summary: string;
  content: string;
  authorId: string;
  lastUpdatedLabel: string;
  favorited: boolean;
  archived: boolean;
  versionHistory: ResearchItemVersion[];
}

const seedItems: ResearchItem[] = [
  {
    id: "research-globalhealth-teardown",
    title: "GlobalHealth Systems — Competitive Teardown",
    category: "Competitor Analysis",
    summary: "Pricing, service SLAs, and positioning for our most common competitive displacement target.",
    content:
      "GlobalHealth prices 8-12% below list but their 72-hour service SLA is a recurring complaint in public tender feedback. They lack NAFDAC-registered calibration partners in the North-East region — a clear regional wedge. Win rate against them is highest when the buyer has had a prior service outage.",
    authorId: "jayden-adefala",
    lastUpdatedLabel: "1 week ago",
    favorited: true,
    archived: false,
    versionHistory: [],
  },
  {
    id: "research-hospital-budget-cycles",
    title: "Nigerian Public Hospital Budget Cycle Patterns",
    category: "Market Research",
    summary: "When state and federal hospital procurement budgets typically open and close.",
    content:
      "Federal hospital capital budgets are typically approved in Q1 and spent down by Q3; state hospitals vary widely by state fiscal calendar. Best outreach window for new federal tenders is January–February, right after budget approval. Q4 outreach mostly targets private hospitals using year-end capital allowances.",
    authorId: "jayden-adefala",
    lastUpdatedLabel: "3 weeks ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
  {
    id: "research-buyer-persona-cmo",
    title: "Buyer Persona: Private Hospital CMO",
    category: "Customer Insights",
    summary: "What private-hospital Chief Medical Officers prioritize when evaluating equipment vendors.",
    content:
      "CMOs at private hospitals weight service response time and total cost of ownership over sticker price. Clinical staff training quality is the single biggest driver of repeat purchases we've seen in exit interviews. Demos that include a live equipment failure/recovery walkthrough consistently outperform spec-sheet-only demos.",
    authorId: "sam-okafor",
    lastUpdatedLabel: "5 days ago",
    favorited: true,
    archived: false,
    versionHistory: [],
  },
  {
    id: "research-telemedicine-trend",
    title: "Rise of Remote Patient Monitoring in West Africa",
    category: "Industry Trends",
    summary: "Adoption trends for connected/remote-monitoring equipment across the region.",
    content:
      "Remote patient monitoring adoption is accelerating fastest in tertiary hospitals with existing EMR infrastructure. Equipment with built-in connectivity (HL7/telemetry) is increasingly a shortlist requirement, not a nice-to-have, in RFPs issued since 2025.",
    authorId: "jayden-adefala",
    lastUpdatedLabel: "2 weeks ago",
    favorited: false,
    archived: false,
    versionHistory: [],
  },
];

let state: ResearchItem[] = seedItems;
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

export function useResearchItems(): ResearchItem[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function toggleResearchItemFavorite(id: string) {
  state = state.map((a) => (a.id === id ? { ...a, favorited: !a.favorited } : a));
  notify();
}

export function addResearchItem(input: {
  title: string;
  category: ResearchCategory;
  summary: string;
  content: string;
  authorId: string;
}): ResearchItem {
  const item: ResearchItem = {
    id: `research-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    category: input.category,
    summary: input.summary,
    content: input.content,
    authorId: input.authorId,
    lastUpdatedLabel: "Just now",
    favorited: false,
    archived: false,
    versionHistory: [],
  };
  state = [item, ...state];
  notify();
  return item;
}

export function updateResearchItem(
  id: string,
  updates: Partial<Pick<ResearchItem, "title" | "category" | "summary" | "content">>,
) {
  state = state.map((a) => {
    if (a.id !== id) return a;
    const previousVersion: ResearchItemVersion = {
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

export function duplicateResearchItem(id: string): ResearchItem | undefined {
  const source = state.find((a) => a.id === id);
  if (!source) return undefined;
  const copy: ResearchItem = {
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

export function archiveResearchItems(ids: string[]) {
  state = state.map((a) => (ids.includes(a.id) ? { ...a, archived: true } : a));
  notify();
}

export function restoreResearchItem(id: string) {
  state = state.map((a) => (a.id === id ? { ...a, archived: false } : a));
  notify();
}

export function deleteResearchItem(id: string) {
  state = state.filter((a) => a.id !== id);
  notify();
}
