"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { BookOpen, Copy, Pencil, Trash2 } from "lucide-react";

import { PolicyDocumentEditSheet } from "@/components/hr/policy-document-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import {
  archivePolicyDocuments,
  deletePolicyDocument,
  duplicatePolicyDocument,
  restorePolicyDocument,
  usePolicyDocuments,
} from "@/lib/mock-data/policy-documents";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";

/**
 * Handbook/Policy document detail page — Universal Object Layout instance,
 * shared by both /hr/handbook and /hr/policies (same store, distinguished
 * by `docType`). Mirrors the Knowledge Article/Playbook detail pattern
 * (real Version History, Comments, full lifecycle).
 */
export default function PolicyDocumentDetailPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = use(params);
  const router = useRouter();
  const allDocuments = usePolicyDocuments();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const document = allDocuments.find((d) => d.id === docId);
  if (!document) {
    if (deleting) return null;
    notFound();
  }

  const listHref = document.docType === "Handbook" ? "/hr/handbook" : "/hr/policies";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {document.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${document.title}" is archived.`}
          onRestore={() => {
            restorePolicyDocument(document.id);
            toast.success(`"${document.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deletePolicyDocument(document.id);
            toast.success(`"${document.title}" permanently deleted.`);
            router.push(listHref);
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={BookOpen}
            name={document.title}
            status={{ label: document.docType }}
            lastUpdated={document.lastUpdatedLabel}
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
                  const copy = duplicatePolicyDocument(document.id);
                  if (copy) {
                    toast.success(`${copy.title} created.`);
                    router.push(`/hr/policy-documents/${copy.id}`);
                  }
                },
              },
              {
                label: document.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (document.archived) {
                    restorePolicyDocument(document.id);
                    toast.success(`"${document.title}" was restored.`);
                  } else {
                    archivePolicyDocuments([document.id]);
                    toast.success(`"${document.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Type" value={document.docType} icon={BookOpen} />
            <MetricCard label="Versions" value={String(document.versionHistory.length + 1)} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <p className="text-muted-foreground text-sm">{document.summary}</p>
              <p className="text-sm whitespace-pre-wrap">{document.content}</p>
            </div>
          ),
          activity: <EntityComments entityKey={`policy-document:${document.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="hr" contextLabel="this policy document" />,
          history:
            document.versionHistory.length === 0 ? (
              <EmptyState
                title="No earlier versions yet"
                description="Every time this document is edited, the previous version is kept here."
              />
            ) : (
              <div className="flex max-w-xl flex-col gap-4">
                {document.versionHistory.map((version, i) => (
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
              title={`Permanently delete "${document.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deletePolicyDocument(document.id);
                toast.success(`"${document.title}" permanently deleted.`);
                router.push(listHref);
              }}
            />
          ),
        }}
      />
      <PolicyDocumentEditSheet document={document} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
