"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  DollarSign,
  Download,
  FileImage,
  Megaphone,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_STATUSES,
  useCampaigns,
  type CampaignChannel,
  type CampaignStatus,
} from "@/lib/mock-data/campaigns";
import { ASSET_TYPES, useCreativeAssets, type AssetType } from "@/lib/mock-data/creative-assets";
import { CONTENT_STATUSES, useContentPosts, type ContentStatus } from "@/lib/mock-data/content-posts";

const STATUS_BAR_TONE: Record<CampaignStatus, string> = {
  Draft: "bg-muted-foreground/40",
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Completed: "bg-sky-500",
};

const CONTENT_BAR_TONE: Record<ContentStatus, string> = {
  Draft: "bg-muted-foreground/40",
  Scheduled: "bg-sky-500",
  Published: "bg-emerald-500",
};

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportReportCsv(rows: { label: string; value: string }[]) {
  const csv = ["Metric,Value", ...rows.map((r) => `"${r.label}","${r.value}"`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "marketing-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Reports — Marketing sidebar (05 Department Operating Systems/Marketing/
 * marketing-operating-system.md: "Reports is an explicit sidebar section;
 * detailed metrics not supplied" — a documented Gap, same pattern as Sales
 * Reports). Every number here is computed live from the real Campaigns/
 * Content Posts/Creative Assets stores, never hardcoded.
 */
export default function MarketingReportsPage() {
  const [loading, setLoading] = React.useState(true);
  const allCampaigns = useCampaigns();
  const allPosts = useContentPosts();
  const allAssets = useCreativeAssets();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  function refetch() {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }

  const campaigns = React.useMemo(() => allCampaigns.filter((c) => !c.archived), [allCampaigns]);
  const posts = React.useMemo(() => allPosts.filter((p) => !p.archived), [allPosts]);
  const assets = React.useMemo(() => allAssets.filter((a) => !a.archived), [allAssets]);

  const activeCampaigns = campaigns.filter((c) => c.status === "Active");
  const pendingApprovals = campaigns.filter((c) => c.approvalStatus === "Pending");
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

  const statusBreakdown = React.useMemo(() => {
    const maxCount = Math.max(1, ...CAMPAIGN_STATUSES.map((s) => campaigns.filter((c) => c.status === s).length));
    return CAMPAIGN_STATUSES.map((status) => {
      const count = campaigns.filter((c) => c.status === status).length;
      return { status, count, pct: (count / maxCount) * 100 };
    });
  }, [campaigns]);

  const channelBreakdown = React.useMemo(() => {
    const maxCount = Math.max(1, ...CAMPAIGN_CHANNELS.map((c) => campaigns.filter((camp) => camp.channel === c).length));
    return CAMPAIGN_CHANNELS.map((channel) => {
      const count = campaigns.filter((c) => c.channel === channel).length;
      return { channel, count, pct: (count / maxCount) * 100 };
    });
  }, [campaigns]);

  const contentBreakdown = React.useMemo(() => {
    const maxCount = Math.max(1, ...CONTENT_STATUSES.map((s) => posts.filter((p) => p.status === s).length));
    return CONTENT_STATUSES.map((status) => {
      const count = posts.filter((p) => p.status === status).length;
      return { status, count, pct: (count / maxCount) * 100 };
    });
  }, [posts]);

  const assetBreakdown = React.useMemo(() => {
    const maxCount = Math.max(1, ...ASSET_TYPES.map((t) => assets.filter((a) => a.assetType === t).length));
    return ASSET_TYPES.map((assetType) => {
      const count = assets.filter((a) => a.assetType === assetType).length;
      return { assetType, count, pct: (count / maxCount) * 100 };
    });
  }, [assets]);

  function handleExport() {
    exportReportCsv([
      { label: "Active Campaigns", value: String(activeCampaigns.length) },
      { label: "Total Budget", value: `$${totalBudget.toLocaleString()}` },
      { label: "Pending Approvals", value: String(pendingApprovals.length) },
      ...statusBreakdown.map((s) => ({ label: `Campaigns — ${s.status}`, value: String(s.count) })),
      ...channelBreakdown.map((c) => ({ label: `Channel — ${c.channel}`, value: String(c.count) })),
      ...contentBreakdown.map((c) => ({ label: `Content — ${c.status}`, value: String(c.count) })),
      ...assetBreakdown.map((a) => ({ label: `Assets — ${a.assetType}`, value: String(a.count) })),
    ]);
    toast.success("Marketing report exported.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Reports</h1>
          <p className="text-muted-foreground text-sm">
            Live campaign, content, and asset metrics, computed from current data
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
              <MetricCard label="Active Campaigns" value={String(activeCampaigns.length)} icon={Megaphone} />
              <MetricCard label="Total Budget" value={`$${totalBudget.toLocaleString()}`} icon={DollarSign} />
              <MetricCard label="Pending Approvals" value={String(pendingApprovals.length)} icon={BadgeCheck} />
              <MetricCard label="Creative Assets" value={String(assets.length)} icon={FileImage} />
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Campaigns by Status</h2>
              <div className="flex flex-col gap-2.5">
                {statusBreakdown.map(({ status, count, pct }) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{status}</span>
                    <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                      <div
                        className={`h-full ${STATUS_BAR_TONE[status]}`}
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
              <h2 className="mb-3 text-sm font-semibold">Campaigns by Channel</h2>
              <div className="flex flex-col gap-2.5">
                {channelBreakdown.map(({ channel, count, pct }: { channel: CampaignChannel; count: number; pct: number }) => (
                  <div key={channel} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{channel}</span>
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
              <h2 className="mb-3 text-sm font-semibold">Content by Status</h2>
              <div className="flex flex-col gap-2.5">
                {contentBreakdown.map(({ status, count, pct }) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{status}</span>
                    <div className="bg-muted h-6 flex-1 overflow-hidden rounded">
                      <div
                        className={`h-full ${CONTENT_BAR_TONE[status]}`}
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
              <h2 className="mb-3 text-sm font-semibold">Creative Assets by Type</h2>
              <div className="flex flex-col gap-2.5">
                {assetBreakdown.map(({ assetType, count, pct }: { assetType: AssetType; count: number; pct: number }) => (
                  <div key={assetType} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm">{assetType}</span>
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
          </div>
        )}
      </div>
    </div>
  );
}
