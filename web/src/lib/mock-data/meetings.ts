import * as React from "react";

/**
 * Mock Meetings dataset + shared store for the Sales workspace
 * (05 Department Operating Systems/Sales/sales-operating-system.md). Same
 * `useSyncExternalStore` pattern as the other Sales stores. `contactId` and
 * `ownerId` are real references (Contact and Employee ids respectively) —
 * the fifth use of the referential-integrity pattern. Deliberately does NOT
 * carry its own `companyId`: the company is always resolved by hopping
 * through the contact (`getContactById(contactId).companyId`), the same way
 * Open Deals is derived rather than duplicated, so a contact's company
 * reassignment can never leave a meeting pointing at a stale company.
 */
export const MEETING_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export interface Meeting {
  id: string;
  title: string;
  dateTimeLabel: string;
  contactId: string;
  ownerId: string;
  status: MeetingStatus;
  /** Outcome notes (Completed) or cancellation reason (Cancelled). */
  outcome?: string;
  archived: boolean;
}

const seedMeetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "Equipment needs discovery call",
    dateTimeLabel: "Jul 14, 2026 · 10:00 AM",
    contactId: "contact-ngozi-adeyemi",
    ownerId: "sam-okafor",
    status: "Scheduled",
    archived: false,
  },
  {
    id: "meeting-2",
    title: "Facilities walkthrough",
    dateTimeLabel: "Jul 15, 2026 · 2:00 PM",
    contactId: "contact-tunde-bakare",
    ownerId: "sam-okafor",
    status: "Scheduled",
    archived: false,
  },
  {
    id: "meeting-3",
    title: "Proposal review",
    dateTimeLabel: "Jul 10, 2026 · 11:30 AM",
    contactId: "contact-folasade-bello",
    ownerId: "sam-okafor",
    status: "Completed",
    outcome: "Requested a revised quote with extended warranty terms.",
    archived: false,
  },
  {
    id: "meeting-4",
    title: "Contract renewal check-in",
    dateTimeLabel: "Jul 8, 2026 · 9:00 AM",
    contactId: "contact-chidi-eze",
    ownerId: "jayden-adefala",
    status: "Completed",
    outcome: "Renewed for another 12 months; introduced to the new equipment line.",
    archived: false,
  },
  {
    id: "meeting-5",
    title: "Initial outreach call",
    dateTimeLabel: "Jul 3, 2026 · 3:00 PM",
    contactId: "contact-bisi-adewale",
    ownerId: "sam-okafor",
    status: "Cancelled",
    archived: false,
  },
  {
    id: "meeting-6",
    title: "Onsite equipment demo",
    dateTimeLabel: "Jul 18, 2026 · 1:00 PM",
    contactId: "contact-emeka-nwosu",
    ownerId: "jayden-adefala",
    status: "Scheduled",
    archived: false,
  },
];

let state: Meeting[] = seedMeetings;
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

export function useMeetings(): Meeting[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getMeetingsByContactIds(contactIds: string[]): Meeting[] {
  return state.filter((m) => contactIds.includes(m.contactId));
}

export function setMeetingStatus(id: string, status: MeetingStatus) {
  state = state.map((m) => (m.id === id ? { ...m, status } : m));
  notify();
}

/** Used when merging two Contact records: moves every meeting at `fromContactId` onto `toContactId`. */
export function reassignMeetingsContact(fromContactId: string, toContactId: string) {
  state = state.map((m) => (m.contactId === fromContactId ? { ...m, contactId: toContactId } : m));
  notify();
}

export function updateMeeting(
  id: string,
  updates: Partial<Omit<Meeting, "id" | "archived">>,
) {
  state = state.map((m) => (m.id === id ? { ...m, ...updates } : m));
  notify();
}

/** Reschedule is just an update to the date/time label with a real handler name, so the intent reads clearly at call sites. */
export function rescheduleMeeting(id: string, dateTimeLabel: string) {
  updateMeeting(id, { dateTimeLabel });
}

export function cancelMeeting(id: string, reason: string) {
  state = state.map((m) => (m.id === id ? { ...m, status: "Cancelled", outcome: reason } : m));
  notify();
}

export function duplicateMeeting(id: string): Meeting | undefined {
  const source = state.find((m) => m.id === id);
  if (!source) return undefined;
  const copy: Meeting = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveMeetings(ids: string[]) {
  state = state.map((m) => (ids.includes(m.id) ? { ...m, archived: true } : m));
  notify();
}

export function restoreMeeting(id: string) {
  state = state.map((m) => (m.id === id ? { ...m, archived: false } : m));
  notify();
}

export function deleteMeeting(id: string) {
  state = state.filter((m) => m.id !== id);
  notify();
}
