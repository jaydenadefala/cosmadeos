"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Pencil, Route, Trash2 } from "lucide-react";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { LearningPathEditSheet } from "@/components/training/learning-path-edit-sheet";
import { useCourses } from "@/lib/mock-data/courses";
import { archiveLearningPaths, deleteLearningPath, restoreLearningPath, useLearningPaths } from "@/lib/mock-data/learning-paths";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

/** Learning Path detail page — Universal Object Layout instance; the ordered course sequence is the primary content. */
export default function LearningPathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = use(params);
  const router = useRouter();
  const allPaths = useLearningPaths();
  const courses = useCourses();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`learning-path:${pathId}`);
  const path = allPaths.find((p) => p.id === pathId);
  if (!path) {
    if (deleting) return null;
    notFound();
  }

  const orderedCourses = path.courseIds.map((id) => courses.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {path.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${path.title}" is archived.`}
          onRestore={() => {
            restoreLearningPath(path.id);
            logHistory("restored this record");
            toast.success(`"${path.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteLearningPath(path.id);
            toast.success(`"${path.title}" permanently deleted.`);
            router.push("/training/learning-paths");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Route}
            name={path.title}
            status={path.targetDepartment ? { label: path.targetDepartment } : undefined}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              {
                label: path.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (path.archived) {
                    restoreLearningPath(path.id);
                    logHistory("restored this record");
                    toast.success(`"${path.title}" was restored.`);
                  } else {
                    archiveLearningPaths([path.id]);
                    logHistory("archived this record");
                    toast.success(`"${path.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Courses" value={String(path.courseIds.length)} icon={Route} />
            <MetricCard label="Target department" value={path.targetDepartment || "Any"} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-2xl flex-col gap-4">
              <p className="text-muted-foreground text-sm">{path.description}</p>
              {orderedCourses.length === 0 ? (
                <EmptyState title="No courses in this path yet" description="Add courses from the Edit panel." />
              ) : (
                <ol className="flex flex-col gap-2">
                  {orderedCourses.map((course, i) => (
                    <li key={course.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <span className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                        {i + 1}
                      </span>
                      <div>
                        <Link href={`/training/courses/${course.id}`} className="text-sm font-medium hover:underline">
                          {course.title}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {course.category} · {course.level} · {course.lessons.length} lessons
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ),
          activity: <EntityComments entityKey={`learning-path:${path.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="training" contextLabel="this learning path" />,
          history: <RecordHistory entityKey={`learning-path:${path.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete "${path.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteLearningPath(path.id);
                toast.success(`"${path.title}" permanently deleted.`);
                router.push("/training/learning-paths");
              }}
            />
          ),
        }}
      />

      <LearningPathEditSheet path={path} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
