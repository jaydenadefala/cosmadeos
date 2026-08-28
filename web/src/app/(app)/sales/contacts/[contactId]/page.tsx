"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Calendar, Copy, Pencil, Trash2, UserCircle } from "lucide-react";

import { ContactEditSheet } from "@/components/sales/contact-edit-sheet";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useCompanies } from "@/lib/mock-data/companies";
import {
  archiveContacts,
  deleteContact,
  duplicateContact,
  restoreContact,
  useContacts,
} from "@/lib/mock-data/contacts";
import { useMeetings } from "@/lib/mock-data/meetings";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

/**
 * Contact detail page — Universal Object Layout instance for the Contact
 * object. Reached by clicking a row in the Contacts directory. Relationships
 * shows the real Company this contact belongs to and their real Meetings.
 */
export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = use(params);
  const router = useRouter();
  const allContacts = useContacts();
  const allCompanies = useCompanies();
  const allMeetings = useMeetings();
  const [favorited, setFavorited] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`contact:${contactId}`);
  const contact = allContacts.find((c) => c.id === contactId);
  if (!contact) {
    // See MEMORY.md: permanently deleting this record from its own detail
    // page removes it from the store reactively, racing the `router.push`
    // navigation away — without this guard it flashes a 404 instead.
    if (deleting) return null;
    notFound();
  }

  const company = allCompanies.find((c) => c.id === contact.companyId);
  const meetings = allMeetings.filter((m) => m.contactId === contact.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {contact.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${contact.name}'s record is archived.`}
          onRestore={() => {
            restoreContact(contact.id);
            logHistory("restored this record");
            toast.success(`${contact.name} was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteContact(contact.id);
            toast.success(`${contact.name} permanently deleted.`);
            router.push("/sales/contacts");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={UserCircle}
            name={contact.name}
            department={company?.name}
            relationshipCount={meetings.length + (company ? 1 : 0)}
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
                  const copy = duplicateContact(contact.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.name} created.`);
                    router.push(`/sales/contacts/${copy.id}`);
                  }
                },
              },
              {
                label: contact.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (contact.archived) {
                    restoreContact(contact.id);
                    logHistory("restored this record");
                    toast.success(`${contact.name} was restored.`);
                  } else {
                    archiveContacts([contact.id]);
                    logHistory("archived this record");
                    toast.success(`${contact.name} was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Title" value={contact.title} icon={UserCircle} />
            <MetricCard label="Meetings" value={String(meetings.length)} icon={Calendar} />
          </>
        }
        tabs={{
          overview: (
            <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Title</dt>
              <dd>{contact.title}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{contact.email}</dd>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{contact.phone}</dd>
              <dt className="text-muted-foreground">Company</dt>
              <dd>
                {company ? (
                  <Link href={`/sales/companies/${company.id}`} className="text-primary hover:underline">
                    {company.name}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </dl>
          ),
          activity: <EntityComments entityKey={`contact:${contact.id}`} />,
          relationships:
            !company && meetings.length === 0 ? (
              <EmptyState
                title="Nothing related yet"
                description="This contact's company and meetings will appear here."
              />
            ) : (
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
          ai: <AIAssistantPanel contextKind="sales" contextLabel="this contact" />,
          history: <RecordHistory entityKey={`contact:${contact.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete ${contact.name}?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteContact(contact.id);
                toast.success(`${contact.name} permanently deleted.`);
                router.push("/sales/contacts");
              }}
            />
          ),
        }}
      />
      <ContactEditSheet contact={contact} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
