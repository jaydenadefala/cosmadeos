"use client";

import * as React from "react";
import {
  ArrowDownUp,
  Columns3,
  Download,
  LayoutGrid,
  Plus,
  RefreshCw,
  Rows3,
  Search,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Density = "comfortable" | "compact" | "dense";

/**
 * Density for card-grid list pages (Benefits, Playbooks, Sales Knowledge,
 * Creative Library, Brand Assets, Research) — 06 Platform Core/
 * developer-preview-toolbar.md's Density Switcher spec names "card spacing"
 * alongside table row height. `<Table>` (web/src/components/ui/table.tsx)
 * handles the table case via its own density prop/context; these two
 * helpers give card-grid pages the same three real levels from one place.
 */
export const CARD_GRID_DENSITY_CLASS: Record<Density, string> = {
  comfortable: "gap-4 p-4 sm:p-6",
  compact: "gap-3 p-3 sm:p-4",
  dense: "gap-2 p-2 sm:p-3",
};

export const CARD_DENSITY_CLASS: Record<Density, string> = {
  comfortable: "p-4",
  compact: "p-3",
  dense: "p-2.5",
};

export interface ToolbarOption {
  label: string;
  onSelect: () => void;
}

export interface ColumnOption {
  id: string;
  label: string;
  visible: boolean;
}

export interface BulkAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

/**
 * Universal Toolbar — 03 Design Principles/interaction-patterns.md:
 * "Every operational page has a toolbar containing: Search, Filters, Saved
 * Views, Sort, Group, Columns, Density, Export, Import, Refresh, Create,
 * Bulk Actions. Never remove these capabilities from an enterprise table."
 * Every prop is optional except search — a list that genuinely has no
 * saved views, for example, simply omits that prop rather than rendering
 * a disabled control.
 */
export function PageToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  savedViews,
  savedViewsControl,
  sortOptions,
  groupOptions,
  columns,
  onColumnToggle,
  density = "comfortable",
  onDensityChange,
  onExport,
  onImport,
  onRefresh,
  onCreate,
  createLabel = "Create",
  selectedCount = 0,
  bulkActions,
  onClearSelection,
  className,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Pass an AdvancedFilter trigger element here — PageToolbar just places it, it doesn't own filter UI. */
  filters?: React.ReactNode;
  savedViews?: ToolbarOption[];
  /** Pass a <SavedViewsMenu ... /> here — richer than `savedViews` (apply + save + delete). Takes precedence if both are supplied. */
  savedViewsControl?: React.ReactNode;
  sortOptions?: ToolbarOption[];
  groupOptions?: ToolbarOption[];
  columns?: ColumnOption[];
  onColumnToggle?: (id: string) => void;
  density?: Density;
  onDensityChange?: (density: Density) => void;
  onExport?: () => void;
  onImport?: () => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  selectedCount?: number;
  bulkActions?: BulkAction[];
  onClearSelection?: () => void;
  className?: string;
}) {
  if (selectedCount > 0 && bulkActions && bulkActions.length > 0) {
    return (
      <div className={cn("bg-accent/50 flex flex-wrap items-center gap-2 border-b px-4 py-2 sm:px-6", className)}>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="gap-1.5">
          <X className="size-3.5" />
          {selectedCount} selected
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant === "destructive" ? "destructive" : "outline"}
              onClick={action.onClick}
            >
              {action.icon ? <action.icon className="size-3.5" /> : null}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b px-4 py-2 sm:px-6", className)}>
      <div className="relative min-w-40 flex-1 sm:max-w-xs">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label="Search"
        />
      </div>

      {filters}

      {savedViewsControl ?? (savedViews && savedViews.length > 0 ? (
        <ToolbarDropdown label="Saved Views" options={savedViews} />
      ) : null)}

      {sortOptions && sortOptions.length > 0 ? (
        <ToolbarDropdown label="Sort" icon={ArrowDownUp} options={sortOptions} />
      ) : null}

      {groupOptions && groupOptions.length > 0 ? (
        <ToolbarDropdown label="Group" icon={LayoutGrid} options={groupOptions} />
      ) : null}

      {columns && columns.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
            <Columns3 className="size-3.5" />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {columns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.visible}
                onCheckedChange={() => onColumnToggle?.(col.id)}
                closeOnClick={false}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      {onDensityChange ? (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Density" />}>
            <Rows3 className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(["comfortable", "compact", "dense"] as const).map((d) => (
              <DropdownMenuCheckboxItem
                key={d}
                checked={density === d}
                onCheckedChange={() => onDensityChange(d)}
                closeOnClick={false}
                className="capitalize"
              >
                {d}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {onImport ? (
          <IconButton label="Import" icon={Upload} onClick={onImport} />
        ) : null}
        {onExport ? (
          <IconButton label="Export" icon={Download} onClick={onExport} />
        ) : null}
        {onRefresh ? (
          <IconButton label="Refresh" icon={RefreshCw} onClick={onRefresh} />
        ) : null}
        {onCreate ? (
          <Button size="sm" onClick={onCreate} className="gap-1.5">
            <Plus className="size-3.5" />
            {createLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ToolbarDropdown({
  label,
  icon: Icon,
  options,
}: {
  label: string;
  icon?: LucideIcon;
  options: ToolbarOption[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuItem key={option.label} onClick={option.onSelect}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon" aria-label={label} onClick={onClick} />}>
        <Icon className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
