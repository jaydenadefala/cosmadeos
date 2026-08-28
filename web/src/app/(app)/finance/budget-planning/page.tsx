"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal, PiggyBank, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PageToolbar } from "@/components/ui/page-toolbar";
import { cn } from "@/lib/utils";
import {
  addBudgetLine,
  approveBudgetLine,
  archiveBudgetLines,
  deleteBudgetLine,
  useBudgetLines,
} from "@/lib/mock-data/budgets";
import { useExpenses } from "@/lib/mock-data/expenses";

/** Budget Planning — Finance sidebar. Spend is computed live from real Expenses, never stored redundantly. */
export default function BudgetPlanningPage() {
  const allBudgets = useBudgetLines();
  const allExpenses = useExpenses();
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    category: "",
    periodLabel: "",
    periodStart: "",
    periodEnd: "",
    allocated: "",
  });

  const budgets = React.useMemo(() => allBudgets.filter((b) => !b.archived), [allBudgets]);
  const expenses = React.useMemo(
    () => allExpenses.filter((e) => !e.archived && (e.status === "Approved" || e.status === "Reimbursed")),
    [allExpenses],
  );

  const spentByBudget = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const budget of budgets) {
      const spent = expenses
        .filter(
          (e) =>
            e.category === budget.category &&
            e.submittedDate >= budget.periodStart &&
            e.submittedDate <= budget.periodEnd,
        )
        .reduce((sum, e) => sum + e.amount, 0);
      map.set(budget.id, spent);
    }
    return map;
  }, [budgets, expenses]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return budgets;
    const q = search.trim().toLowerCase();
    return budgets.filter((b) => b.category.toLowerCase().includes(q));
  }, [budgets, search]);

  function handleCreate() {
    if (!createForm.category.trim() || !createForm.periodLabel.trim() || !createForm.periodStart || !createForm.periodEnd) {
      toast.error("Fill in category, period name, and both dates.");
      return;
    }
    addBudgetLine({
      category: createForm.category.trim(),
      periodLabel: createForm.periodLabel.trim(),
      periodStart: createForm.periodStart,
      periodEnd: createForm.periodEnd,
      allocated: Number(createForm.allocated) || 0,
    });
    toast.success("Budget line created as a draft.");
    setCreateOpen(false);
    setCreateForm({ category: "", periodLabel: "", periodStart: "", periodEnd: "", allocated: "" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Budget Planning</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {budgets.length} budget lines
        </p>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by category…"
        onCreate={() => setCreateOpen(true)}
        createLabel="New Budget Line"
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {budgets.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No budget lines yet"
            description="Create a budget line per category to start tracking spend against allocation."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New Budget Line
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No budget lines match your search"
            description="Try a different category name."
            action={
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3 p-4 sm:p-6">
            {filtered.map((budget) => {
              const spent = spentByBudget.get(budget.id) ?? 0;
              const pct = budget.allocated > 0 ? Math.min(100, (spent / budget.allocated) * 100) : 0;
              const overBudget = spent > budget.allocated;
              return (
                <div key={budget.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{budget.category}</span>
                        <Badge variant="outline" className="font-normal">
                          {budget.periodLabel}
                        </Badge>
                        <Badge
                          className={cn(
                            "border-0 font-medium",
                            budget.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-muted text-foreground/70",
                          )}
                        >
                          {budget.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        ${spent.toLocaleString()} spent of ${budget.allocated.toLocaleString()}
                        {overBudget ? " — over budget" : ""}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${budget.category} budget`}
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {budget.status === "Draft" ? (
                          <DropdownMenuItem
                            onClick={() => {
                              approveBudgetLine(budget.id);
                              toast.success(`${budget.category} budget approved.`);
                            }}
                          >
                            Approve Budget
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          onClick={() => {
                            archiveBudgetLines([budget.id]);
                            toast.success("Budget line archived.");
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteBudgetLine(budget.id);
                            toast.success("Budget line permanently deleted.");
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full">
                    <div
                      className={cn("h-full", overBudget ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${Math.max(pct, spent > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New budget line</DialogTitle>
            <DialogDescription>Allocate a budget for a category and period.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="budget-category" label="Category">
              <Input
                id="budget-category"
                placeholder="e.g. Travel"
                value={createForm.category}
                onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
              />
            </Field>
            <Field id="budget-period-label" label="Period name">
              <Input
                id="budget-period-label"
                placeholder="e.g. H2 2026"
                value={createForm.periodLabel}
                onChange={(e) => setCreateForm((f) => ({ ...f, periodLabel: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="budget-period-start" label="Period start">
                <Input
                  id="budget-period-start"
                  type="date"
                  value={createForm.periodStart}
                  onChange={(e) => setCreateForm((f) => ({ ...f, periodStart: e.target.value }))}
                />
              </Field>
              <Field id="budget-period-end" label="Period end">
                <Input
                  id="budget-period-end"
                  type="date"
                  value={createForm.periodEnd}
                  onChange={(e) => setCreateForm((f) => ({ ...f, periodEnd: e.target.value }))}
                />
              </Field>
            </div>
            <Field id="budget-allocated" label="Allocated amount (₦)">
              <Input
                id="budget-allocated"
                type="number"
                min={0}
                value={createForm.allocated}
                onChange={(e) => setCreateForm((f) => ({ ...f, allocated: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
