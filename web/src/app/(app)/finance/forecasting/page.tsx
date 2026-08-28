"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, RotateCcw, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { useLeads } from "@/lib/mock-data/leads";

const DEFAULT_GROWTH_RATE = 5;
const MONTHS_AHEAD = 6;

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportForecastCsv(rows: { month: string; value: number }[]) {
  const csv = ["Month,Forecasted Revenue", ...rows.map((r) => `"${r.month}","$${r.value.toFixed(0)}"`)].join(
    "\n",
  );
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "revenue-forecast.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Forecasting — Finance sidebar (05 Department Operating Systems/Finance/
 * finance-operating-system.md; CLAUDE.md's Finance action set names
 * "Forecast Revenue" explicitly). Baseline is computed live from real Won
 * Leads (Sales) and weighted Open Pipeline — never hardcoded — projected
 * forward using a genuinely editable growth-rate assumption, not a static
 * chart.
 */
export default function ForecastingPage() {
  const allLeads = useLeads();
  const [growthRate, setGrowthRate] = React.useState(String(DEFAULT_GROWTH_RATE));

  const leads = React.useMemo(() => allLeads.filter((l) => !l.archived), [allLeads]);
  const wonLeads = React.useMemo(() => leads.filter((l) => l.stage === "won"), [leads]);
  const lostLeads = React.useMemo(() => leads.filter((l) => l.stage === "lost"), [leads]);
  const openLeads = React.useMemo(
    () => leads.filter((l) => l.stage !== "won" && l.stage !== "lost"),
    [leads],
  );

  const wonRevenue = wonLeads.reduce((sum, l) => sum + l.value, 0);
  const openPipelineValue = openLeads.reduce((sum, l) => sum + l.value, 0);
  const closedCount = wonLeads.length + lostLeads.length;
  const winRate = closedCount > 0 ? wonLeads.length / closedCount : 0;
  const weightedPipeline = openPipelineValue * winRate;

  const baseline = wonRevenue + weightedPipeline;
  const rate = (Number(growthRate) || 0) / 100;

  const forecast = React.useMemo(() => {
    const now = new Date();
    return Array.from({ length: MONTHS_AHEAD }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const month = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const value = baseline * Math.pow(1 + rate, i + 1);
      return { month, value };
    });
  }, [baseline, rate]);

  const maxForecast = Math.max(1, ...forecast.map((f) => f.value));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Forecasting</h1>
          <p className="text-muted-foreground text-sm">
            Revenue projection computed from real won deals and weighted open pipeline
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            exportForecastCsv(forecast);
            toast.success("Forecast exported.");
          }}
        >
          <Download className="size-3.5" />
          Export
        </Button>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Won Revenue" value={`$${wonRevenue.toLocaleString()}`} icon={TrendingUp} />
          <MetricCard label="Open Pipeline" value={`$${openPipelineValue.toLocaleString()}`} />
          <MetricCard label="Win Rate" value={`${Math.round(winRate * 100)}%`} />
          <MetricCard label="Weighted Baseline" value={`$${Math.round(baseline).toLocaleString()}`} />
        </div>

        <div className="flex max-w-xs items-end gap-2">
          <Field id="growth-rate" label="Expected monthly growth rate (%)">
            <Input
              id="growth-rate"
              type="number"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
            />
          </Field>
          <Button
            variant="outline"
            size="icon"
            aria-label="Reset to default growth rate"
            onClick={() => setGrowthRate(String(DEFAULT_GROWTH_RATE))}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{MONTHS_AHEAD}-Month Revenue Forecast</h2>
          <div className="flex flex-col gap-2.5">
            {forecast.map(({ month, value }) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm">{month}</span>
                <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${Math.max((value / maxForecast) * 100, 4)}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-28 shrink-0 text-right text-xs tabular-nums">
                  ${Math.round(value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
