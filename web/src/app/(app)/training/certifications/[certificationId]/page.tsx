"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Award, Download, Trash2 } from "lucide-react";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useCourses } from "@/lib/mock-data/courses";
import { useEmployees } from "@/lib/mock-data/employees";
import { deleteCertification, restoreCertification, revokeCertificate, useCertifications } from "@/lib/mock-data/certifications";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

function downloadCertificate(certificateNumber: string, employeeName: string, courseTitle: string, issuedDate: string, expiryDate: string | undefined, status: string) {
  const content = `COSMADE MEDICAL — CERTIFICATE OF COMPLETION\n\nCertificate No: ${certificateNumber}\nAwarded to: ${employeeName}\nCourse: ${courseTitle}\nIssued: ${issuedDate}${expiryDate ? `\nExpires: ${expiryDate}` : ""}\nStatus: ${status}\n`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${certificateNumber}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Certification detail page — Universal Object Layout instance. */
export default function CertificationDetailPage({ params }: { params: Promise<{ certificationId: string }> }) {
  const { certificationId } = use(params);
  const router = useRouter();
  const allCertifications = useCertifications();
  const employees = useEmployees();
  const courses = useCourses();
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`certification:${certificationId}`);
  const cert = allCertifications.find((c) => c.id === certificationId);
  if (!cert) {
    if (deleting) return null;
    notFound();
  }

  const employee = employees.find((e) => e.id === cert.employeeId);
  const course = courses.find((c) => c.id === cert.courseId);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {cert.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${cert.certificateNumber}" is archived.`}
          onRestore={() => {
            restoreCertification(cert.id);
            logHistory("restored this record");
            toast.success(`"${cert.certificateNumber}" was restored.`);
          }}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteCertification(cert.id);
            toast.success(`"${cert.certificateNumber}" permanently deleted.`);
            router.push("/training/certifications");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Award}
            name={cert.certificateNumber}
            status={{ label: cert.status }}
            owner={employee ? { name: employee.name, initials: employee.initials } : undefined}
            primaryAction={{
              label: "Download Certificate",
              icon: Download,
              onClick: () =>
                downloadCertificate(cert.certificateNumber, employee?.name ?? "—", course?.title ?? "—", cert.issuedDate, cert.expiryDate, cert.status),
            }}
            secondaryActions={
              cert.status === "Active"
                ? [
                    {
                      label: "Mark Expired",
                      onClick: () => {
                        revokeCertificate(cert.id);
                        logHistory("marked this certificate Expired");
                        toast.success(`"${cert.certificateNumber}" marked Expired.`);
                      },
                    },
                  ]
                : []
            }
          />
        }
        summaryCards={
          <>
            <MetricCard label="Issued" value={cert.issuedDate} />
            <MetricCard label="Expires" value={cert.expiryDate ?? "No expiry"} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-3 text-sm">
              <p>
                Course:{" "}
                {course ? (
                  <Link href={`/training/courses/${course.id}`} className="font-medium hover:underline">
                    {course.title}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
              <p>Awarded to: <span className="font-medium">{employee?.name ?? "—"}</span></p>
            </div>
          ),
          activity: <EntityComments entityKey={`certification:${cert.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="training" contextLabel="this certification" />,
          history: <RecordHistory entityKey={`certification:${cert.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete "${cert.certificateNumber}"?`}
              description="This cannot be undone."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteCertification(cert.id);
                toast.success(`"${cert.certificateNumber}" permanently deleted.`);
                router.push("/training/certifications");
              }}
            />
          ),
        }}
      />
    </div>
  );
}
