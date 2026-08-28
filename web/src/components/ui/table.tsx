"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Table density — CLAUDE.md's Implementation Rules name "Density" as a
 * mandatory action on "Every operational list view... Never strip these
 * from an enterprise table," and 06 Platform Core/developer-preview-toolbar.md
 * specifies three real levels (Comfortable/Compact/Dense) affecting row
 * height. Previously only one list page (HR Directory) wired this up, and
 * even there it only had two effective states, not three. Implemented once
 * here via context (not a prop threaded through every TableCell call site)
 * so every list page can opt in with a single `density` prop on `<Table>`.
 * "comfortable" matches the pre-existing default exactly — pages that don't
 * opt in are visually unchanged.
 */
export type TableDensity = "comfortable" | "compact" | "dense"

const TableDensityContext = React.createContext<TableDensity>("comfortable")

function Table({
  className,
  density = "comfortable",
  ...props
}: React.ComponentProps<"table"> & { density?: TableDensity }) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <TableDensityContext.Provider value={density}>
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </TableDensityContext.Provider>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

const HEAD_DENSITY_CLASS: Record<TableDensity, string> = {
  comfortable: "h-10",
  compact: "h-9",
  dense: "h-7 text-xs",
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const density = React.useContext(TableDensityContext)
  return (
    <th
      data-slot="table-head"
      className={cn(
        HEAD_DENSITY_CLASS[density],
        "px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

const CELL_DENSITY_CLASS: Record<TableDensity, string> = {
  comfortable: "p-2",
  compact: "py-1.5 px-2",
  dense: "py-0.5 px-2 text-xs",
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const density = React.useContext(TableDensityContext)
  return (
    <td
      data-slot="table-cell"
      className={cn(
        CELL_DENSITY_CLASS[density],
        "align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
