"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Briefcase, Copy, Pencil, Trash2, Users } from "lucide-react";

import { JobListingEditSheet } from "@/components/hr/job-listing-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useApplicants } from "@/lib/mock-data/applicants";
import {
  archiveJobListings,
  deleteJobListing,
  duplicateJobListing,
  restoreJobListing,
  setJobListingStatus,
  useJobListings,
  type JobListingStatus,
} from "@/lib/mock-data/job-listings";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STATUS_TONE: Record<JobListingStatus, ObjectHeaderTone> = {
  Open: "success",
  Closed: "default",
  Draft: "warning",
};

/**
 * Job Listing detail page — Universal Object Layout instance for the Job
 * Listing object. Relationships is real: the actual Applicants who applied
 * to this listing (reverse lookup on `Applicant.jobListingId`), not a
 * placeholder — the same "Every Module Must Be Connected" proof as
 * Company's Relationships tab.
 */
export default function JobListingDetailPage({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}) {
  const { jobListingId } = use(params);
  const router = useRouter();
  const allJobListings = useJobListings();
  const allApplicants = useApplicants();
  const [favorited, setFavorited] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`joblisting:${jobListingId}`);
  const jobListing = allJobListings.find((j) => j.id === jobListingId);
  if (!jobListing) {
    // See MEMORY.md: permanently deleting this record from its own detail
    // page removes it from the store reactively, racing the `router.push`
    // navigation away — without this guard it flashes a 404 instead.
    if (deleting) return null;
    notFound();
  }

  const applicants = allApplicants.filter((a) => a.jobListingId === jobListing.id && !a.archived);

  function toggleStatus() {
    if (!jobListing) return;
    const next = jobListing.status === "Open" ? "Closed" : "Open";
    setJobListingStatus(jobListing.id, next);
    logHistory(next === "Open" ? "reopened this listing" : "closed this listing");
    toast.success(`Listing ${next === "Open" ? "reopened" : "closed"}.`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {jobListing.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${jobListing.title}" is archived.`}
          onRestore={() => {
            restoreJobListing(jobListing.id);
            logHistory("restored this record");
            toast.success(`"${jobListing.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteJobListing(jobListing.id);
            toast.success(`"${jobListing.title}" permanently deleted.`);
            router.push("/hr/recruitment/job-listings");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Briefcase}
            name={jobListing.title}
            status={{ label: jobListing.status, tone: STATUS_TONE[jobListing.status] }}
            department={jobListing.department}
            lastUpdated={jobListing.postedLabel}
            relationshipCount={applicants.length}
            favorited={favorited}
            onToggleFavorite={() => setFavorited((f) => !f)}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              {
                label: jobListing.status === "Open" ? "Close listing" : "Reopen listing",
                onClick: toggleStatus,
              },
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateJobListing(jobListing.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.title} created.`);
                    router.push(`/hr/recruitment/job-listings/${copy.id}`);
                  }
                },
              },
              {
                label: jobListing.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (jobListing.archived) {
                    restoreJobListing(jobListing.id);
                    logHistory("restored this record");
                    toast.success(`"${jobListing.title}" was restored.`);
                  } else {
                    archiveJobListings([jobListing.id]);
                    logHistory("archived this record");
                    toast.success(`"${jobListing.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Applicants" value={String(applicants.length)} icon={Users} />
            <MetricCard label="Status" value={jobListing.status} icon={Briefcase} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Department</dt>
                <dd>{jobListing.department}</dd>
                <dt className="text-muted-foreground">Location</dt>
                <dd>{jobListing.location}</dd>
                <dt className="text-muted-foreground">Employment type</dt>
                <dd>{jobListing.employmentType}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge className="border-0 font-medium">{jobListing.status}</Badge>
                </dd>
                <dt className="text-muted-foreground">Posted</dt>
                <dd>{jobListing.postedLabel}</dd>
              </dl>
              <div>
                <h3 className="mb-1 text-sm font-semibold">Description</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {jobListing.description || "No description yet."}
                </p>
              </div>
            </div>
          ),
          activity: <EntityComments entityKey={`joblisting:${jobListing.id}`} />,
          relationships:
            applicants.length === 0 ? (
              <EmptyState
                title="No applicants yet"
                description="Applicants who apply to this listing will appear here."
              />
            ) : (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Applicants ({applicants.length})</h3>
                <ul className="flex flex-col gap-1.5">
                  {applicants.map((applicant) => (
                    <li key={applicant.id} className="text-sm">
                      <Link
                        href={`/hr/recruitment/applicants/${applicant.id}`}
                        className="text-primary hover:underline"
                      >
                        {applicant.name}
                      </Link>
                      <span className="text-muted-foreground"> — {applicant.stage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="hr" contextLabel="this job listing" />,
          history: <RecordHistory entityKey={`joblisting:${jobListing.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete "${jobListing.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteJobListing(jobListing.id);
                toast.success(`"${jobListing.title}" permanently deleted.`);
                router.push("/hr/recruitment/job-listings");
              }}
            />
          ),
        }}
      />
      <JobListingEditSheet jobListing={jobListing} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
