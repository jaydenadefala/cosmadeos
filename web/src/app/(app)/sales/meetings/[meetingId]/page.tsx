"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Calendar, Copy, Pencil, Trash2, XCircle } from "lucide-react";

import { CancelMeetingDialog } from "@/components/sales/cancel-meeting-dialog";
import { MeetingEditSheet } from "@/components/sales/meeting-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { getCompanyById, useCompanies } from "@/lib/mock-data/companies";
import { useContacts } from "@/lib/mock-data/contacts";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveMeetings,
  cancelMeeting,
  deleteMeeting,
  duplicateMeeting,
  restoreMeeting,
  useMeetings,
  type MeetingStatus,
} from "@/lib/mock-data/meetings";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STATUS_TONE: Record<MeetingStatus, ObjectHeaderTone> = {
  Scheduled: "default",
  Completed: "success",
  Cancelled: "destructive",
};

/**
 * Meeting detail page — Universal Object Layout instance for the Meeting
 * object. Cancel is a Modal (per ADR-003) requiring a reason; Reschedule
 * reuses the Edit sheet since it's just the date/time field.
 */
export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const { meetingId } = use(params);
  const router = useRouter();
  const allMeetings = useMeetings();
  const allContacts = useContacts();
  const allEmployees = useEmployees();
  useCompanies();
  const [favorited, setFavorited] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`meeting:${meetingId}`);
  const meeting = allMeetings.find((m) => m.id === meetingId);
  if (!meeting) {
    // See MEMORY.md: permanently deleting this record from its own detail
    // page removes it from the store reactively, racing the `router.push`
    // navigation away — without this guard it flashes a 404 instead.
    if (deleting) return null;
    notFound();
  }

  const contact = allContacts.find((c) => c.id === meeting.contactId);
  const company = contact ? getCompanyById(contact.companyId) : undefined;
  const owner = allEmployees.find((e) => e.id === meeting.ownerId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {meeting.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${meeting.title}" is archived.`}
          onRestore={() => {
            restoreMeeting(meeting.id);
            logHistory("restored this record");
            toast.success(`"${meeting.title}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteMeeting(meeting.id);
            toast.success(`"${meeting.title}" permanently deleted.`);
            router.push("/sales/meetings");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Calendar}
            name={meeting.title}
            status={{ label: meeting.status, tone: STATUS_TONE[meeting.status] }}
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
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateMeeting(meeting.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`"${copy.title}" duplicated.`);
                    router.push(`/sales/meetings/${copy.id}`);
                  }
                },
              },
              {
                label: meeting.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (meeting.archived) {
                    restoreMeeting(meeting.id);
                    logHistory("restored this record");
                    toast.success(`"${meeting.title}" was restored.`);
                  } else {
                    archiveMeetings([meeting.id]);
                    logHistory("archived this record");
                    toast.success(`"${meeting.title}" was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Date & Time" value={meeting.dateTimeLabel} icon={Calendar} />
            <MetricCard label="Status" value={meeting.status} icon={Calendar} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-md flex-col gap-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Date &amp; time</dt>
                <dd>{meeting.dateTimeLabel}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge className="border-0 font-medium">{meeting.status}</Badge>
                </dd>
                <dt className="text-muted-foreground">Contact</dt>
                <dd>{contact?.name ?? "—"}</dd>
              </dl>
              {meeting.outcome ? (
                <div>
                  <h3 className="mb-1 text-sm font-semibold">
                    {meeting.status === "Cancelled" ? "Cancellation reason" : "Outcome"}
                  </h3>
                  <p className="text-muted-foreground text-sm">{meeting.outcome}</p>
                </div>
              ) : null}
              {meeting.status === "Scheduled" ? (
                <CancelMeetingDialog
                  trigger={
                    <Button variant="outline" size="sm" className="w-fit gap-1.5">
                      <XCircle className="size-4" />
                      Cancel meeting
                    </Button>
                  }
                  meetingTitle={meeting.title}
                  onConfirm={(reason) => {
                    cancelMeeting(meeting.id, reason);
                    logHistory("cancelled this meeting", reason);
                    toast.success(`"${meeting.title}" was cancelled.`);
                  }}
                />
              ) : null}
            </div>
          ),
          activity: <EntityComments entityKey={`meeting:${meeting.id}`} />,
          relationships: (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Contact</h3>
                {contact ? (
                  <Link
                    href={`/sales/contacts/${contact.id}`}
                    className="text-primary text-sm hover:underline"
                  >
                    {contact.name}
                  </Link>
                ) : (
                  <p className="text-muted-foreground text-sm">No contact on file.</p>
                )}
              </div>
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
            </div>
          ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="sales" contextLabel="this meeting" />,
          history: <RecordHistory entityKey={`meeting:${meeting.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete "${meeting.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteMeeting(meeting.id);
                toast.success(`"${meeting.title}" permanently deleted.`);
                router.push("/sales/meetings");
              }}
            />
          ),
        }}
      />
      <MeetingEditSheet meeting={meeting} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
