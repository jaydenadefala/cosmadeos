"use client";

import { notFound } from "next/navigation";
import * as React from "react";
import { Briefcase, Mail, Pencil, UserMinus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner, type RecordStatus } from "@/components/ui/record-status-banner";
import { SyncStatusBanner, type ConnectivityStatus } from "@/components/ui/sync-status-banner";
import { CalendarClock } from "lucide-react";

/**
 * Dev-only verification harness for the Phase 3 ObjectPage framework —
 * simulates an Employee Profile (foreshadows the real Phase 5 HR page)
 * purely to prove the shared components compose correctly.
 */
export default function ObjectPageDemo() {
  if (process.env.NODE_ENV === "production") notFound();

  const [favorited, setFavorited] = React.useState(false);
  const [recordStatus, setRecordStatus] = React.useState<RecordStatus | null>(null);
  const [connectivity, setConnectivity] = React.useState<ConnectivityStatus>("synced");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="bg-muted/40 flex flex-wrap items-center gap-2 border-b p-2 text-xs">
        <span className="text-muted-foreground px-2">Preview controls:</span>
        {(["archived", "deleted", "read-only", "maintenance"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={recordStatus === s ? "default" : "outline"}
            onClick={() => setRecordStatus(recordStatus === s ? null : s)}
          >
            {s}
          </Button>
        ))}
        {(["offline", "sync-pending", "synced"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={connectivity === s ? "default" : "outline"}
            onClick={() => setConnectivity(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {recordStatus ? (
        <RecordStatusBanner
          status={recordStatus}
          onRestore={recordStatus === "archived" || recordStatus === "deleted" ? () => setRecordStatus(null) : undefined}
          onDeletePermanently={recordStatus === "deleted" ? () => setRecordStatus(null) : undefined}
        />
      ) : null}
      <SyncStatusBanner status={connectivity} pendingCount={3} />

      <ObjectPage
        header={
          <ObjectHeader
            icon={Users}
            name="Abby Huang"
            status={{ label: "Active", tone: "success" }}
            owner={{ name: "Priya Shah", initials: "PS" }}
            department="Engineering"
            lastUpdated="2 hours ago"
            healthIndicator={{ label: "On track", tone: "success" }}
            approvalStatus={{ label: "No pending approvals" }}
            relationshipCount={12}
            aiSummary="Abby joined 8 months ago, has completed onboarding, and has no open performance reviews."
            favorited={favorited}
            onToggleFavorite={() => setFavorited((f) => !f)}
            onShare={() => {}}
            primaryAction={{ label: "Edit", icon: Pencil }}
            secondaryActions={[
              { label: "Send message", icon: Mail },
              { label: "Remove from team", icon: UserMinus },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Tenure" value="8 mo" icon={CalendarClock} />
            <MetricCard label="Open Tasks" value="3" delta={{ value: "-2", tone: "positive" }} icon={Briefcase} />
            <MetricCard label="Direct Reports" value="0" icon={Users} />
          </>
        }
        tabs={{
          overview: <p className="text-muted-foreground text-sm">Overview content goes here.</p>,
          activity: <p className="text-muted-foreground text-sm">Activity feed goes here.</p>,
          documents: (
            <EmptyState
              title="No documents yet"
              description="Upload an employee's contract, ID, or certifications here."
            />
          ),
          timeline: <p className="text-muted-foreground text-sm">Timeline goes here.</p>,
          ai: <p className="text-muted-foreground text-sm">AI assistant panel content goes here.</p>,
          history: <p className="text-muted-foreground text-sm">Change history goes here.</p>,
        }}
      />
    </div>
  );
}
