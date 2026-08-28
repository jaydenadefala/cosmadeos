"use client";

import * as React from "react";
import { DollarSign, Handshake, TrendingUp } from "lucide-react";

import { MetricCard } from "@/components/ui/metric-card";
import { useCompanies } from "@/lib/mock-data/companies";
import { useInvoices, invoiceTotal } from "@/lib/mock-data/invoices";
import { useLeads } from "@/lib/mock-data/leads";

/**
 * Revenue — Finance sidebar (05 Department Operating Systems/Finance/
 * finance-operating-system.md). Computed entirely from real Paid Invoices
 * and Won Leads (Sales) — never hardcoded. Per ADR-002, this is one of the
 * Finance workspace's analytical overview surfaces, not the default landing
 * page (Invoices is).
 */
export default function RevenuePage() {
  const allInvoices = useInvoices();
  const allLeads = useLeads();
  const companies = useCompanies();

  const paidInvoices = React.useMemo(
    () => allInvoices.filter((i) => !i.archived && i.status === "Paid"),
    [allInvoices],
  );
  const wonLeads = React.useMemo(
    () => allLeads.filter((l) => !l.archived && l.stage === "won"),
    [allLeads],
  );

  const totalInvoicedRevenue = paidInvoices.reduce((sum, i) => sum + invoiceTotal(i), 0);
  const totalWonDealValue = wonLeads.reduce((sum, l) => sum + l.value, 0);

  const companyById = React.useMemo(() => {
    const map = new Map<string, (typeof companies)[number]>();
    for (const company of companies) map.set(company.id, company);
    return map;
  }, [companies]);

  const revenueByCompany = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const invoice of paidInvoices) {
      map.set(invoice.companyId, (map.get(invoice.companyId) ?? 0) + invoiceTotal(invoice));
    }
    return Array.from(map.entries())
      .map(([companyId, total]) => ({ company: companyById.get(companyId), total }))
      .sort((a, b) => b.total - a.total);
  }, [paidInvoices, companyById]);

  const maxCompanyRevenue = Math.max(1, ...revenueByCompany.map((r) => r.total));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Revenue</h1>
        <p className="text-muted-foreground text-sm">Computed from real paid invoices and won deals</p>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard
            label="Total Invoiced Revenue"
            value={`$${totalInvoicedRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <MetricCard label="Paid Invoices" value={String(paidInvoices.length)} icon={TrendingUp} />
          <MetricCard
            label="Won Deal Value (Sales)"
            value={`$${totalWonDealValue.toLocaleString()}`}
            icon={Handshake}
          />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Revenue by Company</h2>
          {revenueByCompany.length === 0 ? (
            <p className="text-muted-foreground text-sm">No paid invoices yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {revenueByCompany.map(({ company, total }) => (
                <div key={company?.id ?? "unknown"} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm">{company?.name ?? "Unknown"}</span>
                  <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${Math.max((total / maxCompanyRevenue) * 100, 4)}%` }}
                    />
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
