"use client";

import * as React from "react";
import { toast } from "sonner";

import { LeadCard } from "@/components/sales/lead-card";
import { KanbanBoard } from "@/components/ui/kanban-board";
import { PageToolbar } from "@/components/ui/page-toolbar";
import { useCompanies } from "@/lib/mock-data/companies";
import { useEmployees } from "@/lib/mock-data/employees";
import { LEAD_STAGES, moveLead, useLeads, type LeadStage } from "@/lib/mock-data/leads";

/**
 * Leads — Sales workspace default landing page (ADR-002). Second real use
 * of the Board View Universal Workspace Component / KanbanBoard, proving
 * the Phase 3 framework generalizes beyond HR — the classic CRM pipeline
 * use case for Kanban.
 */
export default function LeadsPage() {
  const allLeads = useLeads();
  const employees = useEmployees();
  const companies = useCompanies();
  const [search, setSearch] = React.useState("");

  const leads = React.useMemo(() => allLeads.filter((l) => !l.archived), [allLeads]);

  const employeeById = React.useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees],
  );
  const companyById = React.useMemo(
    () => new Map(companies.map((c) => [c.id, c])),
    [companies],
  );

  const filtered = React.useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const companyName = companyById.get(l.companyId)?.name ?? "";
      return (
        l.contactName.toLowerCase().includes(q) || companyName.toLowerCase().includes(q)
      );
    });
  }, [leads, search, companyById]);

  function handleMove(leadId: string, toColumnId: string) {
    const stage = toColumnId as LeadStage;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === stage) return;

    moveLead(leadId, stage);
    const stageLabel = LEAD_STAGES.find((s) => s.id === stage)?.label ?? stage;
    toast.success(`${lead.contactName} moved to ${stageLabel}.`);
  }

  const pipelineValue = filtered
    .filter((l) => l.stage !== "won" && l.stage !== "lost")
    .reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Leads</h1>
        <p className="text-muted-foreground text-sm">
          {filtered.length} lead{filtered.length === 1 ? "" : "s"} · $
          {pipelineValue.toLocaleString()} in open pipeline
        </p>
      </div>

      <PageToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leads…"
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        <KanbanBoard
          id="leads-board"
          columns={LEAD_STAGES.map((s) => ({ id: s.id, label: s.label }))}
          items={filtered}
          getColumnId={(lead) => lead.stage}
          onMove={handleMove}
          renderCard={(lead) => {
            const owner = employeeById.get(lead.ownerId);
            const company = companyById.get(lead.companyId);
            return (
              <LeadCard
                lead={lead}
                companyName={company?.name ?? "Unknown company"}
                ownerName={owner?.name ?? "Unassigned"}
                ownerInitials={owner?.initials ?? "?"}
              />
            );
          }}
        />
      </div>
    </div>
  );
}
