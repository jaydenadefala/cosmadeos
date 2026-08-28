"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { BookOpen, Copy, ListChecks, Pencil, Trash2 } from "lucide-react";

import { PlaybookEditSheet } from "@/components/sales/playbook-edit-sheet";
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
  archivePlaybooks,
  deletePlaybook,
  duplicatePlaybook,
  restorePlaybook,
  toggleFavorite,
  usePlaybooks,
} from "@/lib/mock-data/playbooks";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";

/**
 * Playbook detail page — Universal Object Layout instance for the Playbook
 * object (Knowledge-adjacent content). History is real: every edit pushes
 * the previous title/summary/steps onto `versionHistory`, so this tab shows
 * genuine prior versions instead of a placeholder.
 */
export default function PlaybookDetailPage({
  params,
}: {
  params: Promise<{ playbookId: string }>;
}) {
  const { playbookId } = use(params);
  const router = useRouter();
  const allPlaybooks = usePlaybooks();
  const allEmployees = useEmployees();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const playbook = allPlaybooks.find((p) => p.id === playbookId);
  if (!playbook) {
    // See MEMORY.md: permanently deleting this record from its own detail
    // page removes it from the store reactively, racing the `router.push`
    // navigation away — without this guard it flashes a 404 instead.
    if (deleting) return null;
    notFound();
  }

  const author = allEmployees.find((e) => e.id === playbook.authorId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {playbook.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${playbook.title}" is archived.`}
          onRestore={() => {
            restorePlaybook(playbook.id);
            toast.success(`"${playbook.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deletePlaybook(playbook.id);
            toast.success(`"${playbook.title}" permanently deleted.`);
            router.push("/sales/playbooks");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={BookOpen}
            name={playbook.title}
            status={{ label: playbook.category }}
            owner={author ? { name: author.name, initials: author.initials } : undefined}
            lastUpdated={playbook.lastUpdatedLabel}
            favorited={playbook.favorited}
            onToggleFavorite={() => toggleFavorite(playbook.id)}
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
                  const copy = duplicatePlaybook(playbook.id);
                  if (copy) {
                    toast.success(`${copy.title} created.`);
                    router.push(`/sales/playbooks/${copy.id}`);
                  }
                },
              },
              {
                label: playbook.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (playbook.archived) {
                    restorePlaybook(playbook.id);
                    toast.success(`"${playbook.title}" was restored.`);
                  } else {
                    archivePlaybooks([playbook.id]);
                    toast.success(`"${playbook.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Steps" value={String(playbook.steps.length)} icon={ListChecks} />
            <MetricCard
              label="Versions"
              value={String(playbook.versionHistory.length + 1)}
              icon={BookOpen}
            />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <p className="text-muted-foreground text-sm">{playbook.summary}</p>
              <ol className="flex flex-col gap-2">
                {playbook.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground font-medium">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ),
          activity: <EntityComments entityKey={`playbook:${playbook.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="sales" contextLabel="this playbook" />,
          history:
            playbook.versionHistory.length === 0 ? (
              <EmptyState
                title="No earlier versions yet"
                description="Every time this playbook is edited, the previous version is kept here."
              />
            ) : (
              <div className="flex max-w-xl flex-col gap-4">
                {playbook.versionHistory.map((version, i) => (
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
              title={`Permanently delete "${playbook.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deletePlaybook(playbook.id);
                toast.success(`"${playbook.title}" permanently deleted.`);
                router.push("/sales/playbooks");
              }}
            />
          ),
        }}
      />
      <PlaybookEditSheet playbook={playbook} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
