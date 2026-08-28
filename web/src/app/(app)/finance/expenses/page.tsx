"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, MoreHorizontal, Receipt, Trash2, X } from "lucide-react";

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
  addExpense,
  archiveExpenses,
  deleteExpense,
  duplicateExpense,
  EXPENSE_CATEGORIES,
  EXPENSE_STATUSES,
  setExpenseStatus,
  uploadReceipt,
  useExpenses,
  type Expense,
  type ExpenseCategory,
  type ExpenseStatus,
} from "@/lib/mock-data/expenses";

const STATUS_TONE: Record<ExpenseStatus, string> = {
  Pending: "bg-muted text-foreground/70",
  Approved: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  Rejected: "bg-destructive/10 text-destructive",
  Reimbursed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: Expense[], employeeName: (id: string) => string) {
  const header = ["Employee", "Description", "Category", "Amount", "Status", "Submitted"];
  const lines = rows.map((r) =>
    [employeeName(r.employeeId), r.description, r.category, String(r.amount), r.status, r.submittedDate]
      .map((v) => `"${v}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Expenses — Finance sidebar. Real receipt uploads via the File API, real Approve/Reject/Reimburse lifecycle. */
export default function ExpensesPage() {
  const allExpenses = useExpenses();
  const employees = useEmployees();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    employeeId: "",
    description: "",
    category: "Travel" as ExpenseCategory,
    amount: "",
    submittedDate: "",
    receiptFile: null as File | null,
  });
  const receiptInputRef = React.useRef<HTMLInputElement>(null);
  const columnVisibility = useColumnVisibility([
    { id: "category", label: "Category" },
    { id: "status", label: "Status" },
    { id: "receipt", label: "Receipt" },
  ]);

  const expenses = React.useMemo(() => allExpenses.filter((e) => !e.archived), [allExpenses]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "status", label: "Status", options: EXPENSE_STATUSES.map((s) => ({ value: s, label: s })) },
      {
        id: "category",
        label: "Category",
        options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = expenses;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          (employeeById.get(e.employeeId)?.name.toLowerCase().includes(q) ?? false),
      );
    }
    if (filters.status) rows = rows.filter((e) => e.status === filters.status);
    if (filters.category) rows = rows.filter((e) => e.category === filters.category);
    return [...rows].sort((a, b) => b.submittedDate.localeCompare(a.submittedDate));
  }, [expenses, search, filters, employeeById]);

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
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
    if (Array.isArray(snapshot.hiddenColumns)) {
      columnVisibility.setHiddenIds(snapshot.hiddenColumns as string[]);
    }
  }

  function handleCreate() {
    if (!createForm.employeeId || !createForm.description.trim() || !createForm.submittedDate) {
      toast.error("Choose an employee, description, and date.");
      return;
    }
    addExpense({
      employeeId: createForm.employeeId,
      description: createForm.description.trim(),
      category: createForm.category,
      amount: Number(createForm.amount) || 0,
      submittedDate: createForm.submittedDate,
      receiptFile: createForm.receiptFile ?? undefined,
    });
    toast.success("Expense submitted.");
    setCreateOpen(false);
    setCreateForm({
      employeeId: "",
      description: "",
      category: "Travel",
      amount: "",
      submittedDate: "",
      receiptFile: null,
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Expenses</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {expenses.length} expenses
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search expenses…"
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
            pageKey="finance-expenses"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onExport={() => {
          exportToCsv(filtered, (id) => employeeById.get(id)?.name ?? "—");
          toast.success("Expenses exported.");
        }}
        onRefresh={handleRefresh}
        onCreate={() => setCreateOpen(true)}
        createLabel="Create Expense"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveExpenses(selected);
              toast.success(`${selected.length} expense${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteExpense(id));
              toast.success(`${selected.length} expense${selected.length === 1 ? "" : "s"} deleted.`);
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
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Submit an expense to start tracking reimbursements."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                Create Expense
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No expenses match your search"
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
                      pagination.pageItems.every((e) => selected.includes(e.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((e) => prev.includes(e.id))
                          ? prev.filter((id) => !pagination.pageItems.some((e) => e.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((e) => e.id)])],
                      )
                    }
                      aria-label="Select all expenses"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Description</TableHead>
                  {columnVisibility.isVisible("category") ? <TableHead>Category</TableHead> : null}
                  <TableHead>Amount</TableHead>
                  {columnVisibility.isVisible("status") ? <TableHead>Status</TableHead> : null}
                  {columnVisibility.isVisible("receipt") ? <TableHead>Receipt</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((expense) => {
                  const employee = employeeById.get(expense.employeeId);
                  return (
                    <TableRow
                      key={expense.id}
                      data-state={selected.includes(expense.id) ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(expense.id)}
                          onCheckedChange={() =>
                            setSelected((prev) =>
                              prev.includes(expense.id)
                                ? prev.filter((id) => id !== expense.id)
                                : [...prev, expense.id],
                            )
                          }
                          aria-label={`Select ${expense.description}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{employee?.name ?? "—"}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      {columnVisibility.isVisible("category") ? <TableCell>{expense.category}</TableCell> : null}
                      <TableCell>${expense.amount.toLocaleString()}</TableCell>
                      {columnVisibility.isVisible("status") ? (
                        <TableCell>
                          <Badge className={`border-0 font-medium ${STATUS_TONE[expense.status]}`}>
                            {expense.status}
                          </Badge>
                        </TableCell>
                      ) : null}
                      {columnVisibility.isVisible("receipt") ? (
                        <TableCell className="text-muted-foreground text-xs">
                          {expense.receiptName ?? "None"}
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${expense.description}`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {expense.status === "Pending" ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setExpenseStatus(expense.id, "Approved");
                                    toast.success("Expense approved.");
                                  }}
                                >
                                  <Check className="size-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setExpenseStatus(expense.id, "Rejected");
                                    toast.success("Expense rejected.");
                                  }}
                                >
                                  <X className="size-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            ) : null}
                            {expense.status === "Approved" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setExpenseStatus(expense.id, "Reimbursed");
                                  toast.success("Expense marked reimbursed.");
                                }}
                              >
                                Mark Reimbursed
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => {
                                receiptInputRef.current?.setAttribute("data-expense-id", expense.id);
                                receiptInputRef.current?.click();
                              }}
                            >
                              Upload Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const copy = duplicateExpense(expense.id);
                                if (copy) toast.success("Expense duplicated.");
                              }}
                            >
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                archiveExpenses([expense.id]);
                                toast.success("Expense archived.");
                              }}
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                deleteExpense(expense.id);
                                toast.success("Expense permanently deleted.");
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
        itemLabel="expenses"
      />

      <input
        ref={receiptInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const expenseId = receiptInputRef.current?.getAttribute("data-expense-id");
          e.target.value = "";
          if (!file || !expenseId) return;
          uploadReceipt(expenseId, file);
          toast.success(`${file.name} attached.`);
        }}
        aria-hidden="true"
        tabIndex={-1}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create expense</DialogTitle>
            <DialogDescription>Submit a new expense for reimbursement.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="expense-employee" label="Employee">
              <Select
                value={createForm.employeeId}
                onValueChange={(value) => value && setCreateForm((f) => ({ ...f, employeeId: value }))}
              >
                <SelectTrigger id="expense-employee" className="w-full">
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
            <Field id="expense-description" label="Description">
              <Input
                id="expense-description"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
            <Field id="expense-category" label="Category">
              <Select
                value={createForm.category}
                onValueChange={(value) =>
                  value && setCreateForm((f) => ({ ...f, category: value as ExpenseCategory }))
                }
              >
                <SelectTrigger id="expense-category" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="expense-amount" label="Amount (₦)">
              <Input
                id="expense-amount"
                type="number"
                min={0}
                value={createForm.amount}
                onChange={(e) => setCreateForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </Field>
            <Field id="expense-date" label="Submitted date">
              <Input
                id="expense-date"
                type="date"
                value={createForm.submittedDate}
                onChange={(e) => setCreateForm((f) => ({ ...f, submittedDate: e.target.value }))}
              />
            </Field>
            <Field id="expense-receipt" label="Receipt (optional)">
              <input
                id="expense-receipt"
                type="file"
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, receiptFile: e.target.files?.[0] ?? null }))
                }
                className="text-sm"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Submit expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
