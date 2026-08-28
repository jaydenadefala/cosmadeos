"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal, ShoppingCart, Trash2 } from "lucide-react";

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
import { useEmployees } from "@/lib/mock-data/employees";
import {
  addProcurementRequest,
  archiveProcurementRequests,
  deleteProcurementRequest,
  PROCUREMENT_STATUSES,
  setProcurementStatus,
  submitProcurementRequest,
  useProcurementRequests,
  type ProcurementStatus,
} from "@/lib/mock-data/procurement";
import { useVendors } from "@/lib/mock-data/vendors";

const STATUS_TONE: Record<ProcurementStatus, string> = {
  Draft: "bg-muted text-foreground/70",
  Submitted: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Rejected: "bg-destructive/10 text-destructive",
  Ordered: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Received: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

/** Procurement — Operations sidebar. Real Vendor + Employee cross-references, full request lifecycle. */
export default function ProcurementPage() {
  const allRequests = useProcurementRequests();
  const vendors = useVendors();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    itemDescription: "",
    vendorId: "",
    quantity: "1",
    estimatedCost: "",
    requestedById: "",
  });
  const columnVisibility = useColumnVisibility([
    { id: "vendor", label: "Vendor" },
    { id: "qty", label: "Qty" },
    { id: "cost", label: "Est. Cost" },
    { id: "requestedBy", label: "Requested By" },
  ]);

  const requests = React.useMemo(() => allRequests.filter((r) => !r.archived), [allRequests]);

  const vendorById = React.useMemo(() => {
    const map = new Map<string, (typeof vendors)[number]>();
    for (const vendor of vendors) map.set(vendor.id, vendor);
    return map;
  }, [vendors]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [{ id: "status", label: "Status", options: PROCUREMENT_STATUSES.map((s) => ({ value: s, label: s })) }],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = requests;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((r) => r.itemDescription.toLowerCase().includes(q));
    }
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);
    return [...rows].sort((a, b) => b.requestedDate.localeCompare(a.requestedDate));
  }, [requests, search, filters]);

  const pagination = usePagination(filtered);

  function handleCreate() {
    if (!createForm.itemDescription.trim() || !createForm.requestedById) {
      toast.error("Enter an item description and requester.");
      return;
    }
    addProcurementRequest({
      itemDescription: createForm.itemDescription.trim(),
      vendorId: createForm.vendorId || undefined,
      quantity: Number(createForm.quantity) || 1,
      estimatedCost: Number(createForm.estimatedCost) || 0,
      requestedById: createForm.requestedById,
      requestedDate: new Date().toISOString().slice(0, 10),
    });
    toast.success("Procurement request created as a draft.");
    setCreateOpen(false);
    setCreateForm({ itemDescription: "", vendorId: "", quantity: "1", estimatedCost: "", requestedById: "" });
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
        <h1 className="text-lg font-semibold">Procurement</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {requests.length} requests
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by item…"
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
            pageKey="operations-procurement"
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
              archiveProcurementRequests(selected);
              toast.success(`${selected.length} request${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteProcurementRequest(id));
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
            icon={ShoppingCart}
            title="No procurement requests yet"
            description="Submit a request to start tracking purchases."
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
                  <TableHead>Item</TableHead>
                  {columnVisibility.isVisible("vendor") ? <TableHead>Vendor</TableHead> : null}
                  {columnVisibility.isVisible("qty") ? <TableHead>Qty</TableHead> : null}
                  {columnVisibility.isVisible("cost") ? <TableHead>Est. Cost</TableHead> : null}
                  {columnVisibility.isVisible("requestedBy") ? <TableHead>Requested By</TableHead> : null}
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
                        aria-label={`Select ${request.itemDescription}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{request.itemDescription}</TableCell>
                    {columnVisibility.isVisible("vendor") ? (
                      <TableCell>{request.vendorId ? vendorById.get(request.vendorId)?.name ?? "—" : "—"}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("qty") ? <TableCell>{request.quantity}</TableCell> : null}
                    {columnVisibility.isVisible("cost") ? (
                      <TableCell>${request.estimatedCost.toLocaleString()}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("requestedBy") ? (
                      <TableCell>{employeeById.get(request.requestedById)?.name ?? "—"}</TableCell>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${request.itemDescription}`}
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {request.status === "Draft" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                submitProcurementRequest(request.id);
                                toast.success("Request submitted.");
                              }}
                            >
                              Submit
                            </DropdownMenuItem>
                          ) : null}
                          {request.status === "Submitted" ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setProcurementStatus(request.id, "Approved");
                                  toast.success("Request approved.");
                                }}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setProcurementStatus(request.id, "Rejected");
                                  toast.success("Request rejected.");
                                }}
                              >
                                Reject
                              </DropdownMenuItem>
                            </>
                          ) : null}
                          {request.status === "Approved" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setProcurementStatus(request.id, "Ordered");
                                toast.success("Marked as ordered.");
                              }}
                            >
                              Mark Ordered
                            </DropdownMenuItem>
                          ) : null}
                          {request.status === "Ordered" ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setProcurementStatus(request.id, "Received");
                                toast.success("Marked as received.");
                              }}
                            >
                              Mark Received
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => {
                              archiveProcurementRequests([request.id]);
                              toast.success("Request archived.");
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteProcurementRequest(request.id);
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
            <DialogTitle>New procurement request</DialogTitle>
            <DialogDescription>Request an item to be purchased.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="procurement-item" label="Item description">
              <Input
                id="procurement-item"
                value={createForm.itemDescription}
                onChange={(e) => setCreateForm((f) => ({ ...f, itemDescription: e.target.value }))}
              />
            </Field>
            <Field id="procurement-vendor" label="Vendor (optional)">
              <Select
                value={createForm.vendorId}
                onValueChange={(value) => value && setCreateForm((f) => ({ ...f, vendorId: value }))}
              >
                <SelectTrigger id="procurement-vendor" className="w-full">
                  <SelectValue>
                    {(value: string) => vendorById.get(value)?.name ?? "Select a vendor…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vendors
                    .filter((v) => !v.archived)
                    .map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="procurement-quantity" label="Quantity">
                <Input
                  id="procurement-quantity"
                  type="number"
                  min={1}
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </Field>
              <Field id="procurement-cost" label="Estimated cost (₦)">
                <Input
                  id="procurement-cost"
                  type="number"
                  min={0}
                  value={createForm.estimatedCost}
                  onChange={(e) => setCreateForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                />
              </Field>
            </div>
            <Field id="procurement-requester" label="Requested by">
              <Select
                value={createForm.requestedById}
                onValueChange={(value) => value && setCreateForm((f) => ({ ...f, requestedById: value }))}
              >
                <SelectTrigger id="procurement-requester" className="w-full">
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
            <Button onClick={handleCreate}>Create request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
