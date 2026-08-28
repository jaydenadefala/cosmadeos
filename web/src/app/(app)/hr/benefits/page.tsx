"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, HeartPulse, MoreHorizontal, Trash2 } from "lucide-react";

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
import {
  CARD_DENSITY_CLASS,
  CARD_GRID_DENSITY_CLASS,
  PageToolbar,
  type Density,
} from "@/components/ui/page-toolbar";
import { cn } from "@/lib/utils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BenefitPlanDetailSheet } from "@/components/hr/benefit-plan-detail-sheet";
import {
  BENEFIT_CATEGORIES,
  addBenefitPlan,
  archiveBenefitPlans,
  deleteBenefitPlan,
  duplicateBenefitPlan,
  useBenefitPlans,
  type BenefitCategory,
  type BenefitPlan,
} from "@/lib/mock-data/benefit-plans";

/**
 * Benefits — Workforce sidebar group (05 Department Operating Systems/HR/
 * hr-operating-system.md). Plans are real, enrollable records — "Assign
 * Benefits" (CLAUDE.md's HR action set) happens per-plan in the detail
 * sheet, not a free-text field on the employee record.
 */
export default function BenefitsPage() {
  const allPlans = useBenefitPlans();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [openPlan, setOpenPlan] = React.useState<BenefitPlan | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState({
    name: "",
    category: "Health" as BenefitCategory,
    provider: "",
    employeeCost: "",
    employerCost: "",
    description: "",
  });

  const plans = React.useMemo(() => allPlans.filter((p) => !p.archived), [allPlans]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "category",
        label: "Category",
        options: BENEFIT_CATEGORIES.map((c) => ({ value: c, label: c })),
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = plans;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q) || p.provider.toLowerCase().includes(q));
    }
    if (filters.category) rows = rows.filter((p) => p.category === filters.category);
    return rows;
  }, [plans, search, filters]);

  const pagination = usePagination(filtered);

  function handleCreate() {
    if (!createForm.name.trim() || !createForm.provider.trim()) {
      toast.error("Give the plan a name and provider.");
      return;
    }
    const plan = addBenefitPlan({
      name: createForm.name.trim(),
      category: createForm.category,
      provider: createForm.provider.trim(),
      employeeCost: Number(createForm.employeeCost) || 0,
      employerCost: Number(createForm.employerCost) || 0,
      description: createForm.description.trim(),
    });
    toast.success(`${plan.name} created.`);
    setCreateOpen(false);
    setCreateForm({
      name: "",
      category: "Health",
      provider: "",
      employeeCost: "",
      employerCost: "",
      description: "",
    });
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Benefits</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {plans.length} plans
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search benefit plans…"
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
            pageKey="hr-benefits"
            snapshot={{ search, filters, density }}
            onApply={applyView}
          />
        }
        onCreate={() => setCreateOpen(true)}
        createLabel="New Plan"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveBenefitPlans(selected);
              toast.success(`${selected.length} plan${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteBenefitPlan(id));
              toast.success(`${selected.length} plan${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {plans.length === 0 ? (
          <EmptyState
            icon={HeartPulse}
            title="No benefit plans yet"
            description="Add a health, dental, vision, retirement, or life insurance plan employees can enroll in."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New Plan
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No plans match your search"
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
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", CARD_GRID_DENSITY_CLASS[density])}>
            {pagination.pageItems.map((plan) => (
              <div
                key={plan.id}
                className={cn("bg-card flex flex-col gap-3 rounded-lg border shadow-sm", CARD_DENSITY_CLASS[density])}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selected.includes(plan.id)}
                      onCheckedChange={() =>
                        setSelected((prev) =>
                          prev.includes(plan.id) ? prev.filter((id) => id !== plan.id) : [...prev, plan.id],
                        )
                      }
                      aria-label={`Select ${plan.name}`}
                    />
                    <Badge variant="secondary" className="font-medium">
                      {plan.category}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Actions for ${plan.name}`}
                        />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOpenPlan(plan)}>Open</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const copy = duplicateBenefitPlan(plan.id);
                          if (copy) toast.success(`${copy.name} created.`);
                        }}
                      >
                        <Copy className="size-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          archiveBenefitPlans([plan.id]);
                          toast.success(`${plan.name} archived.`);
                        }}
                      >
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          deleteBenefitPlan(plan.id);
                          toast.success(`${plan.name} permanently deleted.`);
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <button onClick={() => setOpenPlan(plan)} className="text-left">
                  <p className="text-sm font-semibold hover:underline">{plan.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{plan.description}</p>
                </button>

                <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2 text-xs">
                  <span className="text-muted-foreground">{plan.provider}</span>
                  <span className="font-medium">{plan.enrolledEmployeeIds.length} enrolled</span>
                </div>
              </div>
            ))}
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
        itemLabel="plans"
      />

      {openPlan ? (
        <BenefitPlanDetailSheet
          plan={openPlan}
          open={!!openPlan}
          onOpenChange={(open) => !open && setOpenPlan(null)}
        />
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New benefit plan</DialogTitle>
            <DialogDescription>Add a plan employees can enroll in.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="new-benefit-name" label="Plan name">
              <Input
                id="new-benefit-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field id="new-benefit-category" label="Category">
              <Select
                value={createForm.category}
                onValueChange={(value) =>
                  value && setCreateForm((f) => ({ ...f, category: value as BenefitCategory }))
                }
              >
                <SelectTrigger id="new-benefit-category" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BENEFIT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="new-benefit-provider" label="Provider">
              <Input
                id="new-benefit-provider"
                value={createForm.provider}
                onChange={(e) => setCreateForm((f) => ({ ...f, provider: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="new-benefit-employee-cost" label="Employee cost (₦/mo)">
                <Input
                  id="new-benefit-employee-cost"
                  type="number"
                  min={0}
                  value={createForm.employeeCost}
                  onChange={(e) => setCreateForm((f) => ({ ...f, employeeCost: e.target.value }))}
                />
              </Field>
              <Field id="new-benefit-employer-cost" label="Employer cost (₦/mo)">
                <Input
                  id="new-benefit-employer-cost"
                  type="number"
                  min={0}
                  value={createForm.employerCost}
                  onChange={(e) => setCreateForm((f) => ({ ...f, employerCost: e.target.value }))}
                />
              </Field>
            </div>
            <Field id="new-benefit-description" label="Description">
              <Textarea
                id="new-benefit-description"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Create plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
