"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { BookOpen, Copy, Pencil, Trash2 } from "lucide-react";

import { KnowledgeArticleEditSheet } from "@/components/sales/knowledge-article-edit-sheet";
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
  archiveKnowledgeArticles,
  deleteKnowledgeArticle,
  duplicateKnowledgeArticle,
  restoreKnowledgeArticle,
  toggleArticleFavorite,
  useKnowledgeArticles,
} from "@/lib/mock-data/knowledge-articles";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";

/**
 * Knowledge Article detail page — Universal Object Layout instance,
 * mirroring the Playbook detail page's proven shape (real Version History,
 * Comments, Share, Favorite, full lifecycle) for the Sales workspace's
 * distinct "Knowledge" sidebar item (reference material, not process
 * guides — see knowledge-articles.ts for the distinction from Playbooks).
 */
export default function KnowledgeArticleDetailPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = use(params);
  const router = useRouter();
  const allArticles = useKnowledgeArticles();
  const allEmployees = useEmployees();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const article = allArticles.find((a) => a.id === articleId);
  if (!article) {
    // See MEMORY.md: permanently deleting this record from its own detail
    // page removes it from the store reactively, racing the `router.push`
    // navigation away — without this guard it flashes a 404 instead.
    if (deleting) return null;
    notFound();
  }

  const author = allEmployees.find((e) => e.id === article.authorId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {article.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${article.title}" is archived.`}
          onRestore={() => {
            restoreKnowledgeArticle(article.id);
            toast.success(`"${article.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteKnowledgeArticle(article.id);
            toast.success(`"${article.title}" permanently deleted.`);
            router.push("/sales/knowledge");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={BookOpen}
            name={article.title}
            status={{ label: article.category }}
            owner={author ? { name: author.name, initials: author.initials } : undefined}
            lastUpdated={article.lastUpdatedLabel}
            favorited={article.favorited}
            onToggleFavorite={() => toggleArticleFavorite(article.id)}
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
                  const copy = duplicateKnowledgeArticle(article.id);
                  if (copy) {
                    toast.success(`${copy.title} created.`);
                    router.push(`/sales/knowledge/${copy.id}`);
                  }
                },
              },
              {
                label: article.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (article.archived) {
                    restoreKnowledgeArticle(article.id);
                    toast.success(`"${article.title}" was restored.`);
                  } else {
                    archiveKnowledgeArticles([article.id]);
                    toast.success(`"${article.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Category" value={article.category} icon={BookOpen} />
            <MetricCard
              label="Versions"
              value={String(article.versionHistory.length + 1)}
              icon={BookOpen}
            />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <p className="text-muted-foreground text-sm">{article.summary}</p>
              <p className="text-sm whitespace-pre-wrap">{article.content}</p>
            </div>
          ),
          activity: <EntityComments entityKey={`knowledge:${article.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="knowledge" contextLabel="this article" />,
          history:
            article.versionHistory.length === 0 ? (
              <EmptyState
                title="No earlier versions yet"
                description="Every time this article is edited, the previous version is kept here."
              />
            ) : (
              <div className="flex max-w-xl flex-col gap-4">
                {article.versionHistory.map((version, i) => (
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
              title={`Permanently delete "${article.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteKnowledgeArticle(article.id);
                toast.success(`"${article.title}" permanently deleted.`);
                router.push("/sales/knowledge");
              }}
            />
          ),
        }}
      />
      <KnowledgeArticleEditSheet article={article} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
