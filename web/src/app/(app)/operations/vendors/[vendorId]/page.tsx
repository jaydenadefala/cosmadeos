"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Building2, Copy, Pencil, Trash2 } from "lucide-react";

import { VendorEditSheet } from "@/components/operations/vendor-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useBills } from "@/lib/mock-data/bills";
import {
  archiveVendors,
  deleteVendor,
  duplicateVendor,
  restoreVendor,
  setVendorStatus,
  useVendors,
  type VendorStatus,
} from "@/lib/mock-data/vendors";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STATUS_TONE: Record<VendorStatus, ObjectHeaderTone> = {
  Active: "success",
  Inactive: "default",
};

/**
 * Vendor detail page — Universal Object Layout instance
 * (operations-operating-system.md: "Universal Object Layout applies to...
 * Vendor"). Relationships is real: the actual Bills billed to this vendor
 * (reverse lookup on Bill.vendorId), the same "Every Module Must Be
 * Connected" proof as every other cross-workspace reference this session.
 */
export default function VendorDetailPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = use(params);
  const router = useRouter();
  const allVendors = useVendors();
  const allBills = useBills();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`vendor:${vendorId}`);
  const vendor = allVendors.find((v) => v.id === vendorId);
  if (!vendor) {
    if (deleting) return null;
    notFound();
  }

  const bills = allBills.filter((b) => b.vendorId === vendor.id && !b.archived);
  const totalBilled = bills.reduce((sum, b) => sum + b.amount, 0);

  const handleDeletePermanently = () => {
    setDeleting(true);
    deleteVendor(vendor.id);
    toast.success(`${vendor.name} permanently deleted.`);
    router.push("/operations/vendors");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {vendor.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${vendor.name} is archived.`}
          onRestore={() => {
            restoreVendor(vendor.id);
            logHistory("restored this record");
            toast.success(`${vendor.name} was restored.`);
          }}
          onDeletePermanently={handleDeletePermanently}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={Building2}
            name={vendor.name}
            status={{ label: vendor.status, tone: STATUS_TONE[vendor.status] }}
            department={vendor.category}
            relationshipCount={bills.length}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", icon: Pencil, onClick: () => setEditOpen(true) }}
            secondaryActions={[
              {
                label: vendor.status === "Active" ? "Mark Inactive" : "Mark Active",
                onClick: () => {
                  const next = vendor.status === "Active" ? "Inactive" : "Active";
                  setVendorStatus(vendor.id, next);
                  logHistory(`marked this record ${next}`);
                  toast.success(`${vendor.name} marked ${next}.`);
                },
              },
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateVendor(vendor.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.name} created.`);
                    router.push(`/operations/vendors/${copy.id}`);
                  }
                },
              },
              {
                label: vendor.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (vendor.archived) {
                    restoreVendor(vendor.id);
                    logHistory("restored this record");
                    toast.success(`${vendor.name} was restored.`);
                  } else {
                    archiveVendors([vendor.id]);
                    logHistory("archived this record");
                    toast.success(`${vendor.name} was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Category" value={vendor.category} />
            <MetricCard label="Total Billed" value={`$${totalBilled.toLocaleString()}`} />
            <MetricCard label="Bills" value={String(bills.length)} />
          </>
        }
        tabs={{
          overview: (
            <dl className="grid max-w-md grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Contact</dt>
              <dd>{vendor.contactName || "—"}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{vendor.contactEmail || "—"}</dd>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{vendor.phone || "—"}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge className="border-0 font-medium">{vendor.status}</Badge>
              </dd>
              <dt className="text-muted-foreground">Notes</dt>
              <dd className="col-span-2 -mt-1">{vendor.notes || "—"}</dd>
            </dl>
          ),
          activity: <EntityComments entityKey={`vendor:${vendor.id}`} />,
          relationships:
            bills.length === 0 ? (
              <EmptyState
                title="No bills yet"
                description="Bills recorded against this vendor (Finance) will appear here."
              />
            ) : (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Bills ({bills.length})</h3>
                <ul className="flex flex-col gap-1.5">
                  {bills.map((bill) => (
                    <li key={bill.id} className="text-sm">
                      <Link href="/finance/bills" className="text-primary hover:underline">
                        {bill.billNumber}
                      </Link>
                      <span className="text-muted-foreground">
                        {" "}
                        — ${bill.amount.toLocaleString()} ({bill.status})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="operations" contextLabel="this vendor" />,
          history: <RecordHistory entityKey={`vendor:${vendor.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete ${vendor.name}?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={handleDeletePermanently}
            />
          ),
        }}
      />
      <VendorEditSheet vendor={vendor} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
