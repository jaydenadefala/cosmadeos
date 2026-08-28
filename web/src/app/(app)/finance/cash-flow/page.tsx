"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { TRANSACTION_CATEGORIES, useTransactions } from "@/lib/mock-data/banking";
import { cn } from "@/lib/utils";

/**
 * Cash Flow — Finance sidebar (05 Department Operating Systems/Finance/
 * finance-operating-system.md). Entirely derived from real Banking
 * transactions (positive = inflow, negative = outflow) — the same
 * transactions a user manages on the Banking page, viewed as a flow
 * summary rather than a raw ledger.
 */
export default function CashFlowPage() {
  const allTransactions = useTransactions();

  const transactions = React.useMemo(() => allTransactions.filter((t) => !t.archived), [allTransactions]);
  const inflows = React.useMemo(() => transactions.filter((t) => t.amount > 0), [transactions]);
  const outflows = React.useMemo(() => transactions.filter((t) => t.amount < 0), [transactions]);

  const totalInflow = inflows.reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = outflows.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netCashFlow = totalInflow - totalOutflow;

  const outflowByCategory = React.useMemo(() => {
    const maxCategory = Math.max(
      1,
      ...TRANSACTION_CATEGORIES.map((c) =>
        outflows.filter((t) => t.category === c).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      ),
    );
    return TRANSACTION_CATEGORIES.map((category) => {
      const total = outflows
        .filter((t) => t.category === category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { category, total, pct: (total / maxCategory) * 100 };
    }).filter((c) => c.total > 0);
  }, [outflows]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Cash Flow</h1>
        <p className="text-muted-foreground text-sm">Computed from real Banking transactions</p>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard label="Total Inflows" value={`$${totalInflow.toLocaleString()}`} icon={ArrowUpRight} />
          <MetricCard label="Total Outflows" value={`$${totalOutflow.toLocaleString()}`} icon={ArrowDownRight} />
          <MetricCard
            label="Net Cash Flow"
            value={`${netCashFlow >= 0 ? "+" : "-"}$${Math.abs(netCashFlow).toLocaleString()}`}
            icon={Scale}
          />
        </div>

        <div
          className={cn(
            "rounded-lg p-3 text-sm",
            netCashFlow >= 0
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {netCashFlow >= 0
            ? "Cash flow is positive for the current period."
            : "Cash flow is negative for the current period — outflows exceed inflows."}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Outflows by Category</h2>
          {outflowByCategory.length === 0 ? (
            <p className="text-muted-foreground text-sm">No outflows recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {outflowByCategory.map(({ category, total, pct }) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm">{category}</span>
                  <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                    <div className="bg-destructive h-full" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                  <span className="text-muted-foreground w-28 shrink-0 text-right text-xs tabular-nums">
                    ${total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
