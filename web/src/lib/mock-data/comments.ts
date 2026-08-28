import * as React from "react";

/**
 * Shared Comments store for any entity's detail page (CLAUDE.md
 * "Functionality-First Implementation Rules" — every entity needs Comments).
 * Keyed by a caller-supplied `entityKey` (e.g. `company:company-lagos-general`)
 * so one store serves every object type rather than duplicating per entity.
 */
export interface Comment {
  id: string;
  entityKey: string;
  authorName: string;
  authorInitials: string;
  text: string;
  createdLabel: string;
}

let state: Comment[] = [];
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

export function useComments(entityKey: string): Comment[] {
  const all = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return React.useMemo(() => all.filter((c) => c.entityKey === entityKey), [all, entityKey]);
}

export function addComment(entityKey: string, authorName: string, authorInitials: string, text: string) {
  const comment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entityKey,
    authorName,
    authorInitials,
    text,
    createdLabel: "Just now",
  };
  state = [...state, comment];
  notify();
}

export function deleteComment(id: string) {
  state = state.filter((c) => c.id !== id);
  notify();
}
