"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, MoreHorizontal, PackageSearch, Trash2 } from "lucide-react";

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
import {
  addInventoryItem,
  archiveInventoryItems,
  deleteInventoryItem,
  INVENTORY_CATEGORIES,
  receiveInventory,
  stockStatus,
  useInventoryItems,
  type InventoryCategory,
  type InventoryItem,
  type StockStatus,
} from "@/lib/mock-data/inventory";

const STATUS_TONE: Record<StockStatus, string> = {
  "In Stock": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Low Stock": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "Out of Stock": "bg-destructive/10 text-destructive",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: InventoryItem[]) {
  const header = ["Name", "SKU", "Category", "Quantity", "Status", "Location"];
  const lines = rows.map((r) =>
    [r.name, r.sku, r.category, String(r.quantity), stockStatus(r), r.location].map((v) => `"${v}"`).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Inventory — Operations sidebar. Real "Receive Inventory" action (CLAUDE.md's Operations action set). */
export default function InventoryPage() {
  const allItems = useInventoryItems();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    name: "",
    category: "Equipment Parts" as InventoryCategory,
    sku: "",
    quantity: "",
    reorderThreshold: "",
    location: "",
  });
  const [receivingItem, setReceivingItem] = React.useState<InventoryItem | null>(null);
  const [receiveQty, setReceiveQty] = React.useState("");
  const columnVisibility = useColumnVisibility([
    { id: "sku", label: "SKU" },
    { id: "category", label: "Category" },
    { id: "location", label: "Location" },
  ]);

  const items = React.useMemo(() => allItems.filter((i) => !i.archived), [allItems]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "category", label: "Category", options: INVENTORY_CATEGORIES.map((c) => ({ value: c, label: c })) },
      {
        id: "status",
        label: "Stock Status",
        options: [
          { value: "In Stock", label: "In Stock" },
          { value: "Low Stock", label: "Low Stock" },
          { value: "Out of Stock", label: "Out of Stock" },
        ],
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
    }
    if (filters.category) rows = rows.filter((i) => i.category === filters.category);
    if (filters.status) rows = rows.filter((i) => stockStatus(i) === filters.status);
    return rows;
  }, [items, search, filters]);

  const pagination = usePagination(filtered);

  const lowStockCount = items.filter((i) => stockStatus(i) !== "In Stock").length;

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
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

  function handleCreate() {
    if (!createForm.name.trim() || !createForm.sku.trim()) {
      toast.error("Enter a name and SKU.");
      return;
    }
    addInventoryItem({
      name: createForm.name.trim(),
      category: createForm.category,
      sku: createForm.sku.trim(),
      quantity: Number(createForm.quantity) || 0,
      reorderThreshold: Number(createForm.reorderThreshold) || 0,
      location: createForm.location.trim(),
    });
    toast.success(`${createForm.name} added to inventory.`);
    setCreateOpen(false);
    setCreateForm({ name: "", category: "Equipment Parts", sku: "", quantity: "", reorderThreshold: "", location: "" });
  }

  function handleReceive() {
    if (!receivingItem) return;
    const qty = Number(receiveQty);
    if (!qty || qty <= 0) {
      toast.error("Enter a quantity greater than zero.");
      return;
    }
    receiveInventory(receivingItem.id, qty);
    toast.success(`Received ${qty} × ${receivingItem.name}.`);
    setReceivingItem(null);
    setReceiveQty("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Inventory</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {items.length} items
          {lowStockCount > 0 ? ` — ${lowStockCount} need attention` : ""}
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or SKU…"
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
            pageKey="operations-inventory"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Inventory exported.");
        }}
        onRefresh={handleRefresh}
        onCreate={() => setCreateOpen(true)}
        createLabel="Add Item"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveInventoryItems(selected);
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteInventoryItem(id));
              toast.success(`${selected.length} item${selected.length === 1 ? "" : "s"} deleted.`);
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
        ) : items.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No inventory items yet"
            description="Add an item to start tracking stock."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Add Item
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No items match your search"
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
                      aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  {columnVisibility.isVisible("sku") ? <TableHead>SKU</TableHead> : null}
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  {columnVisibility.isVisible("location") ? <TableHead>Location</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((item) => {
                  const status = stockStatus(item);
                  return (
                    <TableRow key={item.id} data-state={selected.includes(item.id) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onCheckedChange={() =>
                            setSelected((prev) =>
                              prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                            )
                          }
                          aria-label={`Select ${item.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      {columnVisibility.isVisible("sku") ? (
                        <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                      ) : null}
                      {columnVisibility.isVisible("category") ? <TableCell>{item.category}</TableCell> : null}
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[status]}`}>
                          {status === "Out of Stock" || status === "Low Stock" ? (
                            <AlertTriangle className="size-3" />
                          ) : null}
                          {status}
                        </Badge>
                      </TableCell>
                      {columnVisibility.isVisible("location") ? (
                        <TableCell className="text-muted-foreground">{item.location}</TableCell>
                      ) : null}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" aria-label={`Actions for ${item.name}`} />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setReceivingItem(item);
                                setReceiveQty("");
                              }}
                            >
                              Receive Inventory
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                archiveInventoryItems([item.id]);
                                toast.success(`${item.name} archived.`);
                              }}
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                deleteInventoryItem(item.id);
                                toast.success(`${item.name} permanently deleted.`);
                              }}
                            >
                              <Trash2 className="size-4" />
                              Delete permanently
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
        itemLabel="items"
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add inventory item</DialogTitle>
            <DialogDescription>Track a new item in the warehouse.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="inv-name" label="Item name">
              <Input
                id="inv-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field id="inv-category" label="Category">
              <Select
                value={createForm.category}
                onValueChange={(value) =>
                  value && setCreateForm((f) => ({ ...f, category: value as InventoryCategory }))
                }
              >
                <SelectTrigger id="inv-category" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="inv-sku" label="SKU">
              <Input
                id="inv-sku"
                value={createForm.sku}
                onChange={(e) => setCreateForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="inv-quantity" label="Starting quantity">
                <Input
                  id="inv-quantity"
                  type="number"
                  min={0}
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </Field>
              <Field id="inv-reorder" label="Reorder threshold">
                <Input
                  id="inv-reorder"
                  type="number"
                  min={0}
                  value={createForm.reorderThreshold}
                  onChange={(e) => setCreateForm((f) => ({ ...f, reorderThreshold: e.target.value }))}
                />
              </Field>
            </div>
            <Field id="inv-location" label="Location">
              <Input
                id="inv-location"
                value={createForm.location}
                onChange={(e) => setCreateForm((f) => ({ ...f, location: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Add item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!receivingItem} onOpenChange={(open) => !open && setReceivingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive inventory</DialogTitle>
            <DialogDescription>{receivingItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="receive-quantity" label="Quantity received">
              <Input
                id="receive-quantity"
                type="number"
                min={1}
                value={receiveQty}
                onChange={(e) => setReceiveQty(e.target.value)}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleReceive}>Receive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
