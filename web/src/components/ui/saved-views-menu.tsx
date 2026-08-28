"use client";

import * as React from "react";
import { Bookmark, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteSavedView, saveView, useSavedViews } from "@/lib/mock-data/saved-views";

/**
 * Saved Views control — plugs into `PageToolbar`'s `savedViewsControl` slot
 * the same way `AdvancedFilter` plugs into `filters`. Generic across every
 * list page: `snapshot` is whatever page-defined state object (search,
 * filters, sort, density) the caller wants a named view to capture;
 * `onApply` receives that same shape back when a saved view is selected.
 */
export function SavedViewsMenu({
  pageKey,
  snapshot,
  onApply,
}: {
  pageKey: string;
  snapshot: Record<string, unknown>;
  onApply: (snapshot: Record<string, unknown>) => void;
}) {
  const views = useSavedViews(pageKey);
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveView(pageKey, trimmed, snapshot);
    toast.success(`View "${trimmed}" saved.`);
    setName("");
    setSaving(false);
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setSaving(false);
      }}
    >
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Bookmark className="size-3.5" />
        Saved Views
        {views.length > 0 ? <span className="text-muted-foreground">({views.length})</span> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {views.length === 0 ? (
          <p className="text-muted-foreground px-2 py-1.5 text-xs">No saved views yet.</p>
        ) : (
          views.map((view) => (
            <DropdownMenuItem
              key={view.id}
              className="justify-between"
              onClick={() => {
                onApply(view.snapshot);
                toast.success(`"${view.name}" applied.`);
              }}
            >
              <span className="truncate">{view.name}</span>
              <button
                type="button"
                aria-label={`Delete view "${view.name}"`}
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSavedView(view.id);
                  toast.success(`"${view.name}" deleted.`);
                }}
              >
                <X className="size-3.5" />
              </button>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        {saving ? (
          <div className="flex items-center gap-1.5 p-1.5">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="View name…"
              className="h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setSaving(false);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <Button size="sm" className="h-8 shrink-0" disabled={!name.trim()} onClick={handleSave}>
              Save
            </Button>
          </div>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setSaving(true);
            }}
          >
            <Plus className="size-3.5" />
            Save current view…
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
