"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertOctagon, Inbox, MoreHorizontal, Trash2 } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  addOperationsRequest,
  archiveOperationsRequests,
  assignRequest,
  deleteOperationsRequest,
  escalateRequest,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  setRequestStatus,
  useOperationsRequests,
  type RequestPriority,
  type RequestStatus,
  type RequestType,
} from "@/lib/mock-data/operations-requests";

const STATUS_TONE: Record<RequestStatus, string> = {
  Open: "bg-muted text-foreground/70",
  "In Progress": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Escalated: "bg-destructive/10 text-destructive",
  Resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

const PRIORITY_TONE: Record<RequestPriority, string> = {
  Low: "bg-muted text-foreground/70",
  Medium: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  High: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Urgent: "bg-destructive/10 text-destructive",
};

/** Requests — Operations sidebar. General internal request queue, distinct from Procurement (purchasing-specific). */
export default function RequestsPage() {
  const allRequests = useOperationsRequests();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    title: "",
    type: "Equipment" as RequestType,
    description: "",
    requestedById: "",
    priority: "Medium" as RequestPriority,
  });
  const [assigningRequest, setAssigningRequest] = React.useState<string | null>(null);
  const [assigneeId, setAssigneeId] = React.useState("");
  const columnVisibility = useColumnVisibility([
    { id: "type", label: "Type" },
    { id: "requestedBy", label: "Requested By" },
    { id: "assignedTo", label: "Assigned To" },
    { id: "priority", label: "Priority" },
  ]);

  const requests = React.useMemo(() => allRequests.filter((r) => !r.archived), [allRequests]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "type", label: "Type", options: REQUEST_TYPES.map((t) => ({ value: t, label: t })) },
      { id: "status", label: "Status", options: REQUEST_STATUSES.map((s) => ({ value: s, label: s })) },
      { id: "priority", label: "Priority", options: REQUEST_PRIORITIES.map((p) => ({ value: p, label: p })) },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = requests;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(q));
    }
    if (filters.type) rows = rows.filter((r) => r.type === filters.type);
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);
    if (filters.priority) rows = rows.filter((r) => r.priority === filters.priority);
    return [...rows].sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }, [requests, search, filters]);

  const pagination = usePagination(filtered);

  function handleCreate() {
    if (!createForm.title.trim() || !createForm.requestedById) {
      toast.error("Enter a title and requester.");
      return;
    }
    addOperationsRequest({
      title: createForm.title.trim(),
      type: createForm.type,
      description: createForm.description.trim(),
      requestedById: createForm.requestedById,
      priority: createForm.priority,
    });
    toast.success("Request submitted.");
    setCreateOpen(false);
    setCreateForm({ title: "", type: "Equipment", description: "", requestedById: "", priority: "Medium" });
  }

  function handleAssign() {
    if (!assigningRequest || !assigneeId) return;
    assignRequest(assigningRequest, assigneeId);
    toast.success(`Assigned to ${employeeById.get(assigneeId)?.name}.`);
    setAssigningRequest(null);
    setAssigneeId("");
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
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
        <h1 className="text-lg font-semibold">Requests</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {requests.length} requests
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search requests…"
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
            pageKey="operations-requests"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setCreateOpen(true)}
        createLabel="New Request"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveOperationsRequests(selected);
              toast.success(`${selected.length} request${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteOperationsRequest(id));
              toast.success(`${selected.length} request${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No requests yet"
            description="Submit a request for equipment, access, facilities, or IT support."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New Request
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No requests match your search"
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
                      pagination.pageItems.every((r) => selected.includes(r.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((r) => prev.includes(r.id))
                          ? prev.filter((id) => !pagination.pageItems.some((r) => r.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((r) => r.id)])],
                      )
                    }
                      aria-label="Select all requests"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  {columnVisibility.isVisible("type") ? <TableHead>Type</TableHead> : null}
                  {columnVisibility.isVisible("requestedBy") ? <TableHead>Requested By</TableHead> : null}
                  {columnVisibility.isVisible("assignedTo") ? <TableHead>Assigned To</TableHead> : null}
                  {columnVisibility.isVisible("priority") ? <TableHead>Priority</TableHead> : null}
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((request) => (
                  <TableRow
                    key={request.id}
                    data-state={selected.includes(request.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(request.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(request.id)
                              ? prev.filter((id) => id !== request.id)
                              : [...prev, request.id],
                          )
                        }
                        aria-label={`Select ${request.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    {columnVisibility.isVisible("type") ? <TableCell>{request.type}</TableCell> : null}
                    {columnVisibility.isVisible("requestedBy") ? (
                      <TableCell>{employeeById.get(request.requestedById)?.name ?? "—"}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("assignedTo") ? (
                      <TableCell>
                        {request.assignedToId ? employeeById.get(request.assignedToId)?.name ?? "—" : "Unassigned"}
                      </TableCell>
                    ) : null}
                    {columnVisibility.isVisible("priority") ? (
                      <TableCell>
                        <Badge className={`border-0 font-medium ${PRIORITY_TONE[request.priority]}`}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <Badge className={`border-0 font-medium ${STATUS_TONE[request.status]}`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${request.title}`} />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setAssigningRequest(request.id);
                              setAssigneeId(request.assignedToId ?? "");
                            }}
                          >
                            Assign Task
                          </DropdownMenuItem>
                          {request.status !== "Resolved" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setRequestStatus(request.id, "Resolved");
                                toast.success("Request approved and marked resolved.");
                              }}
                            >
                              Approve Request
                            </DropdownMenuItem>
                          ) : null}
                          {request.status !== "Escalated" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                escalateRequest(request.id);
                                toast.success("Request escalated.");
                              }}
                            >
                              <AlertOctagon className="size-4" />
                              Escalate Issue
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => {
                              archiveOperationsRequests([request.id]);
                              toast.success("Request archived.");
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteOperationsRequest(request.id);
                              toast.success("Request permanently deleted.");
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
        itemLabel="requests"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New request</DialogTitle>
            <DialogDescription>Submit an internal operations request.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="request-title" label="Title">
              <Input
                id="request-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>
            <Field id="request-type" label="Type">
              <Select
                value={createForm.type}
                onValueChange={(value) => value && setCreateForm((f) => ({ ...f, type: value as RequestType }))}
              >
                <SelectTrigger id="request-type" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="request-description" label="Description">
              <Textarea
                id="request-description"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </Field>
            <Field id="request-requester" label="Requested by">
              <Select
                value={createForm.requestedById}
                onValueChange={(value) => value && setCreateForm((f) => ({ ...f, requestedById: value }))}
              >
                <SelectTrigger id="request-requester" className="w-full">
                  <SelectValue>
                    {(value: string) => employeeById.get(value)?.name ?? "Select an employee…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => !e.archived)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="request-priority" label="Priority">
              <Select
                value={createForm.priority}
                onValueChange={(value) =>
                  value && setCreateForm((f) => ({ ...f, priority: value as RequestPriority }))
                }
              >
                <SelectTrigger id="request-priority" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Submit request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assigningRequest} onOpenChange={(open) => !open && setAssigningRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign task</DialogTitle>
            <DialogDescription>Choose who should handle this request.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="assign-employee" label="Assignee">
              <Select value={assigneeId} onValueChange={(value) => value && setAssigneeId(value)}>
                <SelectTrigger id="assign-employee" className="w-full">
                  <SelectValue>
                    {(value: string) => employeeById.get(value)?.name ?? "Select an employee…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employees
                    .filter((e) => !e.archived)
                    .map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
