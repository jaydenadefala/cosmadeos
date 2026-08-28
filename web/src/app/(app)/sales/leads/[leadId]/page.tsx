"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Copy,
  FileText,
  Handshake,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";

import { LeadEditSheet } from "@/components/sales/lead-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useCompanies } from "@/lib/mock-data/companies";
import { addComment } from "@/lib/mock-data/comments";
import { findOrCreateContact, useContacts } from "@/lib/mock-data/contacts";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveLeads,
  convertLead,
  deleteLead,
  duplicateLead,
  restoreLead,
  LEAD_STAGES,
  useLeads,
  type LeadStage,
} from "@/lib/mock-data/leads";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STAGE_TONE: Record<LeadStage, ObjectHeaderTone> = {
  new: "default",
  contacted: "default",
  qualified: "default",
  proposal: "warning",
  won: "success",
  lost: "destructive",
};

/**
 * Lead detail page — Universal Object Layout instance for the Lead (Deal)
 * object. Convert Lead is a genuine action: it finds-or-creates a real
 * Contact record for the deal's contact person (via `findOrCreateContact`)
 * and marks the deal Won, linking `Lead.contactId` — the fifth use of the
 * referential-integrity pattern to actually WRITE a new reference, not just
 * read one.
 */
export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const allLeads = useLeads();
  const allCompanies = useCompanies();
  const allEmployees = useEmployees();
  const allContacts = useContacts();
  const [favorited, setFavorited] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`lead:${leadId}`);
  const lead = allLeads.find((l) => l.id === leadId);
  if (!lead) {
    // See MEMORY.md: permanently deleting this record from its own detail
    // page removes it from the store reactively, racing the `router.push`
    // navigation away — without this guard it flashes a 404 instead.
    if (deleting) return null;
    notFound();
  }

  const company = allCompanies.find((c) => c.id === lead.companyId);
  const owner = allEmployees.find((e) => e.id === lead.ownerId);
  const linkedContact = lead.contactId ? allContacts.find((c) => c.id === lead.contactId) : undefined;
  const stageLabel = LEAD_STAGES.find((s) => s.id === lead.stage)?.label ?? lead.stage;

  function handleConvert() {
    if (!lead) return;
    const contact = findOrCreateContact({
      name: lead.contactName,
      email: lead.email,
      companyId: lead.companyId,
    });
    convertLead(lead.id, contact.id);
    logHistory("converted this lead", "Marked Won and linked a Contact record.");
    toast.success(`${lead.contactName} converted — deal marked Won.`);
  }

  function handleCreateProposal() {
    if (!lead) return;
    addComment(
      `lead:${lead.id}`,
      session?.user?.name ?? "You",
      "YO",
      `Proposal drafted for $${lead.value.toLocaleString()}.`,
    );
    logHistory("created a proposal");
    toast.success("Proposal logged on this deal.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {lead.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${lead.contactName}'s deal is archived.`}
          onRestore={() => {
            restoreLead(lead.id);
            logHistory("restored this record");
            toast.success(`${lead.contactName}'s deal was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteLead(lead.id);
            toast.success(`${lead.contactName}'s deal permanently deleted.`);
            router.push("/sales/leads");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Handshake}
            name={lead.contactName}
            status={{ label: stageLabel, tone: STAGE_TONE[lead.stage] }}
            owner={owner ? { name: owner.name, initials: owner.initials } : undefined}
            department={company?.name}
            favorited={favorited}
            onToggleFavorite={() => setFavorited((f) => !f)}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              ...(lead.stage !== "won" && lead.stage !== "lost"
                ? [{ label: "Convert Lead", icon: Handshake, onClick: handleConvert }]
                : []),
              {
                label: "Send email",
                icon: Mail,
                onClick: () => (window.location.href = `mailto:${lead.email}`),
              },
              { label: "Create proposal", icon: FileText, onClick: handleCreateProposal },
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateLead(lead.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.contactName} deal duplicated.`);
                    router.push(`/sales/leads/${copy.id}`);
                  }
                },
              },
              {
                label: lead.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (lead.archived) {
                    restoreLead(lead.id);
                    logHistory("restored this record");
                    toast.success(`${lead.contactName}'s deal was restored.`);
                  } else {
                    archiveLeads([lead.id]);
                    logHistory("archived this record");
                    toast.success(`${lead.contactName}'s deal was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Deal Value" value={`$${lead.value.toLocaleString()}`} icon={Handshake} />
            <MetricCard label="Stage" value={stageLabel} icon={Briefcase} />
          </>
        }
        tabs={{
          overview: (
            <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{lead.email}</dd>
              <dt className="text-muted-foreground">Value</dt>
              <dd>${lead.value.toLocaleString()}</dd>
              <dt className="text-muted-foreground">Stage</dt>
              <dd>
                <Badge className="border-0 font-medium">{stageLabel}</Badge>
              </dd>
              <dt className="text-muted-foreground">Last activity</dt>
              <dd>{lead.lastActivityLabel}</dd>
            </dl>
          ),
          activity: <EntityComments entityKey={`lead:${lead.id}`} />,
          relationships: (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Company</h3>
                {company ? (
                  <Link
                    href={`/sales/companies/${company.id}`}
                    className="text-primary text-sm hover:underline"
                  >
                    {company.name}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">No company on file.</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Owner</h3>
                <p className="text-sm">{owner?.name ?? "Unassigned"}</p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Contact</h3>
                {linkedContact ? (
                  <Link
                    href={`/sales/contacts/${linkedContact.id}`}
                    className="text-primary text-sm hover:underline"
                  >
                    {linkedContact.name}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Not yet linked — use Convert Lead to create a real Contact record.
                  </p>
                )}
              </div>
            </div>
          ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="sales" contextLabel="this lead" />,
          history: <RecordHistory entityKey={`lead:${lead.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete ${lead.contactName}'s deal?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteLead(lead.id);
                toast.success(`${lead.contactName}'s deal permanently deleted.`);
                router.push("/sales/leads");
              }}
            />
          ),
        }}
      />
      <LeadEditSheet lead={lead} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
