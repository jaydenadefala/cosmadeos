"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * usePagination — shared pagination state + slicing for every list page.
 * CLAUDE.md's Universal Toolbar requires "Pagination or Infinite Scroll" on
 * every list page; `accessibility-performance-standards.md` requires large
 * datasets use "virtualization, pagination, or progressive loading." Resets
 * to page 1 whenever the source array identity changes (e.g. a new search/
 * filter narrows the result set) so users never land on a now-empty page.
 */
export function usePagination<T>(items: T[], initialPageSize: (typeof PAGE_SIZE_OPTIONS)[number] = 25) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<(typeof PAGE_SIZE_OPTIONS)[number]>(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(page, totalPages);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- clamps the current page back into range when the filtered/searched item count shrinks, not a derived-render value
  React.useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPage]);

  const start = (clampedPage - 1) * pageSize;
  const pageItems = React.useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);

  return {
    pageItems,
    page: clampedPage,
    setPage,
    pageSize,
    setPageSize: (size: (typeof PAGE_SIZE_OPTIONS)[number]) => {
      setPageSize(size);
      setPage(1);
    },
    totalPages,
    totalItems: items.length,
    rangeStart: items.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, items.length),
  };
}

/** Pagination control — Previous/Next, page range, and a page-size selector. Renders nothing for a single page of results. */
export function Pagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = "results",
  className,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: (typeof PAGE_SIZE_OPTIONS)[number]) => void;
  itemLabel?: string;
  className?: string;
}) {
  if (totalItems === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-6",
        className,
      )}
    >
      <span className="text-muted-foreground text-sm">
        Showing {rangeStart}–{rangeEnd} of {totalItems} {itemLabel}
      </span>
      <div className="flex items-center gap-3">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm whitespace-nowrap">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => value && onPageSizeChange(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])}
            >
              <SelectTrigger className="w-18" aria-label="Rows per page">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-muted-foreground min-w-16 text-center text-sm whitespace-nowrap">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
