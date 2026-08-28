"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarX2, Copy, MoreHorizontal, Pencil } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { MeetingEditSheet } from "@/components/sales/meeting-edit-sheet";
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
import { getCompanyById } from "@/lib/mock-data/companies";
import { getContactById, useContacts } from "@/lib/mock-data/contacts";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveMeetings,
  deleteMeeting,
  duplicateMeeting,
  setMeetingStatus,
  MEETING_STATUSES,
  useMeetings,
  type Meeting,
  type MeetingStatus,
} from "@/lib/mock-data/meetings";

const STATUS_TONE: Record<MeetingStatus, string> = {
  Scheduled: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cancelled: "bg-muted text-foreground/70",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(
  rows: { meeting: Meeting; contactName: string; companyName: string; ownerName: string }[],
) {
  const header = ["Title", "Date & Time", "Contact", "Company", "Owner", "Status"];
  const lines = rows.map((r) =>
    [r.meeting.title, r.meeting.dateTimeLabel, r.contactName, r.companyName, r.ownerName, r.meeting.status]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "meetings.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Meetings — Sales sidebar group (05 Department Operating Systems/Sales/
 * sales-operating-system.md). `Meeting.contactId` resolves to a Contact,
 * and the company is resolved by hopping through that contact's
 * `companyId` rather than being duplicated on the meeting itself.
 * `Meeting.ownerId` resolves against the real Employees store — the same
 * pattern as `Lead.ownerId`.
 */
export default function MeetingsPage() {
  const allMeetings = useMeetings();
  const contacts = useContacts();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editingMeeting, setEditingMeeting] = React.useState<Meeting | null>(null);
  const [sort, setSort] = React.useState<"title-asc" | "title-desc">("title-asc");
  const [loading, setLoading] = React.useState(false);
  const columnVisibility = useColumnVisibility([
    { id: "dateTime", label: "Date & Time" },
    { id: "contact", label: "Contact" },
    { id: "company", label: "Company" },
    { id: "owner", label: "Owner" },
  ]);

  const meetings = React.useMemo(() => allMeetings.filter((m) => !m.archived), [allMeetings]);

  const contactById = React.useMemo(() => {
    const map = new Map<string, (typeof contacts)[number]>();
    for (const contact of contacts) map.set(contact.id, contact);
    return map;
  }, [contacts]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const rows = React.useMemo(
    () =>
      meetings.map((meeting) => {
        const contact = contactById.get(meeting.contactId) ?? getContactById(meeting.contactId);
        const company = contact ? getCompanyById(contact.companyId) : undefined;
        const owner = employeeById.get(meeting.ownerId);
        return { meeting, contact, company, owner };
      }),
    [meetings, contactById, employeeById],
  );

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        options: MEETING_STATUSES.map((s) => ({ value: s, label: s })),
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.meeting.title.toLowerCase().includes(q) ||
          r.contact?.name.toLowerCase().includes(q) ||
          r.company?.name.toLowerCase().includes(q),
      );
    }
    if (filters.status) list = list.filter((r) => r.meeting.status === filters.status);
    list = [...list].sort((a, b) =>
      sort === "title-asc"
        ? a.meeting.title.localeCompare(b.meeting.title)
        : b.meeting.title.localeCompare(a.meeting.title),
    );
    return list;
  }, [rows, search, filters, sort]);

  const pagination = usePagination(filtered);

  function changeStatus(id: string, title: string, status: MeetingStatus) {
    setMeetingStatus(id, status);
    toast.success(`"${title}" marked as ${status}.`);
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
    if (snapshot.sort === "title-asc" || snapshot.sort === "title-desc") setSort(snapshot.sort);
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
        <h1 className="text-lg font-semibold">Meetings</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {meetings.length} meetings
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search meetings…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        sortOptions={[
          { label: "Title (A–Z)", onSelect: () => setSort("title-asc") },
          { label: "Title (Z–A)", onSelect: () => setSort("title-desc") },
        ]}
        onExport={() => {
          exportToCsv(
            filtered.map((r) => ({
              meeting: r.meeting,
              contactName: r.contact?.name ?? "—",
              companyName: r.company?.name ?? "—",
              ownerName: r.owner?.name ?? "—",
            })),
          );
          toast.success("Meetings exported.");
        }}
        savedViewsControl={
          <SavedViewsMenu
            pageKey="sales-meetings"
            snapshot={{ search, filters, sort, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onRefresh={handleRefresh}
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveMeetings(selected);
              toast.success(`${selected.length} meeting${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteMeeting(id));
              toast.success(`${selected.length} meeting${selected.length === 1 ? "" : "s"} deleted.`);
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
            icon={CalendarX2}
            title="No meetings match your search"
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
                        pagination.pageItems.every((r) => selected.includes(r.meeting.id))
                      }
                      onCheckedChange={() =>
                        setSelected((prev) =>
                          pagination.pageItems.every((r) => prev.includes(r.meeting.id))
                            ? prev.filter((id) => !pagination.pageItems.some((r) => r.meeting.id === id))
                            : [...new Set([...prev, ...pagination.pageItems.map((r) => r.meeting.id)])],
                        )
                      }
                      aria-label="Select all meetings on this page"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  {columnVisibility.isVisible("dateTime") ? <TableHead>Date &amp; Time</TableHead> : null}
                  {columnVisibility.isVisible("contact") ? <TableHead>Contact</TableHead> : null}
                  {columnVisibility.isVisible("company") ? <TableHead>Company</TableHead> : null}
                  {columnVisibility.isVisible("owner") ? <TableHead>Owner</TableHead> : null}
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map(({ meeting, contact, company, owner }) => (
                  <TableRow
                    key={meeting.id}
                    data-state={selected.includes(meeting.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(meeting.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(meeting.id)
                              ? prev.filter((id) => id !== meeting.id)
                              : [...prev, meeting.id],
                          )
                        }
                        aria-label={`Select ${meeting.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/sales/meetings/${meeting.id}`} className="hover:underline">
                        {meeting.title}
                      </Link>
                    </TableCell>
                    {columnVisibility.isVisible("dateTime") ? <TableCell>{meeting.dateTimeLabel}</TableCell> : null}
                    {columnVisibility.isVisible("contact") ? <TableCell>{contact?.name ?? "—"}</TableCell> : null}
                    {columnVisibility.isVisible("company") ? <TableCell>{company?.name ?? "—"}</TableCell> : null}
                    {columnVisibility.isVisible("owner") ? <TableCell>{owner?.name ?? "—"}</TableCell> : null}
                    <TableCell>
                      <Badge className={`border-0 font-medium ${STATUS_TONE[meeting.status]}`}>
                        {meeting.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${meeting.title}`}
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingMeeting(meeting)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const copy = duplicateMeeting(meeting.id);
                              if (copy) toast.success(`"${copy.title}" duplicated.`);
                            }}
                          >
                            <Copy className="size-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {MEETING_STATUSES.filter((s) => s !== meeting.status).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => changeStatus(meeting.id, meeting.title, s)}
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
        itemLabel="meetings"
      />
      {editingMeeting ? (
        <MeetingEditSheet
          meeting={editingMeeting}
          open={!!editingMeeting}
          onOpenChange={(open) => !open && setEditingMeeting(null)}
        />
      ) : null}
    </div>
  );
}
