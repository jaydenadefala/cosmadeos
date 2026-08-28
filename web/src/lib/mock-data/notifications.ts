import * as React from "react";

/**
 * Notification Center (shell) — 06 Platform Core/app-shell.md.
 * Previously empty-state-only (no data model existed). Seeded with
 * realistic cross-department items — approvals, mentions, reminders,
 * matching the empty state's own promised copy — following the same
 * module-level singleton store pattern used platform-wide (no backend).
 */
export type NotificationKind =
  | "success"
  | "error"
  | "warning"
  | "information"
  | "approval"
  | "mention"
  | "reminder"
  | "system";

export interface Notification {
  id: string;
  title: string;
  description: string;
  href: string;
  createdLabel: string;
  read: boolean;
  kind: NotificationKind;
}

let state: Notification[] = [
  {
    id: "notif-1",
    title: "Bill awaiting approval",
    description: "Eko Electricity Distribution — ₦1,240,000 due in 5 days.",
    href: "/finance/bills",
    createdLabel: "10 min ago",
    read: false,
    kind: "approval",
  },
  {
    id: "notif-2",
    title: "You were mentioned",
    description: "Jayden Adefala mentioned you in a comment on Adekunle & Co. Legal Services.",
    href: "/operations/vendors/vendor-adekunle-legal",
    createdLabel: "1 hour ago",
    read: false,
    kind: "mention",
  },
  {
    id: "notif-3",
    title: "Contract renewal reminder",
    description: "Lagos Business Park Ltd.'s service contract renews in 14 days.",
    href: "/operations/vendors/vendor-lagos-business-park",
    createdLabel: "3 hours ago",
    read: false,
    kind: "reminder",
  },
  {
    id: "notif-4",
    title: "Job listing published",
    description: "\"Senior Field Service Engineer\" is now live on the Careers Page.",
    href: "/hr/recruitment/job-listings",
    createdLabel: "Yesterday",
    read: true,
    kind: "system",
  },
];

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

export function useNotifications(): Notification[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useUnreadNotificationCount(): number {
  const all = useNotifications();
  return React.useMemo(() => all.filter((n) => !n.read).length, [all]);
}

export function markNotificationRead(id: string) {
  state = state.map((n) => (n.id === id ? { ...n, read: true } : n));
  notify();
}

export function markAllNotificationsRead() {
  state = state.map((n) => ({ ...n, read: true }));
  notify();
}

export function clearAllNotifications() {
  state = [];
  notify();
}

/**
 * Notification Generator (dev tool) — 06 Platform Core/
 * developer-preview-toolbar.md: "Generate test notifications: Success,
 * Error, Warning, Information, Approval Request, Mention, Reminder."
 * Pushes a real entry into this same store — the Notification Center
 * shows it exactly like any other notification, since there's no
 * separate "test" channel to fake.
 */
const SAMPLE_BY_KIND: Record<NotificationKind, { title: string; description: string }> = {
  success: { title: "Action completed", description: "A test success notification generated from the Developer Preview Toolbar." },
  error: { title: "Something went wrong", description: "A test error notification generated from the Developer Preview Toolbar." },
  warning: { title: "Needs attention", description: "A test warning notification generated from the Developer Preview Toolbar." },
  information: { title: "For your information", description: "A test informational notification generated from the Developer Preview Toolbar." },
  approval: { title: "Approval requested", description: "A test approval-request notification generated from the Developer Preview Toolbar." },
  mention: { title: "You were mentioned", description: "A test mention notification generated from the Developer Preview Toolbar." },
  reminder: { title: "Reminder", description: "A test reminder notification generated from the Developer Preview Toolbar." },
  system: { title: "System notice", description: "A test system notification generated from the Developer Preview Toolbar." },
};

export function generateTestNotification(kind: NotificationKind) {
  const sample = SAMPLE_BY_KIND[kind];
  const notification: Notification = {
    id: `notif-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: sample.title,
    description: sample.description,
    href: "/",
    createdLabel: "Just now",
    read: false,
    kind,
  };
  state = [notification, ...state];
  notify();
}
