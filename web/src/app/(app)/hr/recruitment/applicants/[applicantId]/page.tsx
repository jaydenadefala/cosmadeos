"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Briefcase, Copy, Mail, Pencil, Trash2, UserCheck } from "lucide-react";

import { ApplicantEditSheet } from "@/components/hr/applicant-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import {
  APPLICANT_STAGES,
  archiveApplicants,
  deleteApplicant,
  duplicateApplicant,
  markHired,
  restoreApplicant,
  useApplicants,
  type ApplicantStage,
} from "@/lib/mock-data/applicants";
import { addEmployee, useEmployees } from "@/lib/mock-data/employees";
import { useJobListings } from "@/lib/mock-data/job-listings";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STAGE_TONE: Record<ApplicantStage, ObjectHeaderTone> = {
  new: "default",
  screening: "default",
  interview: "default",
  offer: "warning",
  hired: "success",
  rejected: "destructive",
};

/**
 * Applicant detail page — Universal Object Layout instance for the
 * Applicant object. Hire is a genuine action: it creates a real Employee
 * record (via `addEmployee`) from the applicant's name/email and the job
 * listing's title/department, then links `Applicant.employeeId` — the
 * same "write a new reference, don't just read one" pattern as Convert
 * Lead on the Sales side.
 */
export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ applicantId: string }>;
}) {
  const { applicantId } = use(params);
  const router = useRouter();
  const allApplicants = useApplicants();
  const allJobListings = useJobListings();
  const allEmployees = useEmployees();
  const [favorited, setFavorited] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`applicant:${applicantId}`);
  const applicant = allApplicants.find((a) => a.id === applicantId);
  if (!applicant) {
    // See MEMORY.md: permanently deleting this record from its own detail
    // page removes it from the store reactively, racing the `router.push`
    // navigation away — without this guard it flashes a 404 instead.
    if (deleting) return null;
    notFound();
  }

  const jobListing = allJobListings.find((j) => j.id === applicant.jobListingId);
  const stageLabel = APPLICANT_STAGES.find((s) => s.id === applicant.stage)?.label ?? applicant.stage;
  const hiredEmployee = applicant.employeeId
    ? allEmployees.find((e) => e.id === applicant.employeeId)
    : undefined;

  function handleHire() {
    if (!applicant) return;
    const employee = addEmployee({
      name: applicant.name,
      email: applicant.email,
      title: jobListing?.title ?? "New Hire",
      department: jobListing?.department ?? "Unassigned",
      access: "Employee",
    });
    markHired(applicant.id, employee.id);
    logHistory("hired this applicant", "Created an Employee record.");
    toast.success(`${applicant.name} hired — added to the Employee Directory.`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {applicant.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${applicant.name}'s application is archived.`}
          onRestore={() => {
            restoreApplicant(applicant.id);
            logHistory("restored this record");
            toast.success(`${applicant.name} was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteApplicant(applicant.id);
            toast.success(`${applicant.name} permanently deleted.`);
            router.push("/hr/recruitment/applicants");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={UserCheck}
            name={applicant.name}
            status={{ label: stageLabel, tone: STAGE_TONE[applicant.stage] }}
            department={jobListing?.title}
            favorited={favorited}
            onToggleFavorite={() => setFavorited((f) => !f)}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              ...(applicant.stage !== "hired" && applicant.stage !== "rejected"
                ? [{ label: "Hire", icon: UserCheck, onClick: handleHire }]
                : []),
              {
                label: "Send email",
                icon: Mail,
                onClick: () => (window.location.href = `mailto:${applicant.email}`),
              },
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateApplicant(applicant.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.name} duplicated.`);
                    router.push(`/hr/recruitment/applicants/${copy.id}`);
                  }
                },
              },
              {
                label: applicant.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (applicant.archived) {
                    restoreApplicant(applicant.id);
                    logHistory("restored this record");
                    toast.success(`${applicant.name} was restored.`);
                  } else {
                    archiveApplicants([applicant.id]);
                    logHistory("archived this record");
                    toast.success(`${applicant.name} was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Applied" value={applicant.appliedLabel} icon={Briefcase} />
            <MetricCard label="Stage" value={stageLabel} icon={UserCheck} />
          </>
        }
        tabs={{
          overview: (
            <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{applicant.email}</dd>
              <dt className="text-muted-foreground">Job listing</dt>
              <dd>{jobListing?.title ?? "—"}</dd>
              <dt className="text-muted-foreground">Stage</dt>
              <dd>
                <Badge className="border-0 font-medium">{stageLabel}</Badge>
              </dd>
              <dt className="text-muted-foreground">Applied</dt>
              <dd>{applicant.appliedLabel}</dd>
            </dl>
          ),
          activity: <EntityComments entityKey={`applicant:${applicant.id}`} />,
          relationships: (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Job Listing</h3>
                {jobListing ? (
                  <Link
                    href="/hr/recruitment/job-listings"
                    className="text-primary text-sm hover:underline"
                  >
                    {jobListing.title}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">No job listing on file.</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Employee Record</h3>
                {hiredEmployee ? (
                  <Link
                    href={`/hr/directory/${hiredEmployee.id}`}
                    className="text-primary text-sm hover:underline"
                  >
                    {hiredEmployee.name}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Not yet hired — use Hire to create a real Employee record.
                  </p>
                )}
              </div>
            </div>
          ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="hr" contextLabel="this applicant" />,
          history: <RecordHistory entityKey={`applicant:${applicant.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete ${applicant.name}?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteApplicant(applicant.id);
                toast.success(`${applicant.name} permanently deleted.`);
                router.push("/hr/recruitment/applicants");
              }}
            />
          ),
        }}
      />
      <ApplicantEditSheet applicant={applicant} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
