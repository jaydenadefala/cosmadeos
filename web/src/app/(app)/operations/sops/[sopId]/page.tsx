"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { BookOpen, Copy, Pencil, Trash2 } from "lucide-react";

import { SopEditSheet } from "@/components/operations/sop-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import {
  archiveSopDocuments,
  deleteSopDocument,
  duplicateSopDocument,
  restoreSopDocument,
  useSopDocuments,
} from "@/lib/mock-data/sop-documents";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";

/** SOP detail page — Universal Object Layout instance, mirroring the Playbook/Policy-Document detail pattern (real Version History, Comments, full lifecycle). */
export default function SopDetailPage({ params }: { params: Promise<{ sopId: string }> }) {
  const { sopId } = use(params);
  const router = useRouter();
  const allSops = useSopDocuments();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const sop = allSops.find((s) => s.id === sopId);
  if (!sop) {
    if (deleting) return null;
    notFound();
  }

  const handleDeletePermanently = () => {
    setDeleting(true);
    deleteSopDocument(sop.id);
    toast.success(`"${sop.title}" permanently deleted.`);
    router.push("/operations/sops");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {sop.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${sop.title}" is archived.`}
          onRestore={() => {
            restoreSopDocument(sop.id);
            toast.success(`"${sop.title}" was restored.`);
          }}
          onDeletePermanently={handleDeletePermanently}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={BookOpen}
            name={sop.title}
            status={{ label: sop.category }}
            lastUpdated={sop.lastUpdatedLabel}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateSopDocument(sop.id);
                  if (copy) {
                    toast.success(`${copy.title} created.`);
                    router.push(`/operations/sops/${copy.id}`);
                  }
                },
              },
              {
                label: sop.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (sop.archived) {
                    restoreSopDocument(sop.id);
                    toast.success(`"${sop.title}" was restored.`);
                  } else {
                    archiveSopDocuments([sop.id]);
                    toast.success(`"${sop.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Category" value={sop.category} icon={BookOpen} />
            <MetricCard label="Versions" value={String(sop.versionHistory.length + 1)} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <p className="text-muted-foreground text-sm">{sop.summary}</p>
              <p className="text-sm whitespace-pre-wrap">{sop.content}</p>
            </div>
          ),
          activity: <EntityComments entityKey={`sop:${sop.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="operations" contextLabel="this SOP" />,
          history:
            sop.versionHistory.length === 0 ? (
              <EmptyState
                title="No earlier versions yet"
                description="Every time this SOP is edited, the previous version is kept here."
              />
            ) : (
              <div className="flex max-w-xl flex-col gap-4">
                {sop.versionHistory.map((version, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">{version.title}</span>
                      <Badge variant="outline" className="font-normal">
                        Saved {version.savedLabel}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{version.content}</p>
                  </div>
                ))}
              </div>
            ),
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete "${sop.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={handleDeletePermanently}
            />
          ),
        }}
      />
      <SopEditSheet sop={sop} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
