import * as React from "react";

/**
 * Mock Campaigns dataset + shared store for the Marketing workspace
 * (05 Department Operating Systems/Marketing/marketing-operating-system.md).
 * Same `useSyncExternalStore` pattern as every other department this
 * session. `designerId` references a real Employee id (referential-
 * integrity pattern, applied from the start per CLAUDE.md's Functionality-
 * First standard, not retrofitted later). Unlike several earlier entities
 * (e.g. Meeting.dateTimeLabel), dates are stored as real ISO strings with a
 * `formatDate` display helper — this is a fresh build, not constrained by
 * an existing free-text shape, so there's no reason to store a label
 * instead of a real date.
 */
export const CAMPAIGN_STATUSES = ["Draft", "Active", "Paused", "Completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_CHANNELS = ["Email", "Social", "Paid Ads", "Event", "Content"] as const;
export type CampaignChannel = (typeof CAMPAIGN_CHANNELS)[number];

export type ApprovalStatus = "Pending" | "Approved";

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  description: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  approvalStatus: ApprovalStatus;
  budget: number;
  /** ISO date string (yyyy-mm-dd) — see `formatDate` for display. */
  startDate: string;
  endDate: string;
  designerId?: string;
  lastUpdatedLabel: string;
  archived: boolean;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const seedCampaigns: Campaign[] = [
  {
    id: "campaign-q3-tradeshow",
    name: "Q3 Hospital Trade Show Tour",
    objective: "Generate qualified leads from regional hospital procurement fairs.",
    description:
      "A 3-city trade show tour (Lagos, Abuja, Port Harcourt) showcasing the X200 ventilator line with live demos and a dedicated lead-capture booth staffed by Sales and Engineering.",
    channel: "Event",
    status: "Active",
    approvalStatus: "Approved",
    budget: 4500000,
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    designerId: "jayden-adefala",
    lastUpdatedLabel: "2 days ago",
    archived: false,
  },
  {
    id: "campaign-linkedin-thought-leadership",
    name: "LinkedIn Thought Leadership Series",
    objective: "Build brand authority among hospital procurement decision-makers.",
    description:
      "Weekly LinkedIn posts from clinical and engineering leadership on equipment maintenance best practices, compliance updates, and case studies from existing customers.",
    channel: "Social",
    status: "Active",
    approvalStatus: "Approved",
    budget: 800000,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    lastUpdatedLabel: "5 hours ago",
    archived: false,
  },
  {
    id: "campaign-upgrade-nurture",
    name: "Equipment Upgrade Email Nurture",
    objective: "Re-engage customers with equipment approaching end-of-warranty.",
    description:
      "A 4-email nurture sequence targeting customers whose equipment warranty expires within 6 months, offering an extended warranty or upgrade path.",
    channel: "Email",
    status: "Draft",
    approvalStatus: "Pending",
    budget: 150000,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    lastUpdatedLabel: "1 day ago",
    archived: false,
  },
  {
    id: "campaign-nafdac-webinar",
    name: "NAFDAC Compliance Webinar",
    objective:
      "Educate prospects on regulatory requirements while positioning Cosmade as the compliant choice.",
    description:
      "A live webinar covering NAFDAC and FDA certification requirements for medical equipment procurement, with a Q&A segment and a follow-up compliance guide download.",
    channel: "Content",
    status: "Paused",
    approvalStatus: "Approved",
    budget: 300000,
    startDate: "2026-05-15",
    endDate: "2026-05-15",
    lastUpdatedLabel: "3 weeks ago",
    archived: false,
  },
  {
    id: "campaign-distributor-comarketing",
    name: "Regional Distributor Co-Marketing",
    objective: "Expand reach into secondary markets through distributor partnerships.",
    description:
      "Co-branded print and digital ads run jointly with regional distribution partners in Kano and Enugu, splitting cost 50/50.",
    channel: "Paid Ads",
    status: "Completed",
    approvalStatus: "Approved",
    budget: 1200000,
    startDate: "2026-02-01",
    endDate: "2026-04-30",
    lastUpdatedLabel: "2 months ago",
    archived: false,
  },
];

let state: Campaign[] = seedCampaigns;
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

export function useCampaigns(): Campaign[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function addCampaign(input: {
  name: string;
  objective: string;
  description: string;
  channel: CampaignChannel;
  budget: number;
  startDate: string;
  endDate: string;
  designerId?: string;
}): Campaign {
  let id = slugify(input.name) || `campaign-${Date.now()}`;
  if (state.some((c) => c.id === id)) id = `${id}-${state.length}`;

  const campaign: Campaign = {
    id,
    name: input.name,
    objective: input.objective,
    description: input.description,
    channel: input.channel,
    status: "Draft",
    approvalStatus: "Pending",
    budget: input.budget,
    startDate: input.startDate,
    endDate: input.endDate,
    designerId: input.designerId,
    lastUpdatedLabel: "Just now",
    archived: false,
  };
  state = [campaign, ...state];
  notify();
  return campaign;
}

export function updateCampaign(
  id: string,
  updates: Partial<
    Pick<Campaign, "name" | "objective" | "description" | "channel" | "budget" | "startDate" | "endDate">
  >,
) {
  state = state.map((c) => (c.id === id ? { ...c, ...updates, lastUpdatedLabel: "Just now" } : c));
  notify();
}

export function setCampaignStatus(id: string, status: CampaignStatus) {
  state = state.map((c) => (c.id === id ? { ...c, status, lastUpdatedLabel: "Just now" } : c));
  notify();
}

export function approveCampaign(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, approvalStatus: "Approved" } : c));
  notify();
}

export function assignDesigner(id: string, designerId: string) {
  state = state.map((c) => (c.id === id ? { ...c, designerId } : c));
  notify();
}

export function duplicateCampaign(id: string): Campaign | undefined {
  const source = state.find((c) => c.id === id);
  if (!source) return undefined;
  const copy: Campaign = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name} (Copy)`,
    status: "Draft",
    approvalStatus: "Pending",
    archived: false,
    lastUpdatedLabel: "Just now",
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveCampaigns(ids: string[]) {
  state = state.map((c) => (ids.includes(c.id) ? { ...c, archived: true } : c));
  notify();
}

export function restoreCampaign(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, archived: false } : c));
  notify();
}

export function deleteCampaign(id: string) {
  state = state.filter((c) => c.id !== id);
  notify();
}

export function importCampaigns(rows: { name: string; channel: CampaignChannel; budget: number }[]) {
  return rows.map((row) =>
    addCampaign({
      name: row.name,
      objective: "Imported campaign — add an objective.",
      description: "",
      channel: row.channel,
      budget: row.budget,
      startDate: "",
      endDate: "",
    }),
  );
}
