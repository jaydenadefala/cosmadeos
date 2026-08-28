import * as React from "react";

/**
 * Saved Views — CLAUDE.md's Implementation Rules: "Every operational list
 * view carries: Search, Filters, Saved Views, Sort, Group, Columns,
 * Density, Export, Import, Refresh, Create, Bulk Actions. Never strip
 * these from an enterprise table." Previously wired on zero real
 * production pages (only the internal `/dev/list-toolbar-demo` harness).
 * Generic across every page: a saved view is just a named snapshot of
 * whatever page-defined state object the caller passes in (search string,
 * filter values, sort id, density — each page decides its own shape).
 */
export interface SavedView {
  id: string;
  pageKey: string;
  name: string;
  snapshot: Record<string, unknown>;
}

let state: SavedView[] = [];
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

export function useSavedViews(pageKey: string): SavedView[] {
  const all = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return React.useMemo(() => all.filter((v) => v.pageKey === pageKey), [all, pageKey]);
}

export function saveView(pageKey: string, name: string, snapshot: Record<string, unknown>) {
  const view: SavedView = {
    id: `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    pageKey,
    name,
    snapshot,
  };
  state = [...state, view];
  notify();
  return view;
}

export function deleteSavedView(id: string) {
  state = state.filter((v) => v.id !== id);
  notify();
}
