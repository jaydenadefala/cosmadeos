"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Combine, Copy, MoreHorizontal, Pencil, SearchX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CompanyEditSheet } from "@/components/sales/company-edit-sheet";
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
import {
  addCompany,
  archiveCompanies,
  deleteCompanies,
  duplicateCompany,
  setCompanyStatus,
  useCompanies,
  type Company,
  type CompanyStatus,
} from "@/lib/mock-data/companies";
import { reassignContactsCompany } from "@/lib/mock-data/contacts";
import { reassignLeadsCompany, useLeads } from "@/lib/mock-data/leads";

const STATUS_TONE: Record<CompanyStatus, string> = {
  Customer: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Prospect: "bg-muted text-foreground/70",
  Lost: "bg-destructive/10 text-destructive",
};

const STATUS_OPTIONS: CompanyStatus[] = ["Customer", "Prospect", "Lost"];

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Company[]) {
  const header = ["Name", "Industry", "Location", "Website", "Phone", "Status"];
  const lines = rows.map((r) =>
    [r.name, r.industry, r.location, r.website, r.phone, r.status].map((v) => `"${v}"`).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "companies.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Companies — Sales sidebar group (05 Department Operating Systems/Sales/
 * sales-operating-system.md). Open Deals is derived live from the leads
 * store (never stored redundantly), same pattern as Job Listings'
 * applicant counts. Clicking a row opens the real Company detail page
 * (Universal Object Layout); Merge is available when exactly two companies
 * are selected, reassigning the loser's Contacts/Leads onto the survivor.
 */
export default function CompaniesPage() {
  const allCompanies = useCompanies();
  const leads = useLeads();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);
  const [sort, setSort] = React.useState<"name-asc" | "name-desc">("name-asc");
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const columnVisibility = useColumnVisibility([
    { id: "industry", label: "Industry" },
    { id: "location", label: "Location" },
    { id: "status", label: "Status" },
    { id: "openDeals", label: "Open Deals" },
  ]);

  const companies = React.useMemo(() => allCompanies.filter((c) => !c.archived), [allCompanies]);

  const openDealsByCompany = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const lead of leads) {
      if (lead.stage === "won" || lead.stage === "lost") continue;
      counts.set(lead.companyId, (counts.get(lead.companyId) ?? 0) + 1);
    }
    return counts;
  }, [leads]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "industry",
        label: "Industry",
        options: Array.from(new Set(companies.map((c) => c.industry))).map((i) => ({
          value: i,
          label: i,
        })),
      },
      {
        id: "status",
        label: "Status",
        options: STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
      },
    ],
    [companies],
  );

  const filtered = React.useMemo(() => {
    let rows = companies;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (filters.industry) rows = rows.filter((c) => c.industry === filters.industry);
    if (filters.status) rows = rows.filter((c) => c.status === filters.status);
    rows = [...rows].sort((a, b) =>
      sort === "name-asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
    return rows;
  }, [companies, search, filters, sort]);

  const pagination = usePagination(filtered);

  function changeStatus(id: string, name: string, status: CompanyStatus) {
    setCompanyStatus(id, status);
    toast.success(`${name} marked as ${status}.`);
  }

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.sort === "name-asc" || snapshot.sort === "name-desc") setSort(snapshot.sort);
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
        const [name, industry, location] = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        if (!name || name.toLowerCase() === "name") continue;
        addCompany({ name, industry: industry ?? "", location: location ?? "" });
        created += 1;
      }
      if (created === 0) {
        toast.error("No valid rows found. Expected columns: name, industry, location.");
      } else {
        toast.success(`Imported ${created} compan${created === 1 ? "y" : "ies"}.`);
      }
    });
  }

  function mergeSelected() {
    if (selected.length !== 2) return;
    const [survivorId, loserId] = selected;
    const loser = companies.find((c) => c.id === loserId);
    reassignContactsCompany(loserId, survivorId);
    reassignLeadsCompany(loserId, survivorId);
    deleteCompanies([loserId]);
    toast.success(`Merged ${loser?.name ?? "duplicate"} into the other record.`);
    setSelected([]);
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
        <h1 className="text-lg font-semibold">Companies</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {companies.length} companies
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search companies…"
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
            pageKey="sales-companies"
            snapshot={{ search, filters, sort, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        sortOptions={[
          { label: "Name (A–Z)", onSelect: () => setSort("name-asc") },
          { label: "Name (Z–A)", onSelect: () => setSort("name-desc") },
        ]}
        onImport={handleImportClick}
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Companies exported.");
        }}
        onRefresh={handleRefresh}
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          ...(selected.length === 2
            ? [{ label: "Merge", icon: Combine, onClick: mergeSelected }]
            : []),
          {
            label: "Archive",
            onClick: () => {
              archiveCompanies(selected);
              toast.success(`${selected.length} compan${selected.length === 1 ? "y" : "ies"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              deleteCompanies(selected);
              toast.success(`${selected.length} compan${selected.length === 1 ? "y" : "ies"} deleted.`);
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
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No companies match your search"
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
                      pagination.pageItems.every((c) => selected.includes(c.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((c) => prev.includes(c.id))
                          ? prev.filter((id) => !pagination.pageItems.some((c) => c.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((c) => c.id)])],
                      )
                    }
                      aria-label="Select all companies"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {columnVisibility.isVisible("industry") ? <TableHead>Industry</TableHead> : null}
                  {columnVisibility.isVisible("location") ? <TableHead>Location</TableHead> : null}
                  {columnVisibility.isVisible("status") ? <TableHead>Status</TableHead> : null}
                  {columnVisibility.isVisible("openDeals") ? <TableHead>Open Deals</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((company) => (
                  <TableRow
                    key={company.id}
                    data-state={selected.includes(company.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(company.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(company.id)
                              ? prev.filter((id) => id !== company.id)
                              : [...prev, company.id],
                          )
                        }
                        aria-label={`Select ${company.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/sales/companies/${company.id}`}
                        className="hover:underline"
                      >
                        {company.name}
                      </Link>
                    </TableCell>
                    {columnVisibility.isVisible("industry") ? <TableCell>{company.industry}</TableCell> : null}
                    {columnVisibility.isVisible("location") ? <TableCell>{company.location}</TableCell> : null}
                    {columnVisibility.isVisible("status") ? (
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[company.status]}`}>
                          {company.status}
                        </Badge>
                      </TableCell>
                    ) : null}
                    {columnVisibility.isVisible("openDeals") ? (
                      <TableCell>{openDealsByCompany.get(company.id) ?? 0}</TableCell>
                    ) : null}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${company.name}`}
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCompany(company)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const copy = duplicateCompany(company.id);
                              if (copy) toast.success(`${copy.name} created.`);
                            }}
                          >
                            <Copy className="size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {STATUS_OPTIONS.filter((s) => s !== company.status).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => changeStatus(company.id, company.name, s)}
                            >
                              Mark as {s}
                            </DropdownMenuItem>
                          ))}
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
        itemLabel="companies"
      />
      {editingCompany ? (
        <CompanyEditSheet
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
        />
      ) : null}
    </div>
  );
}
