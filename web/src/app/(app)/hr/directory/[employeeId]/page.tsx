"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  CalendarClock,
  Copy,
  IdCard,
  Mail,
  Pencil,
  UserMinus,
  Users,
} from "lucide-react";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { TransferDepartmentSheet } from "@/components/hr/transfer-department-sheet";
import {
  archiveEmployees,
  duplicateEmployee,
  restoreEmployee,
  setEmployeeStatus,
  useEmployee,
} from "@/lib/mock-data/employees";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STATUS_TONE: Record<string, ObjectHeaderTone> = {
  Active: "success",
  Invited: "default",
  Pending: "warning",
  Offboarding: "destructive",
};

/** Genuinely opens a print dialog for a small printable ID card — a real browser print flow, not a decorative button. */
function printIdCard(name: string, title: string, department: string, initials: string) {
  const win = window.open("", "_blank", "width=400,height=260");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${name} — ID Card</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; }
          .card { border: 1px solid #ccc; border-radius: 12px; padding: 20px; width: 300px; }
          .avatar { width: 56px; height: 56px; border-radius: 999px; background: #ede9fe; color: #6d28d9; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 20px; margin-bottom: 12px; }
          .name { font-size: 16px; font-weight: 600; }
          .meta { font-size: 13px; color: #666; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="avatar">${initials}</div>
          <div class="name">${name}</div>
          <div class="meta">${title}</div>
          <div class="meta">${department}</div>
          <div class="meta">Cosmade OS</div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

/**
 * Employee Profile — Universal Object Layout instance for the Employee
 * object (04 Enterprise Architecture/enterprise-information-architecture.md).
 * Reached by clicking a row in the Employee Directory.
 */
export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const router = useRouter();
  const employee = useEmployee(employeeId);
  const [favorited, setFavorited] = React.useState(false);
  const [transferOpen, setTransferOpen] = React.useState(false);
  const logHistory = useLogRecordHistory(`employee:${employeeId}`);

  if (!employee) notFound();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {employee.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${employee.name}'s record is archived.`}
          onRestore={() => {
            restoreEmployee(employee.id);
            logHistory("restored this record");
            toast.success(`${employee.name} was restored.`);
          }}
        />
      ) : null}
      <ObjectPage
      header={
        <ObjectHeader
          icon={Users}
          name={employee.name}
          status={{ label: employee.status, tone: STATUS_TONE[employee.status] }}
          owner={
            employee.managerName
              ? { name: employee.managerName, initials: employee.managerInitials ?? "" }
              : undefined
          }
          department={employee.department}
          lastUpdated={employee.lastUpdated}
          favorited={favorited}
          onToggleFavorite={() => setFavorited((f) => !f)}
          onShare={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast.success("Link copied to clipboard.");
          }}
          primaryAction={{ label: "Edit", icon: Pencil }}
          secondaryActions={[
            {
              label: "Send welcome email",
              icon: Mail,
              onClick: () => (window.location.href = `mailto:${employee.email}`),
            },
            {
              label: "Transfer department",
              icon: Briefcase,
              onClick: () => setTransferOpen(true),
            },
            {
              label: "Print ID card",
              icon: IdCard,
              onClick: () =>
                printIdCard(employee.name, employee.title, employee.department, employee.initials),
            },
            {
              label: "Duplicate",
              icon: Copy,
              onClick: () => {
                const copy = duplicateEmployee(employee.id);
                if (copy) {
                  logHistory("duplicated this record");
                  toast.success(`${copy.name} created.`);
                  router.push(`/hr/directory/${copy.id}`);
                }
              },
            },
            ...(employee.status !== "Offboarding"
              ? [
                  {
                    label: "Start offboarding",
                    icon: UserMinus,
                    onClick: () => {
                      setEmployeeStatus(employee.id, "Offboarding");
                      logHistory("started offboarding");
                      toast.success(`${employee.name}'s offboarding has started.`);
                    },
                  },
                ]
              : []),
          ]}
        />
      }
      summaryCards={
        <>
          <MetricCard label="Tenure" value={employee.joinedLabel} icon={CalendarClock} />
          <MetricCard label="Open Tasks" value={String(employee.openTasks)} icon={Briefcase} />
          <MetricCard label="Direct Reports" value={String(employee.directReports)} icon={Users} />
        </>
      }
      tabs={{
        overview: (
          <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{employee.email}</dd>
            <dt className="text-muted-foreground">Title</dt>
            <dd>{employee.title}</dd>
            <dt className="text-muted-foreground">Department</dt>
            <dd>{employee.department}</dd>
            <dt className="text-muted-foreground">Access</dt>
            <dd>{employee.access}</dd>
            <dt className="text-muted-foreground">Manager</dt>
            <dd>{employee.managerName ?? "—"}</dd>
          </dl>
        ),
        activity: <EntityComments entityKey={`employee:${employee.id}`} />,
        documents: (
          <EmptyState
            title="No documents yet"
            description="Upload this employee's contract, ID, or certifications here."
          />
        ),
        timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
        ai: <AIAssistantPanel contextKind="hr" contextLabel="this employee" />,
        history: <RecordHistory entityKey={`employee:${employee.id}`} />,
        settings: (
          <ConfirmationDialog
            trigger={
              <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                <UserMinus className="size-4" />
                Remove from team
              </button>
            }
            title={`Remove ${employee.name} from the team?`}
            description="This archives their record. You can restore it within 30 days before permanent deletion."
            confirmLabel="Remove"
            variant="destructive"
            onConfirm={() => {
              archiveEmployees([employee.id]);
              logHistory("archived this record");
              toast.success(`${employee.name} was archived.`);
              router.push("/hr/directory");
            }}
          />
        ),
      }}
    />
    <TransferDepartmentSheet employee={employee} open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  );
}
