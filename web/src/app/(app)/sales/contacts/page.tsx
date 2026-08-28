"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Combine, Copy, MoreHorizontal, Pencil, SearchX } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ContactEditSheet } from "@/components/sales/contact-edit-sheet";
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
import { useCompanies } from "@/lib/mock-data/companies";
import {
  archiveContacts,
  deleteContact,
  duplicateContact,
  findOrCreateContact,
  useContacts,
  type Contact,
} from "@/lib/mock-data/contacts";
import { reassignMeetingsContact } from "@/lib/mock-data/meetings";

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Contact[], companyName: (id: string) => string) {
  const header = ["Name", "Title", "Company", "Email", "Phone"];
  const lines = rows.map((r) =>
    [r.name, r.title, companyName(r.companyId), r.email, r.phone].map((v) => `"${v}"`).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Contacts — Sales sidebar group (05 Department Operating Systems/Sales/
 * sales-operating-system.md). `Contact.companyId` is resolved against the
 * real Companies store (same referential pattern as Leads→Companies) — a
 * company can have more than one contact, unlike a Lead's single
 * `contactName`. Merge is available when exactly two contacts are
 * selected, reassigning the loser's Meetings onto the survivor.
 */
export default function ContactsPage() {
  const allContacts = useContacts();
  const companies = useCompanies();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);
  const [sort, setSort] = React.useState<"name-asc" | "name-desc">("name-asc");
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const columnVisibility = useColumnVisibility([
    { id: "title", label: "Title" },
    { id: "company", label: "Company" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
  ]);

  const contacts = React.useMemo(() => allContacts.filter((c) => !c.archived), [allContacts]);

  const companyById = React.useMemo(() => {
    const map = new Map<string, (typeof companies)[number]>();
    for (const company of companies) map.set(company.id, company);
    return map;
  }, [companies]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "companyId",
        label: "Company",
        options: companies.map((c) => ({ value: c.id, label: c.name })),
      },
    ],
    [companies],
  );

  const filtered = React.useMemo(() => {
    let rows = contacts;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (companyById.get(c.companyId)?.name.toLowerCase().includes(q) ?? false),
      );
    }
    if (filters.companyId) rows = rows.filter((c) => c.companyId === filters.companyId);
    rows = [...rows].sort((a, b) =>
      sort === "name-asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
    return rows;
  }, [contacts, search, filters, companyById, sort]);

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
        const [name, email, companyName] = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        if (!name || name.toLowerCase() === "name") continue;
        const company = companies.find((c) => c.name.toLowerCase() === (companyName ?? "").toLowerCase());
        if (!company) continue;
        findOrCreateContact({ name, email: email ?? "", companyId: company.id });
        created += 1;
      }
      if (created === 0) {
        toast.error("No valid rows found. Expected columns: name, email, company (matching an existing company name).");
      } else {
        toast.success(`Imported ${created} contact${created === 1 ? "" : "s"}.`);
      }
    });
  }

  function mergeSelected() {
    if (selected.length !== 2) return;
    const [survivorId, loserId] = selected;
    const loser = contacts.find((c) => c.id === loserId);
    reassignMeetingsContact(loserId, survivorId);
    deleteContact(loserId);
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
        <h1 className="text-lg font-semibold">Contacts</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {contacts.length} contacts
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search contacts…"
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
            pageKey="sales-contacts"
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
          exportToCsv(filtered, (id) => companyById.get(id)?.name ?? "—");
          toast.success("Contacts exported.");
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
              archiveContacts(selected);
              toast.success(`${selected.length} contact${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteContact(id));
              toast.success(`${selected.length} contact${selected.length === 1 ? "" : "s"} deleted.`);
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
            title="No contacts match your search"
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
                      aria-label="Select all contacts"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {columnVisibility.isVisible("title") ? <TableHead>Title</TableHead> : null}
                  {columnVisibility.isVisible("company") ? <TableHead>Company</TableHead> : null}
                  {columnVisibility.isVisible("email") ? <TableHead>Email</TableHead> : null}
                  {columnVisibility.isVisible("phone") ? <TableHead>Phone</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((contact) => {
                  const company = companyById.get(contact.companyId);
                  return (
                    <TableRow
                      key={contact.id}
                      data-state={selected.includes(contact.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(contact.id)}
                          onCheckedChange={() =>
                            setSelected((prev) =>
                              prev.includes(contact.id)
                                ? prev.filter((id) => id !== contact.id)
                                : [...prev, contact.id],
                            )
                          }
                          aria-label={`Select ${contact.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/sales/contacts/${contact.id}`}
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs">
                              {contact.initials}
                            </AvatarFallback>
                          </Avatar>
                          {contact.name}
                        </Link>
                      </TableCell>
                      {columnVisibility.isVisible("title") ? <TableCell>{contact.title}</TableCell> : null}
                      {columnVisibility.isVisible("company") ? <TableCell>{company?.name ?? "—"}</TableCell> : null}
                      {columnVisibility.isVisible("email") ? (
                        <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                      ) : null}
                      {columnVisibility.isVisible("phone") ? (
                        <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                      ) : null}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${contact.name}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingContact(contact)}>
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const copy = duplicateContact(contact.id);
                                if (copy) toast.success(`${copy.name} created.`);
                              }}
                            >
                              <Copy className="size-4" />
                              Duplicate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        itemLabel="contacts"
      />
      {editingContact ? (
        <ContactEditSheet
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
        />
      ) : null}
    </div>
  );
}
