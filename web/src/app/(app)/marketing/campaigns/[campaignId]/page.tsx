"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Copy,
  Megaphone,
  Pause,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";

import { CampaignEditSheet } from "@/components/marketing/campaign-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import {
  approveCampaign,
  archiveCampaigns,
  deleteCampaign,
  duplicateCampaign,
  formatDate,
  restoreCampaign,
  setCampaignStatus,
  useCampaigns,
  type CampaignStatus,
} from "@/lib/mock-data/campaigns";
import { useCreativeAssets } from "@/lib/mock-data/creative-assets";
import { useEmployees } from "@/lib/mock-data/employees";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STATUS_TONE: Record<CampaignStatus, ObjectHeaderTone> = {
  Draft: "default",
  Active: "success",
  Paused: "warning",
  Completed: "default",
};

/**
 * Campaign detail page — Universal Object Layout instance for the Campaign
 * object (05 Department Operating Systems/Marketing/marketing-operating-
 * system.md). Approve/Pause/Resume/Mark Complete map directly to CLAUDE.md's
 * Marketing action set (Approve Campaign, Pause Campaign); Assign Designer
 * lives in the edit sheet alongside the rest of the editable fields.
 */
export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = use(params);
  const router = useRouter();
  const allCampaigns = useCampaigns();
  const employees = useEmployees();
  const allAssets = useCreativeAssets();
  const [favorited, setFavorited] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`campaign:${campaignId}`);
  const campaign = allCampaigns.find((c) => c.id === campaignId);
  if (!campaign) {
    // See CompanyDetailPage precedent — permanent delete from this page
    // races the redirect, so this guard avoids a false 404 flash.
    if (deleting) return null;
    notFound();
  }

  const designer = campaign.designerId ? employees.find((e) => e.id === campaign.designerId) : undefined;
  const linkedAssets = allAssets.filter((a) => a.campaignId === campaign.id && !a.archived);

  const handleDeletePermanently = () => {
    setDeleting(true);
    deleteCampaign(campaign.id);
    toast.success(`${campaign.name} permanently deleted.`);
    router.push("/marketing/campaigns");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {campaign.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${campaign.name}'s record is archived.`}
          onRestore={() => {
            restoreCampaign(campaign.id);
            logHistory("restored this record");
            toast.success(`${campaign.name} was restored.`);
          }}
          onDeletePermanently={handleDeletePermanently}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Megaphone}
            name={campaign.name}
            status={{ label: campaign.status, tone: STATUS_TONE[campaign.status] }}
            owner={designer ? { name: designer.name, initials: designer.initials } : undefined}
            department={campaign.channel}
            lastUpdated={campaign.lastUpdatedLabel}
            approvalStatus={{
              label: campaign.approvalStatus,
              tone: campaign.approvalStatus === "Approved" ? "success" : "warning",
            }}
            favorited={favorited}
            onToggleFavorite={() => setFavorited((f) => !f)}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              ...(campaign.approvalStatus === "Pending"
                ? [
                    {
                      label: "Approve Campaign",
                      icon: BadgeCheck,
                      onClick: () => {
                        approveCampaign(campaign.id);
                        logHistory("approved this campaign");
                        toast.success(`${campaign.name} approved.`);
                      },
                    },
                  ]
                : []),
              ...(campaign.status === "Active"
                ? [
                    {
                      label: "Pause Campaign",
                      icon: Pause,
                      onClick: () => {
                        setCampaignStatus(campaign.id, "Paused");
                        logHistory("paused this campaign");
                        toast.success(`${campaign.name} paused.`);
                      },
                    },
                  ]
                : []),
              ...(campaign.status === "Paused" || campaign.status === "Draft"
                ? [
                    {
                      label: "Activate Campaign",
                      icon: Play,
                      onClick: () => {
                        setCampaignStatus(campaign.id, "Active");
                        logHistory("activated this campaign");
                        toast.success(`${campaign.name} is now active.`);
                      },
                    },
                  ]
                : []),
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateCampaign(campaign.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.name} created.`);
                    router.push(`/marketing/campaigns/${copy.id}`);
                  }
                },
              },
              {
                label: campaign.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (campaign.archived) {
                    restoreCampaign(campaign.id);
                    logHistory("restored this record");
                    toast.success(`${campaign.name} was restored.`);
                  } else {
                    archiveCampaigns([campaign.id]);
                    logHistory("archived this record");
                    toast.success(`${campaign.name} was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Budget" value={`$${campaign.budget.toLocaleString()}`} />
            <MetricCard label="Channel" value={campaign.channel} />
            <MetricCard
              label="Runs"
              value={
                campaign.startDate
                  ? `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`
                  : "Not scheduled"
              }
            />
            <MetricCard label="Creative Assets" value={String(linkedAssets.length)} />
          </>
        }
        tabs={{
          overview: (
            <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Objective</dt>
              <dd className="col-span-2 -mt-1">{campaign.objective}</dd>
              <dt className="text-muted-foreground">Description</dt>
              <dd className="col-span-2 -mt-1">{campaign.description || "—"}</dd>
              <dt className="text-muted-foreground">Channel</dt>
              <dd>{campaign.channel}</dd>
              <dt className="text-muted-foreground">Budget</dt>
              <dd>${campaign.budget.toLocaleString()}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge className="border-0 font-medium">{campaign.status}</Badge>
              </dd>
              <dt className="text-muted-foreground">Approval</dt>
              <dd>{campaign.approvalStatus}</dd>
            </dl>
          ),
          activity: <EntityComments entityKey={`campaign:${campaign.id}`} />,
          relationships:
            linkedAssets.length === 0 ? (
              <EmptyState
                title="No linked records yet"
                description="Link a creative asset to this campaign from the Creative Library to see it here. Related content and leads will appear here as Content Calendar is built out."
              />
            ) : (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Creative Assets ({linkedAssets.length})</h3>
                <ul className="flex flex-col gap-1.5">
                  {linkedAssets.map((asset) => (
                    <li key={asset.id} className="text-sm">
                      <Link href="/marketing/creative-library" className="text-primary hover:underline">
                        {asset.name}
                      </Link>
                      <span className="text-muted-foreground"> — {asset.assetType}, {asset.sizeLabel}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="marketing" contextLabel="this campaign" />,
          history: <RecordHistory entityKey={`campaign:${campaign.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete ${campaign.name}?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={handleDeletePermanently}
            />
          ),
        }}
      />
      <CampaignEditSheet campaign={campaign} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
