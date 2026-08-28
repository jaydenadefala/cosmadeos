import * as React from "react";

/**
 * Favorites (shell) — 06 Platform Core/app-shell.md names "Favorites and
 * recents" as an App Shell component; previously Not Started. Toggled from
 * the Command Palette's search results (web/src/components/shell/
 * command-palette.tsx) — a platform-wide favorite list independent of any
 * single entity's own store.
 */
export interface FavoriteItem {
  href: string;
  label: string;
  sublabel: string;
}

let state: FavoriteItem[] = [];
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

export function useFavoriteItems(): FavoriteItem[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useIsFavorite(href: string): boolean {
  const all = useFavoriteItems();
  return React.useMemo(() => all.some((f) => f.href === href), [all, href]);
}

export function toggleFavorite(item: FavoriteItem) {
  const exists = state.some((f) => f.href === item.href);
  state = exists ? state.filter((f) => f.href !== item.href) : [item, ...state];
  notify();
}
