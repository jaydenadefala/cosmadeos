"use client";

import * as React from "react";
import { toast } from "sonner";

import { ApplicantCard } from "@/components/hr/applicant-card";
import { KanbanBoard } from "@/components/ui/kanban-board";
import { PageToolbar } from "@/components/ui/page-toolbar";
import {
  APPLICANT_STAGES,
  moveApplicant,
  useApplicants,
  type ApplicantStage,
} from "@/lib/mock-data/applicants";
import { useJobListings } from "@/lib/mock-data/job-listings";

/**
 * Applicants — Recruitment sidebar group (05 Department Operating Systems/HR).
 * First real use of the Board View Universal Workspace Component
 * (04 Enterprise Architecture/enterprise-information-architecture.md).
 */
export default function ApplicantsPage() {
  const allApplicants = useApplicants();
  const jobListings = useJobListings();
  const [search, setSearch] = React.useState("");

  const applicants = React.useMemo(() => allApplicants.filter((a) => !a.archived), [allApplicants]);

  const titleById = React.useMemo(
    () => new Map(jobListings.map((j) => [j.id, j.title])),
    [jobListings],
  );

  const filtered = React.useMemo(() => {
    if (!search.trim()) return applicants;
    const q = search.trim().toLowerCase();
    return applicants.filter((a) => {
      const roleTitle = titleById.get(a.jobListingId) ?? "";
      return a.name.toLowerCase().includes(q) || roleTitle.toLowerCase().includes(q);
    });
  }, [applicants, search, titleById]);

  function handleMove(applicantId: string, toColumnId: string) {
    const stage = toColumnId as ApplicantStage;
    const applicant = applicants.find((a) => a.id === applicantId);
    if (!applicant || applicant.stage === stage) return;

    moveApplicant(applicantId, stage);
    const stageLabel = APPLICANT_STAGES.find((s) => s.id === stage)?.label ?? stage;
    toast.success(`${applicant.name} moved to ${stageLabel}.`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Applicants</h1>
        <p className="text-muted-foreground text-sm">
          {applicants.length} applicant{applicants.length === 1 ? "" : "s"} across the pipeline
        </p>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applicants…"
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        <KanbanBoard
          columns={APPLICANT_STAGES.map((s) => ({ id: s.id, label: s.label }))}
          items={filtered}
          getColumnId={(applicant) => applicant.stage}
          onMove={handleMove}
          renderCard={(applicant) => (
            <ApplicantCard
              applicant={applicant}
              roleTitle={titleById.get(applicant.jobListingId) ?? "Unknown role"}
            />
          )}
        />
      </div>
    </div>
  );
}
