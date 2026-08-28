"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal, Receipt, Trash2 } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BillEditSheet } from "@/components/finance/bill-edit-sheet";
import {
  archiveBills,
  BILL_CATEGORIES,
  BILL_STATUSES,
  deleteBill,
  duplicateBill,
  markBillPaid,
  useBills,
  type Bill,
  type BillStatus,
} from "@/lib/mock-data/bills";
import { useVendors } from "@/lib/mock-data/vendors";

const STATUS_TONE: Record<BillStatus, string> = {
  Unpaid: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Overdue: "bg-destructive/10 text-destructive",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Bill[], vendorName: (id: string) => string) {
  const header = ["Bill #", "Vendor", "Category", "Amount", "Status", "Issue Date", "Due Date"];
  const lines = rows.map((r) =>
    [r.billNumber, vendorName(r.vendorId), r.category, String(r.amount), r.status, r.issueDate, r.dueDate]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bills.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Bills (Accounts Payable) — Finance sidebar (05 Department Operating Systems/Finance/finance-operating-system.md). */
export default function BillsPage() {
  const allBills = useBills();
  const vendors = useVendors();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">(
    "date-desc",
  );
  const [loading, setLoading] = React.useState(false);
  const [editingBill, setEditingBill] = React.useState<Bill | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const columnVisibility = useColumnVisibility([
    { id: "category", label: "Category" },
    { id: "status", label: "Status" },
    { id: "dueDate", label: "Due Date" },
  ]);

  const bills = React.useMemo(() => allBills.filter((b) => !b.archived), [allBills]);

  const vendorById = React.useMemo(() => {
    const map = new Map<string, (typeof vendors)[number]>();
    for (const vendor of vendors) map.set(vendor.id, vendor);
    return map;
  }, [vendors]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "status", label: "Status", options: BILL_STATUSES.map((s) => ({ value: s, label: s })) },
      { id: "category", label: "Category", options: BILL_CATEGORIES.map((c) => ({ value: c, label: c })) },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = bills;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (b) =>
          b.billNumber.toLowerCase().includes(q) ||
          (vendorById.get(b.vendorId)?.name.toLowerCase().includes(q) ?? false),
      );
    }
    if (filters.status) rows = rows.filter((b) => b.status === filters.status);
    if (filters.category) rows = rows.filter((b) => b.category === filters.category);
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.issueDate.localeCompare(b.issueDate);
        case "date-desc":
          return b.issueDate.localeCompare(a.issueDate);
        case "amount-asc":
          return a.amount - b.amount;
        case "amount-desc":
          return b.amount - a.amount;
      }
    });
    return rows;
  }, [bills, search, filters, sort, vendorById]);

  const pagination = usePagination(filtered);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (
      snapshot.sort === "date-desc" ||
      snapshot.sort === "date-asc" ||
      snapshot.sort === "amount-desc" ||
      snapshot.sort === "amount-asc"
    ) {
      setSort(snapshot.sort);
    }
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
    if (Array.isArray(snapshot.hiddenColumns)) {
      columnVisibility.setHiddenIds(snapshot.hiddenColumns as string[]);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Bills</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {bills.length} bills
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bills…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        sortOptions={[
          { label: "Issue Date (Newest)", onSelect: () => setSort("date-desc") },
          { label: "Issue Date (Oldest)", onSelect: () => setSort("date-asc") },
          { label: "Amount (High–Low)", onSelect: () => setSort("amount-desc") },
          { label: "Amount (Low–High)", onSelect: () => setSort("amount-asc") },
        ]}
        savedViewsControl={
          <SavedViewsMenu
            pageKey="finance-bills"
            snapshot={{ search, filters, sort, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onExport={() => {
          exportToCsv(filtered, (id) => vendorById.get(id)?.name ?? "—");
          toast.success("Bills exported.");
        }}
        onRefresh={handleRefresh}
        onCreate={() => setCreateOpen(true)}
        createLabel="New Bill"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveBills(selected);
              toast.success(`${selected.length} bill${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteBill(id));
              toast.success(`${selected.length} bill${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4 sm:p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : bills.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No bills yet"
            description="Record a vendor bill to start tracking accounts payable."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New Bill
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No bills match your search"
            description="Try a different name or clear your filters."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilters({});
                }}
              >
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <div className="p-4 sm:p-6">
            <Table density={density}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                      pagination.pageItems.length > 0 &&
                      pagination.pageItems.every((b) => selected.includes(b.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((b) => prev.includes(b.id))
                          ? prev.filter((id) => !pagination.pageItems.some((b) => b.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((b) => b.id)])],
                      )
                    }
                      aria-label="Select all bills"
                    />
                  </TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  <TableHead>Amount</TableHead>
                  {columnVisibility.isVisible("status") ? <TableHead>Status</TableHead> : null}
                  {columnVisibility.isVisible("dueDate") ? <TableHead>Due Date</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((bill) => (
                  <TableRow key={bill.id} data-state={selected.includes(bill.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(bill.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(bill.id) ? prev.filter((id) => id !== bill.id) : [...prev, bill.id],
                          )
                        }
                        aria-label={`Select ${bill.billNumber}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell>
                      <Link
                        href={`/operations/vendors/${bill.vendorId}`}
                        className="hover:underline"
                      >
                        {vendorById.get(bill.vendorId)?.name ?? "—"}
                      </Link>
                    </TableCell>
                    {columnVisibility.isVisible("category") ? <TableCell>{bill.category}</TableCell> : null}
                    <TableCell>${bill.amount.toLocaleString()}</TableCell>
                    {columnVisibility.isVisible("status") ? (
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[bill.status]}`}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {columnVisibility.isVisible("dueDate") ? <TableCell>{bill.dueDate}</TableCell> : null}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${bill.billNumber}`} />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingBill(bill)}>Edit</DropdownMenuItem>
                          {bill.status !== "Paid" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                markBillPaid(bill.id, new Date().toISOString().slice(0, 10));
                                toast.success(`${bill.billNumber} marked as paid.`);
                              }}
                            >
                              Mark as Paid
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => {
                              const copy = duplicateBill(bill.id);
                              if (copy) toast.success(`${copy.billNumber} created.`);
                            }}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              archiveBills([bill.id]);
                              toast.success(`${bill.billNumber} archived.`);
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteBill(bill.id);
                              toast.success(`${bill.billNumber} permanently deleted.`);
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        itemLabel="bills"
      />

      {editingBill ? (
        <BillEditSheet bill={editingBill} open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)} />
      ) : null}
      <BillEditSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
