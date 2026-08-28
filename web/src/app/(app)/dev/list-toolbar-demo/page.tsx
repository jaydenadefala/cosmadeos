"use client";

import { notFound } from "next/navigation";
import * as React from "react";
import { Archive, Tag, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  ActiveFilterChips,
  AdvancedFilter,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { PageToolbar } from "@/components/ui/page-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FILTER_FIELDS: FilterFieldConfig[] = [
  {
    id: "department",
    label: "Department",
    options: [
      { value: "engineering", label: "Engineering" },
      { value: "sales", label: "Sales" },
      { value: "finance", label: "Finance" },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "invited", label: "Invited" },
    ],
  },
];

const ROWS = [
  { id: "1", name: "Abby Huang", access: "Employee" },
  { id: "2", name: "Adriano Leal", access: "Employee" },
  { id: "3", name: "Alexandre Hamilton", access: "Employee" },
];

/**
 * Dev-only verification harness for PageToolbar + AdvancedFilter + the
 * bulk-action-bar pattern (Phase 3).
 */
export default function ListToolbarDemo() {
  if (process.env.NODE_ENV === "production") notFound();

  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [density, setDensity] = React.useState<"comfortable" | "compact" | "dense">("comfortable");

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search people…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={FILTER_FIELDS}
            values={filters}
            onChange={setFilters}
          />
        }
        savedViews={[{ label: "My Team", onSelect: () => {} }]}
        sortOptions={[{ label: "Name (A-Z)", onSelect: () => {} }]}
        groupOptions={[{ label: "By Department", onSelect: () => {} }]}
        columns={[
          { id: "name", label: "Name", visible: true },
          { id: "access", label: "Access", visible: true },
        ]}
        density={density}
        onDensityChange={setDensity}
        onExport={() => {}}
        onImport={() => {}}
        onRefresh={() => {}}
        onCreate={() => {}}
        createLabel="Add Employee"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          { label: "Tag", icon: Tag, onClick: () => {} },
          { label: "Archive", icon: Archive, onClick: () => {} },
          { label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" },
        ]}
      />
      <ActiveFilterChips fields={FILTER_FIELDS} values={filters} onChange={setFilters} />

      <div className="p-4 sm:p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Name</TableHead>
              <TableHead>Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((row) => (
              <TableRow key={row.id} data-state={selected.includes(row.id) ? "selected" : undefined}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                    aria-label={`Select ${row.name}`}
                  />
                </TableCell>
                <TableCell className="text-primary font-medium">{row.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{row.access}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
