"use client";

import type { ComponentProps } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Filtering Standards — 03 Design Principles/interaction-patterns.md:
 * "Every list supports: Quick Filter, Advanced Filter, Saved Filter,
 * Department Filter, Date Filter, Owner Filter, Status Filter, Tag Filter,
 * Branch Filter. Search + Filters should always work together." This is
 * the generic filter builder every list view's PageToolbar "Filters"
 * button opens — field configuration is passed in, never hardcoded per
 * department.
 */
export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterFieldConfig {
  id: string;
  label: string;
  options: FilterFieldOption[];
}

export function AdvancedFilter({
  trigger,
  fields,
  values,
  onChange,
}: {
  trigger: React.ReactElement;
  fields: FilterFieldConfig[];
  values: Record<string, string | undefined>;
  onChange: (values: Record<string, string | undefined>) => void;
}) {
  const activeCount = countActiveFilters(values);

  return (
    <Popover>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="start" className="w-72">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Filters</p>
          {activeCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 p-0 text-xs"
              onClick={() => onChange({})}
            >
              <X className="size-3" />
              Clear all
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label htmlFor={`filter-${field.id}`} className="text-xs">
                {field.label}
              </Label>
              <Select
                value={values[field.id] ?? ""}
                onValueChange={(value) =>
                  onChange({ ...values, [field.id]: value === "" ? undefined : String(value) })
                }
              >
                <SelectTrigger id={`filter-${field.id}`} className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      field.options.find((o) => o.value === value)?.label ??
                      `Any ${field.label.toLowerCase()}`
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function countActiveFilters(values: Record<string, string | undefined>): number {
  return Object.values(values).filter(Boolean).length;
}

/**
 * Default trigger for AdvancedFilter's `trigger` prop — shows the active count
 * as a badge. Must spread `...props` (onClick/onPointerDown/ref/aria-*) onto
 * the underlying Button: PopoverTrigger's `render` prop injects those onto
 * this element, and without forwarding them here they're silently dropped,
 * leaving the button visually present but never actually opening the popover.
 */
export function FilterTriggerButton({
  count,
  ...props
}: { count: number } & ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" {...props}>
      <SlidersHorizontal className="size-3.5" />
      Filters
      {count > 0 ? (
        <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 justify-center px-1 text-[10px]">
          {count}
        </Badge>
      ) : null}
    </Button>
  );
}

export function ActiveFilterChips({
  fields,
  values,
  onChange,
}: {
  fields: FilterFieldConfig[];
  values: Record<string, string | undefined>;
  onChange: (values: Record<string, string | undefined>) => void;
}) {
  const active = fields
    .map((field) => ({
      field,
      option: field.options.find((o) => o.value === values[field.id]),
    }))
    .filter((entry) => entry.option);

  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b px-4 py-2 sm:px-6">
      {active.map(({ field, option }) => (
        <Badge key={field.id} variant="secondary" className="gap-1 pr-1 font-normal">
          {field.label}: {option!.label}
          <button
            type="button"
            aria-label={`Remove ${field.label} filter`}
            onClick={() => onChange({ ...values, [field.id]: undefined })}
            className="hover:bg-muted-foreground/20 ml-0.5 rounded-full p-0.5"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
