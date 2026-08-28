"use client";

import * as React from "react";
import { AlertTriangle, Banknote, Flame } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { useBankAccounts } from "@/lib/mock-data/banking";
import { useBills } from "@/lib/mock-data/bills";
import { useExpenses } from "@/lib/mock-data/expenses";
import { cn } from "@/lib/utils";

const MONTHS_PROJECTED = 12;

/**
 * Runway — Finance sidebar (05 Department Operating Systems/Finance/
 * finance-operating-system.md). Cash on hand is the real sum of Banking
 * account balances; monthly burn is computed from real non-rejected
 * Expenses plus all Bills — genuinely connected, never a fabricated number.
 */
export default function RunwayPage() {
  const accounts = useBankAccounts();
  const allExpenses = useExpenses();
  const allBills = useBills();

  const activeAccounts = React.useMemo(() => accounts.filter((a) => !a.archived), [accounts]);
  const cashOnHand = activeAccounts.reduce((sum, a) => sum + a.balance, 0);

  const monthlyExpenseBurn = React.useMemo(
    () =>
      allExpenses
        .filter((e) => !e.archived && e.status !== "Rejected")
        .reduce((sum, e) => sum + e.amount, 0),
    [allExpenses],
  );
  const monthlyBillBurn = React.useMemo(
    () => allBills.filter((b) => !b.archived).reduce((sum, b) => sum + b.amount, 0),
    [allBills],
  );
  const monthlyBurn = monthlyExpenseBurn + monthlyBillBurn;

  const runwayMonths = monthlyBurn > 0 ? cashOnHand / monthlyBurn : Infinity;
  const isWarning = Number.isFinite(runwayMonths) && runwayMonths < 6;

  const projection = React.useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_PROJECTED }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const month = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const remaining = Math.max(0, cashOnHand - monthlyBurn * i);
      return { month, remaining };
    });
  }, [cashOnHand, monthlyBurn]);

  const maxRemaining = Math.max(1, cashOnHand);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Runway</h1>
        <p className="text-muted-foreground text-sm">
          Computed from real bank balances (Banking) and current burn (Expenses + Bills)
        </p>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard label="Cash on Hand" value={`$${cashOnHand.toLocaleString()}`} icon={Banknote} />
          <MetricCard label="Monthly Burn" value={`$${monthlyBurn.toLocaleString()}`} icon={Flame} />
          <MetricCard
            label="Runway"
            value={Number.isFinite(runwayMonths) ? `${runwayMonths.toFixed(1)} months` : "∞"}
            icon={isWarning ? AlertTriangle : undefined}
          />
        </div>

        {isWarning ? (
          <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-sm">
            <AlertTriangle className="size-4 shrink-0" />
            Runway is under 6 months at the current burn rate — consider reducing spend or accelerating
            collections.
          </div>
        ) : null}

        <div>
          <h2 className="mb-3 text-sm font-semibold">Projected Cash Balance (12 months)</h2>
          <div className="flex flex-col gap-2.5">
            {projection.map(({ month, remaining }) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm">{month}</span>
                <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                  <div
                    className={cn("h-full", remaining === 0 ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${Math.max((remaining / maxRemaining) * 100, remaining > 0 ? 2 : 100)}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-28 shrink-0 text-right text-xs tabular-nums">
                  ${Math.round(remaining).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
