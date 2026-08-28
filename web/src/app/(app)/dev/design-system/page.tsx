"use client";

import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PermissionDeniedState } from "@/components/ui/permission-denied-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { AlertTriangle, Inbox } from "lucide-react";

/**
 * Internal, dev-mode-only reference for the Phase 2 Core Design System —
 * same "never in production" convention as the Developer Preview Toolbar.
 * Not a real workspace page; not linked from any nav.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 p-8">
      <div>
        <h1 className="text-2xl font-bold">Design System — Phase 2 Reference</h1>
        <p className="text-muted-foreground text-sm">
          Dev-only preview of every Core Design System component. Never linked
          from production navigation.
        </p>
      </div>

      <Section title="Breadcrumbs">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/hr">People &amp; HR</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Employee Directory</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>

      <Section title="Buttons, Badges, Inputs">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Badge>Employee</Badge>
          <Badge variant="secondary">Admin</Badge>
        </div>
        <Input placeholder="Search…" className="max-w-xs" />
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-muted-foreground text-sm">
            Overview tab content.
          </TabsContent>
          <TabsContent value="activity" className="text-muted-foreground text-sm">
            Activity tab content.
          </TabsContent>
          <TabsContent value="documents" className="text-muted-foreground text-sm">
            Documents tab content.
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Table (loaded)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-primary font-medium">Abby Huang</TableCell>
              <TableCell>Employee</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-primary font-medium">Adriano Leal</TableCell>
              <TableCell>Employee</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section title="Table Skeleton (loading state)">
        <TableSkeleton columns={["Name", "Access"]} rows={3} />
      </Section>

      <Section title="Empty State">
        <div className="rounded-lg border">
          <EmptyState
            icon={Inbox}
            title="No Campaigns Yet"
            description="Create your first campaign, import one, or generate a draft with AI."
            action={<Button size="sm">Create Campaign</Button>}
          />
        </div>
      </Section>

      <Section title="Error State">
        <div className="rounded-lg border">
          <ErrorState
            title="We couldn't publish the campaign because approval is still pending."
            onRetry={() => {}}
            onViewDetails={() => {}}
            onContactSupport={() => {}}
          />
        </div>
      </Section>

      <Section title="Permission Denied State">
        <div className="rounded-lg border">
          <PermissionDeniedState requiredRole="Finance Manager" onRequestAccess={() => {}} />
        </div>
      </Section>

      <Section title="Alert">
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Budget exceeded</AlertTitle>
          <AlertDescription>Q3 marketing spend is 12% over budget.</AlertDescription>
        </Alert>
      </Section>

      <Section title="Modal (mandatory: destructive/confirmation only)">
        <ConfirmationDialog
          trigger={<Button variant="destructive">Delete employee record</Button>}
          title="Delete this employee record?"
          description="This moves the record to Archive. You can undo within 30 days before permanent deletion."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={async () => new Promise((r) => setTimeout(r, 600))}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
