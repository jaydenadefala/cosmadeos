"use client";

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableDensity,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import type { Employee } from "@/lib/mock-data/employees";

const COLUMNS = ["", "Name", "Access"];

/**
 * Employee Directory table row — 11 UX System/design-system-teardown.md:
 * "Row: checkbox, circular avatar (initials fallback), employee name (bold,
 * purple, clickable), secondary text below the name (Invited/Pending/
 * department/role), Access column (plain text — not giant badges)."
 * Shared component (ROADMAP.md) — reused anywhere an employee list renders.
 */
export function EmployeeTable({
  employees,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  density = "comfortable",
}: {
  employees: Employee[];
  loading?: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  density?: TableDensity;
}) {
  if (loading) {
    return <TableSkeleton columns={COLUMNS.slice(1)} />;
  }

  const allSelected = employees.length > 0 && selectedIds.length === employees.length;

  return (
    <Table density={density}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleSelectAll}
              aria-label="Select all employees"
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Access</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const secondaryText =
            employee.status !== "Active"
              ? employee.status
              : `${employee.department} · ${employee.title}`;

          return (
            <TableRow
              key={employee.id}
              data-state={selectedIds.includes(employee.id) ? "selected" : undefined}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(employee.id)}
                  onCheckedChange={() => onToggleSelect(employee.id)}
                  aria-label={`Select ${employee.name}`}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/hr/directory/${employee.id}`}
                  className="flex items-center gap-3 py-1"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">{employee.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex flex-col">
                    <span className="text-primary font-semibold whitespace-nowrap">
                      {employee.name}
                    </span>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {secondaryText}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-foreground/80">{employee.access}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
