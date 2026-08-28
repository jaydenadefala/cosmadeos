"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Building2,
  DollarSign,
  Download,
  RefreshCw,
  Rows3,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetricCard } from "@/components/ui/metric-card";
import type { Density } from "@/components/ui/page-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompanies, type CompanyStatus } from "@/lib/mock-data/companies";
import { useEmployees } from "@/lib/mock-data/employees";
import { LEAD_STAGES, useLeads, type LeadStage } from "@/lib/mock-data/leads";

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportReportCsv(rows: { label: string; value: string }[]) {
  const csv = ["Metric,Value", ...rows.map((r) => `"${r.label}","${r.value}"`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sales-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const STAGE_BAR_TONE: Record<LeadStage, string> = {
  new: "bg-sky-500",
  contacted: "bg-sky-500",
  qualified: "bg-sky-500",
  proposal: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-muted-foreground/40",
};

const COMPANY_STATUS_TONE: Record<CompanyStatus, string> = {
  Customer: "bg-emerald-500",
  Prospect: "bg-sky-500",
  Lost: "bg-muted-foreground/40",
};

/**
 * Reports — Sales sidebar group (05 Department Operating Systems/Sales/
 * sales-operating-system.md: "Reports is an explicit sidebar section;
 * detailed metrics not supplied" — a documented Gap, so the metric set
 * below is a reasonable inference, not an invented architectural decision).
 * This is the one legitimate exception to ADR-002's "workspaces are working
 * environments, not dashboards" rule — Reports genuinely is the analytics
 * surface, the same way every object's own Analytics tab is read-only by
 * design. Every number here is computed live from the real Leads/Companies/
 * Employees stores, never hardcoded.
 */
export default function SalesReportsPage() {
  const [loading, setLoading] = React.useState(true);
  const [density, setDensity] = React.useState<Density>("comfortable");
  const leads = useLeads();
  const companies = useCompanies();
  const employees = useEmployees();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  function refetch() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }

  const activeLeads = React.useMemo(() => leads.filter((l) => !l.archived), [leads]);

  const openLeads = activeLeads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const wonLeads = activeLeads.filter((l) => l.stage === "won");
  const lostLeads = activeLeads.filter((l) => l.stage === "lost");
  const closedCount = wonLeads.length + lostLeads.length;
  const winRate = closedCount > 0 ? Math.round((wonLeads.length / closedCount) * 100) : 0;

  const openPipelineValue = openLeads.reduce((sum, l) => sum + l.value, 0);
  const wonValue = wonLeads.reduce((sum, l) => sum + l.value, 0);

  const stageBreakdown = React.useMemo(() => {
    const maxValue = Math.max(
      1,
      ...LEAD_STAGES.map((s) =>
        activeLeads.filter((l) => l.stage === s.id).reduce((sum, l) => sum + l.value, 0),
      ),
    );
    return LEAD_STAGES.map((stage) => {
      const stageLeads = activeLeads.filter((l) => l.stage === stage.id);
      const value = stageLeads.reduce((sum, l) => sum + l.value, 0);
      return { stage, count: stageLeads.length, value, pct: (value / maxValue) * 100 };
    });
  }, [activeLeads]);

  const topPerformers = React.useMemo(() => {
    const byOwner = new Map<string, { count: number; value: number }>();
    for (const lead of wonLeads) {
      const entry = byOwner.get(lead.ownerId) ?? { count: 0, value: 0 };
      entry.count += 1;
      entry.value += lead.value;
      byOwner.set(lead.ownerId, entry);
    }
    return Array.from(byOwner.entries())
      .map(([ownerId, stats]) => ({
        owner: employees.find((e) => e.id === ownerId),
        ...stats,
      }))
      .sort((a, b) => b.value - a.value);
  }, [wonLeads, employees]);

  const companyStatusBreakdown = React.useMemo(() => {
    const activeCompanies = companies.filter((c) => !c.archived);
    const statuses: CompanyStatus[] = ["Customer", "Prospect", "Lost"];
    const maxCount = Math.max(1, ...statuses.map((s) => activeCompanies.filter((c) => c.status === s).length));
    return statuses.map((status) => {
      const count = activeCompanies.filter((c) => c.status === status).length;
      return { status, count, pct: (count / maxCount) * 100 };
    });
  }, [companies]);

  function handleExport() {
    exportReportCsv([
      { label: "Open Pipeline Value", value: `$${openPipelineValue.toLocaleString()}` },
      { label: "Win Rate", value: `${winRate}%` },
      { label: "Deals Won", value: String(wonLeads.length) },
      { label: "Deals Lost", value: String(lostLeads.length) },
      { label: "Won Value", value: `$${wonValue.toLocaleString()}` },
      ...stageBreakdown.map((s) => ({
        label: `Pipeline — ${s.stage.label}`,
        value: `${s.count} deals, $${s.value.toLocaleString()}`,
      })),
      ...topPerformers.map((p) => ({
        label: `Top Performer — ${p.owner?.name ?? "Unassigned"}`,
        value: `${p.count} won, $${p.value.toLocaleString()}`,
      })),
    ]);
    toast.success("Sales report exported.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Reports</h1>
          <p className="text-muted-foreground text-sm">
            Live pipeline and performance metrics, computed from current data
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Density" />}>
              <Rows3 className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["comfortable", "compact", "dense"] as const).map((d) => (
                <DropdownMenuCheckboxItem
                  key={d}
                  checked={density === d}
                  onCheckedChange={() => setDensity(d)}
                  closeOnClick={false}
                  className="capitalize"
                >
                  {d}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              <MetricCard
                label="Open Pipeline"
                value={`$${openPipelineValue.toLocaleString()}`}
                icon={DollarSign}
              />
              <MetricCard label="Win Rate" value={`${winRate}%`} icon={TrendingUp} />
              <MetricCard label="Deals Won" value={String(wonLeads.length)} icon={Trophy} />
              <MetricCard label="Deals Lost" value={String(lostLeads.length)} icon={TrendingDown} />
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Pipeline by Stage</h2>
              <div className="flex flex-col gap-2.5">
                {stageBreakdown.map(({ stage, count, value, pct }) => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{stage.label}</span>
                    <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                      <div
                        className={`h-full ${STAGE_BAR_TONE[stage.id]}`}
                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-32 shrink-0 text-right text-xs tabular-nums">
                      {count} · ${value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Top Performers</h2>
              {topPerformers.length === 0 ? (
                <p className="text-muted-foreground text-sm">No won deals yet.</p>
              ) : (
                <Table density={density}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rep</TableHead>
                      <TableHead>Deals Won</TableHead>
                      <TableHead>Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformers.map((p) => (
                      <TableRow key={p.owner?.id ?? "unassigned"}>
                        <TableCell className="font-medium">{p.owner?.name ?? "Unassigned"}</TableCell>
                        <TableCell>{p.count}</TableCell>
                        <TableCell>${p.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div>
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                <Building2 className="size-4" />
                Companies by Status
              </h2>
              <div className="flex flex-col gap-2.5">
                {companyStatusBreakdown.map(({ status, count, pct }) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{status}</span>
                    <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                      <div
                        className={`h-full ${COMPANY_STATUS_TONE[status]}`}
                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-16 shrink-0 text-right text-xs tabular-nums">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
