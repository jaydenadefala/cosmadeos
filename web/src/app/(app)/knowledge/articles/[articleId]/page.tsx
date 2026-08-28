"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { BookOpen, Copy, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useEmployees } from "@/lib/mock-data/employees";
import { useMeetings } from "@/lib/mock-data/meetings";
import {
  archiveKnowledgeBaseEntries,
  deleteKnowledgeBaseEntry,
  duplicateKnowledgeBaseEntry,
  restoreKnowledgeBaseEntry,
  toggleKnowledgeBaseFavorite,
  useKnowledgeBaseEntries,
  type KnowledgeBaseSection,
} from "@/lib/mock-data/knowledge-base";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";

const SECTION_ROUTE: Record<KnowledgeBaseSection, string> = {
  Template: "/knowledge/templates",
  "Meeting Notes": "/knowledge/meeting-notes",
  "Lessons Learned": "/knowledge/lessons-learned",
  "Best Practice": "/knowledge/best-practices",
};

/**
 * Knowledge Base entry detail page — Universal Object Layout instance for
 * the "Knowledge Article" object (05 Department Operating Systems/Knowledge/
 * knowledge-operating-system.md: "Universal Object Layout applies to the
 * Knowledge Article object"). Edit routes to the New Page editor rather than
 * a Sheet, consistent with this workspace's explicit New Page requirement.
 */
export default function KnowledgeBaseEntryDetailPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = use(params);
  const router = useRouter();
  const allEntries = useKnowledgeBaseEntries();
  const allEmployees = useEmployees();
  const allMeetings = useMeetings();
  const [deleting, setDeleting] = React.useState(false);

  const entry = allEntries.find((e) => e.id === articleId);
  if (!entry) {
    if (deleting) return null;
    notFound();
  }

  const author = allEmployees.find((e) => e.id === entry.authorId);
  const relatedMeeting = entry.relatedMeetingId ? allMeetings.find((m) => m.id === entry.relatedMeetingId) : undefined;
  const listRoute = SECTION_ROUTE[entry.section];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {entry.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${entry.title}" is archived.`}
          onRestore={() => {
            restoreKnowledgeBaseEntry(entry.id);
            toast.success(`"${entry.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteKnowledgeBaseEntry(entry.id);
            toast.success(`"${entry.title}" permanently deleted.`);
            router.push(listRoute);
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={BookOpen}
            name={entry.title}
            status={{ label: entry.section }}
            owner={author ? { name: author.name, initials: author.initials } : undefined}
            lastUpdated={entry.lastUpdatedLabel}
            favorited={entry.favorited}
            onToggleFavorite={() => toggleKnowledgeBaseFavorite(entry.id)}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => router.push(`/knowledge/articles/${entry.id}/edit`) }}
            secondaryActions={[
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateKnowledgeBaseEntry(entry.id);
                  if (copy) {
                    toast.success(`${copy.title} created.`);
                    router.push(`/knowledge/articles/${copy.id}`);
                  }
                },
              },
              {
                label: entry.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (entry.archived) {
                    restoreKnowledgeBaseEntry(entry.id);
                    toast.success(`"${entry.title}" was restored.`);
                  } else {
                    archiveKnowledgeBaseEntries([entry.id]);
                    toast.success(`"${entry.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Section" value={entry.section} icon={BookOpen} />
            <MetricCard label="Category" value={entry.category} icon={BookOpen} />
            <MetricCard label="Versions" value={String(entry.versionHistory.length + 1)} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <p className="text-muted-foreground text-sm">{entry.summary}</p>
              <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
              {relatedMeeting ? (
                <div className="rounded-lg border p-3">
                  <span className="text-muted-foreground text-xs">Related meeting</span>
                  <div>
                    <Link href="/sales/meetings" className="text-sm font-medium hover:underline">
                      {relatedMeeting.title}
                    </Link>
                    <span className="text-muted-foreground ml-2 text-xs">{relatedMeeting.dateTimeLabel}</span>
                  </div>
                </div>
              ) : null}
            </div>
          ),
          activity: <EntityComments entityKey={`knowledge-base:${entry.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="knowledge" contextLabel="this article" />,
          history:
            entry.versionHistory.length === 0 ? (
              <EmptyState
                title="No earlier versions yet"
                description="Every time this entry is edited, the previous version is kept here."
              />
            ) : (
              <div className="flex max-w-xl flex-col gap-4">
                {entry.versionHistory.map((version, i) => (
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
              title={`Permanently delete "${entry.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteKnowledgeBaseEntry(entry.id);
                toast.success(`"${entry.title}" permanently deleted.`);
                router.push(listRoute);
              }}
            />
          ),
        }}
      />
    </div>
  );
}
