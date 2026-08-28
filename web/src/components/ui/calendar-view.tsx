"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(monthAnchor: Date): Date[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

/**
 * Calendar View — a named Universal Workspace Component
 * (04 Enterprise Architecture/enterprise-information-architecture.md),
 * parallel to `KanbanBoard` as the platform's first Board View instance.
 * Month grid with day cells; each cell renders the items scheduled on that
 * date via `renderItem`. Not a Drag & Drop surface — 03 Design Principles/
 * interaction-patterns.md's Drag & Drop standard lists Kanban, Media
 * Library, and Campaign Builder, not Content Calendar, so rescheduling here
 * goes through a real form field (the edit sheet), same as any other
 * date-bearing entity in this app.
 */
export function CalendarView<T extends { id: string }>({
  month,
  onMonthChange,
  items,
  getItemDate,
  renderItem,
  onDayClick,
  maxPerDay = 3,
}: {
  /** Any date within the month to display. */
  month: Date;
  onMonthChange: (month: Date) => void;
  items: T[];
  getItemDate: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  onDayClick?: (dateIso: string) => void;
  maxPerDay?: number;
}) {
  const days = React.useMemo(() => buildMonthGrid(month), [month]);
  const todayIso = toIsoDate(new Date());
  const currentMonth = month.getMonth();

  const itemsByDate = React.useMemo(() => {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const iso = getItemDate(item);
      if (!iso) continue;
      const list = map.get(iso) ?? [];
      list.push(item);
      map.set(iso, list);
    }
    return map;
  }, [items, getItemDate]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <h2 className="text-sm font-semibold">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth(), 1))}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous month"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next month"
            onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-l text-center text-xs font-medium">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-muted-foreground border-r border-b py-1.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 overflow-auto border-l">
        {days.map((day) => {
          const iso = toIsoDate(day);
          const dayItems = itemsByDate.get(iso) ?? [];
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = iso === todayIso;

          return (
            <div
              key={iso}
              className={cn(
                "flex min-h-20 flex-col items-stretch gap-1 border-r border-b p-1.5 align-top",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
              )}
            >
              <button
                onClick={() => onDayClick?.(iso)}
                aria-label={`${iso}${onDayClick ? " — add content" : ""}`}
                className="self-start"
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-xs font-medium",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {day.getDate()}
                </span>
              </button>
              <div className="flex flex-col gap-1">
                {dayItems.slice(0, maxPerDay).map((item) => (
                  <div key={item.id}>{renderItem(item)}</div>
                ))}
                {dayItems.length > maxPerDay ? (
                  <span className="text-muted-foreground text-[11px]">
                    +{dayItems.length - maxPerDay} more
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
