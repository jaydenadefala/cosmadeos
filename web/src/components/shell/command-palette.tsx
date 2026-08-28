"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Star, Clock, StarOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { workspaces } from "@/lib/navigation";
import { useGlobalSearchResults } from "@/lib/use-global-search";
import { addRecentItem, useRecentItems } from "@/lib/mock-data/recents";
import { useFavoriteItems, toggleFavorite } from "@/lib/mock-data/favorites";

/**
 * Global Command Palette — 06 Platform Core/global-command-palette.md.
 * Implements: Navigate (workspace jump list), Search (real cross-entity
 * typeahead — web/src/lib/use-global-search.ts), and Create (quick-create
 * shortcuts to each entity's list page, where every Create flow already
 * lives as an inline Sheet/Dialog per ADR-003). "Run Workflow" / "Generate
 * AI Summary" / "Generate Report" remain deferred — no Workflow Builder or
 * AI backend exists yet; Generate Report now routes to each department's
 * real Reports page instead of staying entirely unbuilt.
 */
const CREATE_SHORTCUTS = [
  { label: "Create Employee", href: "/hr/directory" },
  { label: "Create Vendor", href: "/operations/vendors" },
  { label: "Create Invoice", href: "/finance/invoices" },
  { label: "Create Campaign", href: "/marketing/campaigns/new" },
  { label: "Create Knowledge Article", href: "/knowledge/articles/new" },
  { label: "Create Lead", href: "/sales/leads" },
  { label: "Create Company", href: "/sales/companies" },
  { label: "Create Contact", href: "/sales/contacts" },
];

const REPORT_SHORTCUTS = [
  { label: "Generate Sales Report", href: "/sales/reports" },
  { label: "Generate Marketing Report", href: "/marketing/reports" },
  { label: "Generate Finance Report", href: "/finance/reports" },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const searchResults = useGlobalSearchResults(query);
  const recentItems = useRecentItems();
  const favoriteItems = useFavoriteItems();
  const favoriteHrefs = React.useMemo(() => new Set(favoriteItems.map((f) => f.href)), [favoriteItems]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (href: string, recent?: { label: string; sublabel: string }) => {
    setOpen(false);
    setQuery("");
    if (recent) addRecentItem({ label: recent.label, sublabel: recent.sublabel, href });
    router.push(href);
  };

  const groupedResults = React.useMemo(() => {
    const groups = new Map<string, typeof searchResults>();
    for (const r of searchResults) {
      const list = groups.get(r.group) ?? [];
      list.push(r);
      groups.set(r.group, list);
    }
    return groups;
  }, [searchResults]);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-muted-foreground h-9 w-full max-w-sm justify-start gap-2 rounded-md px-3 font-normal shadow-none sm:w-64"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Search anything…</span>
        <span className="sm:hidden">Search…</span>
        <CommandShortcut className="ml-auto hidden sm:inline">
          ⌘K
        </CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search employees, invoices, vendors, campaigns, knowledge…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {query.trim() ? (
            Array.from(groupedResults.entries()).map(([group, results]) => (
              <CommandGroup key={group} heading={group}>
                {results.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={`${r.label} ${r.sublabel}`}
                    onSelect={() => go(r.href, { label: r.label, sublabel: r.sublabel })}
                  >
                    <r.icon className="size-4" />
                    <span className="flex-1">{r.label}</span>
                    <span className="text-muted-foreground text-xs">{r.sublabel}</span>
                    <button
                      type="button"
                      aria-label={favoriteHrefs.has(r.href) ? "Remove from favorites" : "Add to favorites"}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({ href: r.href, label: r.label, sublabel: r.sublabel });
                      }}
                    >
                      {favoriteHrefs.has(r.href) ? (
                        <Star className="size-3.5 fill-current" />
                      ) : (
                        <Star className="size-3.5" />
                      )}
                    </button>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))
          ) : (
            <>
              {favoriteItems.length > 0 ? (
                <CommandGroup heading="Favorites">
                  {favoriteItems.map((f) => (
                    <CommandItem
                      key={f.href}
                      value={`favorite ${f.label}`}
                      onSelect={() => go(f.href, { label: f.label, sublabel: f.sublabel })}
                    >
                      <Star className="size-4 fill-current" />
                      <span className="flex-1">{f.label}</span>
                      <span className="text-muted-foreground text-xs">{f.sublabel}</span>
                      <button
                        type="button"
                        aria-label="Remove from favorites"
                        className="text-muted-foreground hover:text-foreground shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(f);
                        }}
                      >
                        <StarOff className="size-3.5" />
                      </button>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {recentItems.length > 0 ? (
                <CommandGroup heading="Recent">
                  {recentItems.map((r) => (
                    <CommandItem
                      key={r.href}
                      value={`recent ${r.label}`}
                      onSelect={() => go(r.href, { label: r.label, sublabel: r.sublabel })}
                    >
                      <Clock className="size-4" />
                      <span className="flex-1">{r.label}</span>
                      <span className="text-muted-foreground text-xs">{r.sublabel}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              <CommandGroup heading="Navigate">
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    value={`navigate ${workspace.label}`}
                    onSelect={() => go(workspace.href)}
                  >
                    <workspace.icon className="size-4" />
                    {workspace.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Create">
                {CREATE_SHORTCUTS.map((s) => (
                  <CommandItem key={s.label} value={s.label} onSelect={() => go(s.href)}>
                    <Plus className="size-4" />
                    {s.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Reports">
                {REPORT_SHORTCUTS.map((s) => (
                  <CommandItem key={s.label} value={s.label} onSelect={() => go(s.href)}>
                    <Star className="size-4" />
                    {s.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
