"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, FileText, RefreshCw, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { useBankAccounts } from "@/lib/mock-data/banking";
import { useBills } from "@/lib/mock-data/bills";
import { EXPENSE_CATEGORIES, useExpenses } from "@/lib/mock-data/expenses";
import { INVOICE_STATUSES, invoiceTotal, useInvoices, type InvoiceStatus } from "@/lib/mock-data/invoices";

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportReportCsv(rows: { label: string; value: string }[]) {
  const csv = ["Metric,Value", ...rows.map((r) => `"${r.label}","${r.value}"`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finance-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Reports — Finance sidebar (05 Department Operating Systems/Finance/
 * finance-operating-system.md). Real computed metrics across Invoices,
 * Bills, Expenses, and Banking — same pattern as Sales/Marketing Reports.
 */
export default function FinanceReportsPage() {
  const [loading, setLoading] = React.useState(true);
  const allInvoices = useInvoices();
  const allBills = useBills();
  const allExpenses = useExpenses();
  const accounts = useBankAccounts();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  function refetch() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }

  const invoices = React.useMemo(() => allInvoices.filter((i) => !i.archived), [allInvoices]);
  const bills = React.useMemo(() => allBills.filter((b) => !b.archived), [allBills]);
  const expenses = React.useMemo(() => allExpenses.filter((e) => !e.archived), [allExpenses]);
  const activeAccounts = React.useMemo(() => accounts.filter((a) => !a.archived), [accounts]);

  const totalCash = activeAccounts.reduce((sum, a) => sum + a.balance, 0);
  const paidInvoiceRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + invoiceTotal(i), 0);
  const outstandingReceivables = invoices
    .filter((i) => i.status === "Sent" || i.status === "Overdue")
    .reduce((sum, i) => sum + invoiceTotal(i), 0);
  const unpaidBills = bills.filter((b) => b.status !== "Paid").reduce((sum, b) => sum + b.amount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === "Pending").length;

  const invoiceStatusBreakdown = React.useMemo(() => {
    const maxCount = Math.max(1, ...INVOICE_STATUSES.map((s) => invoices.filter((i) => i.status === s).length));
    return INVOICE_STATUSES.map((status) => {
      const count = invoices.filter((i) => i.status === status).length;
      return { status, count, pct: (count / maxCount) * 100 };
    });
  }, [invoices]);

  const expenseByCategory = React.useMemo(() => {
    const approved = expenses.filter((e) => e.status !== "Rejected");
    const maxCategory = Math.max(
      1,
      ...EXPENSE_CATEGORIES.map((c) => approved.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0)),
    );
    return EXPENSE_CATEGORIES.map((category) => {
      const total = approved.filter((e) => e.category === category).reduce((s, e) => s + e.amount, 0);
      return { category, total, pct: (total / maxCategory) * 100 };
    }).filter((c) => c.total > 0);
  }, [expenses]);

  function handleExport() {
    exportReportCsv([
      { label: "Total Cash", value: `$${totalCash.toLocaleString()}` },
      { label: "Paid Invoice Revenue", value: `$${paidInvoiceRevenue.toLocaleString()}` },
      { label: "Outstanding Receivables", value: `$${outstandingReceivables.toLocaleString()}` },
      { label: "Unpaid Bills", value: `$${unpaidBills.toLocaleString()}` },
      { label: "Pending Expense Approvals", value: String(pendingExpenses) },
      ...invoiceStatusBreakdown.map((s: { status: InvoiceStatus; count: number }) => ({
        label: `Invoices — ${s.status}`,
        value: String(s.count),
      })),
      ...expenseByCategory.map((c) => ({ label: `Expenses — ${c.category}`, value: `$${c.total.toLocaleString()}` })),
    ]);
    toast.success("Finance report exported.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Reports</h1>
          <p className="text-muted-foreground text-sm">
            Live financial metrics, computed from current data
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={refetch}>
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-24 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Total Cash" value={`$${totalCash.toLocaleString()}`} icon={Wallet} />
              <MetricCard label="Paid Invoice Revenue" value={`$${paidInvoiceRevenue.toLocaleString()}`} />
              <MetricCard label="Outstanding Receivables" value={`$${outstandingReceivables.toLocaleString()}`} />
              <MetricCard
                label="Unpaid Bills"
                value={`$${unpaidBills.toLocaleString()}`}
                icon={FileText}
              />
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Invoices by Status</h2>
              <div className="flex flex-col gap-2.5">
                {invoiceStatusBreakdown.map(({ status, count, pct }) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{status}</span>
                    <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-10 shrink-0 text-right text-xs tabular-nums">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Expenses by Category</h2>
              {expenseByCategory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No expenses recorded yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {expenseByCategory.map(({ category, total, pct }) => (
                    <div key={category} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-sm">{category}</span>
                      <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                        <div className="bg-primary h-full" style={{ width: `${Math.max(pct, 4)}%` }} />
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
        )}
      </div>
    </div>
  );
}
