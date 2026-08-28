"use client";

import * as React from "react";

import type { ColumnOption } from "@/components/ui/page-toolbar";

/**
 * Column Visibility — CLAUDE.md's Implementation Rules name "Columns" as a
 * mandatory action on every operational list view. `PageToolbar` already
 * had the UI (a `columns`/`onColumnToggle` prop pair) but it was wired on
 * zero real production pages. This hook is the missing other half: track
 * which columns are visible, expose the shape `PageToolbar` already
 * expects, and let a page conditionally render its `<TableHead>`/
 * `<TableCell>` pairs against `isVisible(id)`.
 */
export function useColumnVisibility(initial: { id: string; label: string; defaultVisible?: boolean }[]) {
  const [hidden, setHidden] = React.useState<Set<string>>(
    () => new Set(initial.filter((c) => c.defaultVisible === false).map((c) => c.id)),
  );

  const columns: ColumnOption[] = React.useMemo(
    () => initial.map((c) => ({ id: c.id, label: c.label, visible: !hidden.has(c.id) })),
    [initial, hidden],
  );

  const isVisible = React.useCallback((id: string) => !hidden.has(id), [hidden]);

  const toggle = React.useCallback((id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setHiddenIds = React.useCallback((ids: string[]) => {
    setHidden(new Set(ids));
  }, []);

  return { columns, isVisible, toggle, hiddenIds: Array.from(hidden), setHiddenIds };
}
