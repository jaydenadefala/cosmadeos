"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  Copy,
  Handshake,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import { CompanyEditSheet } from "@/components/sales/company-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import {
  archiveCompanies,
  deleteCompanies,
  duplicateCompany,
  restoreCompany,
  useCompanies,
  type CompanyStatus,
} from "@/lib/mock-data/companies";
import { useContacts } from "@/lib/mock-data/contacts";
import { useLeads } from "@/lib/mock-data/leads";
import { useMeetings } from "@/lib/mock-data/meetings";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STATUS_TONE: Record<CompanyStatus, ObjectHeaderTone> = {
  Customer: "success",
  Prospect: "default",
  Lost: "destructive",
};

/**
 * Company detail page — Universal Object Layout instance for the Company
 * object. Reached by clicking a row in the Companies directory. The
 * Relationships tab is real (not a placeholder): Contacts, open Leads, and
 * Meetings actually belonging to this company, demonstrating CLAUDE.md's
 * "Every Module Must Be Connected" rule.
 */
export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);
  const router = useRouter();
  const allCompanies = useCompanies();
  const allContacts = useContacts();
  const allLeads = useLeads();
  const allMeetings = useMeetings();
  const [favorited, setFavorited] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`company:${companyId}`);
  const company = allCompanies.find((c) => c.id === companyId);
  if (!company) {
    // Permanently deleting this record from its own detail page removes it
    // from `allCompanies` reactively, re-rendering this page before the
    // `router.push` navigation below finishes — without this guard, that
    // race hits `notFound()` and flashes a 404 instead of the Companies list.
    if (deleting) return null;
    notFound();
  }

  const contacts = allContacts.filter((c) => c.companyId === company.id && !c.archived);
  const leads = allLeads.filter((l) => l.companyId === company.id);
  const openLeads = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const contactIds = contacts.map((c) => c.id);
  const meetings = allMeetings.filter((m) => contactIds.includes(m.contactId));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {company.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${company.name}'s record is archived.`}
          onRestore={() => {
            restoreCompany(company.id);
            logHistory("restored this record");
            toast.success(`${company.name} was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteCompanies([company.id]);
            toast.success(`${company.name} permanently deleted.`);
            router.push("/sales/companies");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Building2}
            name={company.name}
            status={{ label: company.status, tone: STATUS_TONE[company.status] }}
            department={company.industry}
            relationshipCount={contacts.length + leads.length}
            favorited={favorited}
            onToggleFavorite={() => setFavorited((f) => !f)}
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
                  const copy = duplicateCompany(company.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.name} created.`);
                    router.push(`/sales/companies/${copy.id}`);
                  }
                },
              },
              {
                label: company.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (company.archived) {
                    restoreCompany(company.id);
                    logHistory("restored this record");
                    toast.success(`${company.name} was restored.`);
                  } else {
                    archiveCompanies([company.id]);
                    logHistory("archived this record");
                    toast.success(`${company.name} was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Contacts" value={String(contacts.length)} icon={Users} />
            <MetricCard label="Open Deals" value={String(openLeads.length)} icon={Handshake} />
            <MetricCard label="Meetings" value={String(meetings.length)} icon={Calendar} />
          </>
        }
        tabs={{
          overview: (
            <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Industry</dt>
              <dd>{company.industry}</dd>
              <dt className="text-muted-foreground">Location</dt>
              <dd>{company.location}</dd>
              <dt className="text-muted-foreground">Website</dt>
              <dd>{company.website}</dd>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{company.phone}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge className="border-0 font-medium">{company.status}</Badge>
              </dd>
            </dl>
          ),
          activity: <EntityComments entityKey={`company:${company.id}`} />,
          relationships:
            contacts.length === 0 && leads.length === 0 && meetings.length === 0 ? (
              <EmptyState
                title="Nothing related yet"
                description="Contacts, deals, and meetings for this company will appear here."
              />
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Contacts ({contacts.length})</h3>
                  {contacts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No contacts yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {contacts.map((contact) => (
                        <li key={contact.id} className="text-sm">
                          <Link
                            href="/sales/contacts"
                            className="text-primary hover:underline"
                          >
                            {contact.name}
                          </Link>
                          <span className="text-muted-foreground"> — {contact.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Deals ({leads.length})</h3>
                  {leads.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No deals yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {leads.map((lead) => (
                        <li key={lead.id} className="text-sm">
                          <Link href="/sales/leads" className="text-primary hover:underline">
                            {lead.contactName}
                          </Link>
                          <span className="text-muted-foreground">
                            {" "}
                            — ${lead.value.toLocaleString()} ({lead.stage})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Meetings ({meetings.length})</h3>
                  {meetings.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No meetings yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {meetings.map((meeting) => (
                        <li key={meeting.id} className="text-sm">
                          <Link href="/sales/meetings" className="text-primary hover:underline">
                            {meeting.title}
                          </Link>
                          <span className="text-muted-foreground"> — {meeting.dateTimeLabel}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="sales" contextLabel="this company" />,
          history: <RecordHistory entityKey={`company:${company.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete ${company.name}?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteCompanies([company.id]);
                toast.success(`${company.name} permanently deleted.`);
                router.push("/sales/companies");
              }}
            />
          ),
        }}
      />
      <CompanyEditSheet company={company} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
