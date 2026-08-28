"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { Copy, FileText, Trash2 } from "lucide-react";

import { InvoiceEditSheet } from "@/components/finance/invoice-edit-sheet";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EntityComments } from "@/components/ui/entity-comments";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader, type ObjectHeaderTone } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
import { useCompanies } from "@/lib/mock-data/companies";
import {
  archiveInvoices,
  deleteInvoice,
  duplicateInvoice,
  invoiceTotal,
  recordPayment,
  restoreInvoice,
  sendInvoice,
  useInvoices,
  voidInvoice,
  type InvoiceStatus,
} from "@/lib/mock-data/invoices";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

const STATUS_TONE: Record<InvoiceStatus, ObjectHeaderTone> = {
  Draft: "default",
  Sent: "default",
  Paid: "success",
  Overdue: "destructive",
  Void: "default",
};

/**
 * Invoice detail page — Universal Object Layout instance
 * (finance-operating-system.md: "Universal Object Layout applies to the
 * Invoice object"). Relationships shows the real linked Company.
 */
export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = use(params);
  const router = useRouter();
  const allInvoices = useInvoices();
  const companies = useCompanies();
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`invoice:${invoiceId}`);
  const invoice = allInvoices.find((i) => i.id === invoiceId);
  if (!invoice) {
    if (deleting) return null;
    notFound();
  }

  const company = companies.find((c) => c.id === invoice.companyId);
  const total = invoiceTotal(invoice);

  const handleDeletePermanently = () => {
    setDeleting(true);
    deleteInvoice(invoice.id);
    toast.success(`${invoice.invoiceNumber} permanently deleted.`);
    router.push("/finance/invoices");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {invoice.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`${invoice.invoiceNumber} is archived.`}
          onRestore={() => {
            restoreInvoice(invoice.id);
            logHistory("restored this record");
            toast.success(`${invoice.invoiceNumber} was restored.`);
          }}
          onDeletePermanently={handleDeletePermanently}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={FileText}
            name={invoice.invoiceNumber}
            status={{ label: invoice.status, tone: STATUS_TONE[invoice.status] }}
            department={company?.name}
            relationshipCount={company ? 1 : 0}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Edit", onClick: () => setEditOpen(true) }}
            secondaryActions={[
              ...(invoice.status === "Draft"
                ? [
                    {
                      label: "Send",
                      onClick: () => {
                        sendInvoice(invoice.id);
                        logHistory("sent this invoice");
                        toast.success(`${invoice.invoiceNumber} sent.`);
                      },
                    },
                  ]
                : []),
              ...(invoice.status === "Sent" || invoice.status === "Overdue"
                ? [
                    {
                      label: "Record Payment",
                      onClick: () => {
                        recordPayment(invoice.id, new Date().toISOString().slice(0, 10));
                        logHistory("recorded a payment");
                        toast.success(`Payment recorded for ${invoice.invoiceNumber}.`);
                      },
                    },
                  ]
                : []),
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => {
                  const copy = duplicateInvoice(invoice.id);
                  if (copy) {
                    logHistory("duplicated this record");
                    toast.success(`${copy.invoiceNumber} created.`);
                    router.push(`/finance/invoices/${copy.id}`);
                  }
                },
              },
              ...(invoice.status !== "Void"
                ? [
                    {
                      label: "Void",
                      onClick: () => {
                        voidInvoice(invoice.id);
                        logHistory("voided this invoice");
                        toast.success(`${invoice.invoiceNumber} voided.`);
                      },
                    },
                  ]
                : []),
              {
                label: invoice.archived ? "Restore" : "Archive",
                onClick: () => {
                  if (invoice.archived) {
                    restoreInvoice(invoice.id);
                    logHistory("restored this record");
                    toast.success(`${invoice.invoiceNumber} was restored.`);
                  } else {
                    archiveInvoices([invoice.id]);
                    logHistory("archived this record");
                    toast.success(`${invoice.invoiceNumber} was archived.`);
                  }
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Total" value={`$${total.toLocaleString()}`} />
            <MetricCard label="Issue Date" value={invoice.issueDate} />
            <MetricCard label="Due Date" value={invoice.dueDate} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-xl flex-col gap-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Company</dt>
                <dd>{company?.name ?? "—"}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge className="border-0 font-medium">{invoice.status}</Badge>
                </dd>
                <dt className="text-muted-foreground">Paid Date</dt>
                <dd>{invoice.paidDate ?? "—"}</dd>
              </dl>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Line Items</h3>
                <div className="flex flex-col gap-1.5">
                  {invoice.lineItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b py-1.5 text-sm">
                      <span>{item.description}</span>
                      <span className="tabular-nums">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 text-sm font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ),
          activity: <EntityComments entityKey={`invoice:${invoice.id}`} />,
          relationships: company ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Company</h3>
              <Link href={`/sales/companies/${company.id}`} className="text-primary text-sm hover:underline">
                {company.name}
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No linked company.</p>
          ),
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="finance" contextLabel="this invoice" />,
          history: <RecordHistory entityKey={`invoice:${invoice.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete ${invoice.invoiceNumber}?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={handleDeletePermanently}
            />
          ),
        }}
      />
      <InvoiceEditSheet invoice={invoice} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
