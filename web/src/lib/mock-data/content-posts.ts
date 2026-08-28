import * as React from "react";

/**
 * Mock Content Calendar dataset + shared store — Marketing sidebar
 * (05 Department Operating Systems/Marketing/marketing-operating-system.md:
 * "Content Calendar (Calendar View Universal Workspace Component)"). Same
 * `useSyncExternalStore` pattern as campaigns.ts. `campaignId` is a real,
 * optional link back to a Campaign (CLAUDE.md "Every Module Must Be
 * Connected"); `authorId` a real Employee reference — same referential-
 * integrity pattern proven throughout this session.
 */
export const CONTENT_TYPES = ["Blog Post", "Social Post", "Email", "Video"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_STATUSES = ["Draft", "Scheduled", "Published"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export interface ContentPost {
  id: string;
  title: string;
  contentType: ContentType;
  status: ContentStatus;
  scheduledDate: string;
  authorId?: string;
  campaignId?: string;
  archived: boolean;
}

const seedPosts: ContentPost[] = [
  {
    id: "post-linkedin-week1",
    title: "5 Signs Your Ventilator Fleet Needs Preventive Maintenance",
    contentType: "Social Post",
    status: "Published",
    scheduledDate: "2026-07-06",
    authorId: "jayden-adefala",
    campaignId: "campaign-linkedin-thought-leadership",
    archived: false,
  },
  {
    id: "post-linkedin-week2",
    title: "Case Study: Cutting Downtime 30% at Lagos General",
    contentType: "Social Post",
    status: "Scheduled",
    scheduledDate: "2026-07-13",
    authorId: "jayden-adefala",
    campaignId: "campaign-linkedin-thought-leadership",
    archived: false,
  },
  {
    id: "post-nurture-email-1",
    title: "Is Your Warranty Expiring? Here's What to Know",
    contentType: "Email",
    status: "Draft",
    scheduledDate: "2026-08-05",
    authorId: "jayden-adefala",
    campaignId: "campaign-upgrade-nurture",
    archived: false,
  },
  {
    id: "post-tradeshow-teaser",
    title: "Meet Us at the Q3 Hospital Trade Show Tour",
    contentType: "Blog Post",
    status: "Scheduled",
    scheduledDate: "2026-07-28",
    authorId: "jayden-adefala",
    campaignId: "campaign-q3-tradeshow",
    archived: false,
  },
  {
    id: "post-webinar-recap",
    title: "NAFDAC Compliance Webinar — Key Takeaways",
    contentType: "Video",
    status: "Published",
    scheduledDate: "2026-05-16",
    authorId: "jayden-adefala",
    campaignId: "campaign-nafdac-webinar",
    archived: false,
  },
];

let state: ContentPost[] = seedPosts;
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

export function useContentPosts(): ContentPost[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addContentPost(input: {
  title: string;
  contentType: ContentType;
  scheduledDate: string;
  authorId?: string;
  campaignId?: string;
}): ContentPost {
  const post: ContentPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    contentType: input.contentType,
    status: "Draft",
    scheduledDate: input.scheduledDate,
    authorId: input.authorId,
    campaignId: input.campaignId,
    archived: false,
  };
  state = [post, ...state];
  notify();
  return post;
}

export function updateContentPost(
  id: string,
  updates: Partial<
    Pick<ContentPost, "title" | "contentType" | "scheduledDate" | "authorId" | "campaignId">
  >,
) {
  state = state.map((p) => (p.id === id ? { ...p, ...updates } : p));
  notify();
}

export function schedulePost(id: string, scheduledDate: string) {
  state = state.map((p) =>
    p.id === id ? { ...p, scheduledDate, status: p.status === "Draft" ? "Scheduled" : p.status } : p,
  );
  notify();
}

export function setPostStatus(id: string, status: ContentStatus) {
  state = state.map((p) => (p.id === id ? { ...p, status } : p));
  notify();
}

export function duplicateContentPost(id: string): ContentPost | undefined {
  const source = state.find((p) => p.id === id);
  if (!source) return undefined;
  const copy: ContentPost = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    title: `${source.title} (Copy)`,
    status: "Draft",
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveContentPosts(ids: string[]) {
  state = state.map((p) => (ids.includes(p.id) ? { ...p, archived: true } : p));
  notify();
}

export function restoreContentPost(id: string) {
  state = state.map((p) => (p.id === id ? { ...p, archived: false } : p));
  notify();
}

export function deleteContentPost(id: string) {
  state = state.filter((p) => p.id !== id);
  notify();
}
