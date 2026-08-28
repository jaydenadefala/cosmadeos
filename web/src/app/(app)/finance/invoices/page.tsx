"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { InvoiceEditSheet } from "@/components/finance/invoice-edit-sheet";
import { useCompanies } from "@/lib/mock-data/companies";
import {
  archiveInvoices,
  deleteInvoice,
  duplicateInvoice,
  generateInvoice,
  invoiceTotal,
  recordPayment,
  sendInvoice,
  useInvoices,
  voidInvoice,
  INVOICE_STATUSES,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/mock-data/invoices";

const STATUS_TONE: Record<InvoiceStatus, string> = {
  Draft: "bg-muted text-foreground/70",
  Sent: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Overdue: "bg-destructive/10 text-destructive",
  Void: "bg-muted text-muted-foreground line-through",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Invoice[], companyName: (id: string) => string) {
  const header = ["Invoice #", "Company", "Total", "Status", "Issue Date", "Due Date"];
  const lines = rows.map((r) =>
    [r.invoiceNumber, companyName(r.companyId), String(invoiceTotal(r)), r.status, r.issueDate, r.dueDate]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invoices.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Invoices — Finance sidebar (05 Department Operating Systems/Finance/
 * finance-operating-system.md: "Universal Object Layout applies to the
 * Invoice object"). `companyId` resolves against the real Companies store
 * from the Sales workspace — no dedicated Customers workspace exists yet,
 * and this is the honest, connected choice rather than a redundant
 * Finance-local company list.
 */
export default function InvoicesPage() {
  const router = useRouter();
  const allInvoices = useInvoices();
  const companies = useCompanies();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">(
    "date-desc",
  );
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const columnVisibility = useColumnVisibility([
    { id: "company", label: "Company" },
    { id: "total", label: "Total" },
    { id: "status", label: "Status" },
    { id: "issueDate", label: "Issue Date" },
    { id: "dueDate", label: "Due Date" },
  ]);

  const invoices = React.useMemo(() => allInvoices.filter((i) => !i.archived), [allInvoices]);

  const companyById = React.useMemo(() => {
    const map = new Map<string, (typeof companies)[number]>();
    for (const company of companies) map.set(company.id, company);
    return map;
  }, [companies]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "status", label: "Status", options: INVOICE_STATUSES.map((s) => ({ value: s, label: s })) },
      {
        id: "companyId",
        label: "Company",
        options: companies.map((c) => ({ value: c.id, label: c.name })),
      },
    ],
    [companies],
  );

  const filtered = React.useMemo(() => {
    let rows = invoices;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          (companyById.get(i.companyId)?.name.toLowerCase().includes(q) ?? false),
      );
    }
    if (filters.status) rows = rows.filter((i) => i.status === filters.status);
    if (filters.companyId) rows = rows.filter((i) => i.companyId === filters.companyId);
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.issueDate.localeCompare(b.issueDate);
        case "date-desc":
          return b.issueDate.localeCompare(a.issueDate);
        case "amount-asc":
          return invoiceTotal(a) - invoiceTotal(b);
        case "amount-desc":
          return invoiceTotal(b) - invoiceTotal(a);
      }
    });
    return rows;
  }, [invoices, search, filters, companyById, sort]);

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

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    file.text().then((text) => {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      let created = 0;
      for (const line of lines) {
        const [companyName, description, amount, issueDate, dueDate] = line
          .split(",")
          .map((v) => v.trim().replace(/^"|"$/g, ""));
        if (!companyName || companyName.toLowerCase() === "company") continue;
        const company = companies.find((c) => c.name.toLowerCase() === companyName.toLowerCase());
        if (!company) continue;
        generateInvoice({
          companyId: company.id,
          lineItems: [{ description: description || "Imported line item", amount: Number(amount) || 0 }],
          issueDate: issueDate || new Date().toISOString().slice(0, 10),
          dueDate: dueDate || new Date().toISOString().slice(0, 10),
        });
        created += 1;
      }
      if (created === 0) {
        toast.error(
          "No valid rows found. Expected columns: company (matching an existing company name), description, amount, issue date, due date.",
        );
      } else {
        toast.success(`Imported ${created} invoice${created === 1 ? "" : "s"} as drafts.`);
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileSelected}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Invoices</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {invoices.length} invoices
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoices…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        savedViewsControl={
          <SavedViewsMenu
            pageKey="finance-invoices"
            snapshot={{ search, filters, sort, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        sortOptions={[
          { label: "Issue Date (Newest)", onSelect: () => setSort("date-desc") },
          { label: "Issue Date (Oldest)", onSelect: () => setSort("date-asc") },
          { label: "Amount (High–Low)", onSelect: () => setSort("amount-desc") },
          { label: "Amount (Low–High)", onSelect: () => setSort("amount-asc") },
        ]}
        onImport={handleImportClick}
        onExport={() => {
          exportToCsv(filtered, (id) => companyById.get(id)?.name ?? "—");
          toast.success("Invoices exported.");
        }}
        onRefresh={handleRefresh}
        onCreate={() => setCreateOpen(true)}
        createLabel="Generate Invoice"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveInvoices(selected);
              toast.success(`${selected.length} invoice${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteInvoice(id));
              toast.success(`${selected.length} invoice${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-4 sm:p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Generate your first invoice to start billing customers."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Generate Invoice
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No invoices match your search"
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
                      pagination.pageItems.every((i) => selected.includes(i.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((i) => prev.includes(i.id))
                          ? prev.filter((id) => !pagination.pageItems.some((i) => i.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((i) => i.id)])],
                      )
                    }
                      aria-label="Select all invoices"
                    />
                  </TableHead>
                  <TableHead>Invoice #</TableHead>
                  {columnVisibility.isVisible("company") ? <TableHead>Company</TableHead> : null}
                  {columnVisibility.isVisible("total") ? <TableHead>Total</TableHead> : null}
                  {columnVisibility.isVisible("status") ? <TableHead>Status</TableHead> : null}
                  {columnVisibility.isVisible("issueDate") ? <TableHead>Issue Date</TableHead> : null}
                  {columnVisibility.isVisible("dueDate") ? <TableHead>Due Date</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    data-state={selected.includes(invoice.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(invoice.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(invoice.id)
                              ? prev.filter((id) => id !== invoice.id)
                              : [...prev, invoice.id],
                          )
                        }
                        aria-label={`Select ${invoice.invoiceNumber}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/finance/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    {columnVisibility.isVisible("company") ? (
                      <TableCell>{companyById.get(invoice.companyId)?.name ?? "—"}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("total") ? (
                      <TableCell>${invoiceTotal(invoice).toLocaleString()}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("status") ? (
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {columnVisibility.isVisible("issueDate") ? <TableCell>{invoice.issueDate}</TableCell> : null}
                    {columnVisibility.isVisible("dueDate") ? <TableCell>{invoice.dueDate}</TableCell> : null}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${invoice.invoiceNumber}`}
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/finance/invoices/${invoice.id}`)}>
                            <Pencil className="size-4" />
                            Open
                          </DropdownMenuItem>
                          {invoice.status === "Draft" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                sendInvoice(invoice.id);
                                toast.success(`${invoice.invoiceNumber} sent.`);
                              }}
                            >
                              Send
                            </DropdownMenuItem>
                          ) : null}
                          {invoice.status === "Sent" || invoice.status === "Overdue" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                recordPayment(invoice.id, new Date().toISOString().slice(0, 10));
                                toast.success(`Payment recorded for ${invoice.invoiceNumber}.`);
                              }}
                            >
                              Record Payment
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => {
                              const copy = duplicateInvoice(invoice.id);
                              if (copy) toast.success(`${copy.invoiceNumber} created.`);
                            }}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          {invoice.status !== "Void" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                voidInvoice(invoice.id);
                                toast.success(`${invoice.invoiceNumber} voided.`);
                              }}
                            >
                              Void
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => {
                              archiveInvoices([invoice.id]);
                              toast.success(`${invoice.invoiceNumber} archived.`);
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteInvoice(invoice.id);
                              toast.success(`${invoice.invoiceNumber} permanently deleted.`);
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
        itemLabel="invoices"
      />

      <InvoiceEditSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(invoice) => router.push(`/finance/invoices/${invoice.id}`)}
      />
    </div>
  );
}
