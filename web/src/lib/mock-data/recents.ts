import * as React from "react";

/**
 * Recents (shell) — 06 Platform Core/app-shell.md names "Favorites and
 * recents" as an App Shell component; previously Not Started. Auto-tracked:
 * every record opened via the Command Palette's Search results is recorded
 * here, most-recent-first, deduped by href, capped at 8 — no manual
 * "mark as recent" action exists in real products either.
 */
export interface RecentItem {
  label: string;
  sublabel: string;
  href: string;
  visitedAt: number;
}

let state: RecentItem[] = [];
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

export function useRecentItems(): RecentItem[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addRecentItem(item: { label: string; sublabel: string; href: string }) {
  const withoutDupe = state.filter((r) => r.href !== item.href);
  state = [{ ...item, visitedAt: Date.now() }, ...withoutDupe].slice(0, 8);
  notify();
}
