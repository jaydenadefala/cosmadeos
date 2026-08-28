"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Copy, Microscope, Trash2 } from "lucide-react";

import { ResearchItemEditSheet } from "@/components/marketing/research-item-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveResearchItems,
  deleteResearchItem,
  duplicateResearchItem,
  restoreResearchItem,
  toggleResearchItemFavorite,
  useResearchItems,
} from "@/lib/mock-data/research-items";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";

/**
 * Research item detail page — Universal Object Layout instance, mirroring
 * the Knowledge Article detail page's proven shape (Version History,
 * Comments, Share, Favorite, full lifecycle).
 */
export default function ResearchItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = use(params);
  const router = useRouter();
  const allItems = useResearchItems();
  const allEmployees = useEmployees();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const item = allItems.find((a) => a.id === itemId);
  if (!item) {
    if (deleting) return null;
    notFound();
  }

  const author = allEmployees.find((e) => e.id === item.authorId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {item.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${item.title}" is archived.`}
          onRestore={() => {
            restoreResearchItem(item.id);
            toast.success(`"${item.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteResearchItem(item.id);
            toast.success(`"${item.title}" permanently deleted.`);
            router.push("/marketing/research");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Microscope}
            name={item.title}
            status={{ label: item.category }}
            owner={author ? { name: author.name, initials: author.initials } : undefined}
            lastUpdated={item.lastUpdatedLabel}
            favorited={item.favorited}
            onToggleFavorite={() => toggleResearchItemFavorite(item.id)}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", onClick: () => setEditOpen(true) }}
            secondaryActions={[
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateResearchItem(item.id);
                  if (copy) {
                    toast.success(`${copy.title} created.`);
                    router.push(`/marketing/research/${copy.id}`);
                  }
                },
              },
              {
                label: item.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (item.archived) {
                    restoreResearchItem(item.id);
                    toast.success(`"${item.title}" was restored.`);
                  } else {
                    archiveResearchItems([item.id]);
                    toast.success(`"${item.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Category" value={item.category} icon={Microscope} />
            <MetricCard label="Versions" value={String(item.versionHistory.length + 1)} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <p className="text-muted-foreground text-sm">{item.summary}</p>
              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
            </div>
          ),
          activity: <EntityComments entityKey={`research:${item.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="research" contextLabel="this research item" />,
          history:
            item.versionHistory.length === 0 ? (
              <EmptyState
                title="No earlier versions yet"
                description="Every time this item is edited, the previous version is kept here."
              />
            ) : (
              <div className="flex max-w-xl flex-col gap-4">
                {item.versionHistory.map((version, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">{version.title}</span>
                      <Badge variant="outline" className="font-normal">
                        Saved {version.savedLabel}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{version.summary}</p>
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
              title={`Permanently delete "${item.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteResearchItem(item.id);
                toast.success(`"${item.title}" permanently deleted.`);
                router.push("/marketing/research");
              }}
            />
          ),
        }}
      />
      <ResearchItemEditSheet item={item} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
