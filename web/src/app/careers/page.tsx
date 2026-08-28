"use client";

import * as React from "react";
import { toast } from "sonner";
import { Briefcase, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { submitApplication } from "@/lib/mock-data/applicants";
import { useJobListings, type JobListing } from "@/lib/mock-data/job-listings";

/**
 * Public Careers Page — genuinely unauthenticated (this route lives outside
 * the `(app)` route group, so the auth-gated layout in
 * src/app/(app)/layout.tsx never wraps it). This is the real page a
 * prospective candidate would land on, not an internal admin mockup — see
 * /hr/recruitment/careers-page for the internal management view. Applying
 * calls `submitApplication`, which creates a real Applicant in the shared
 * store's "New" stage — a public application genuinely appears on the
 * internal Applicants board, not a decorative form.
 */
export default function CareersPage() {
  const allJobListings = useJobListings();
  const [applyingTo, setApplyingTo] = React.useState<JobListing | null>(null);
  const [form, setForm] = React.useState({ name: "", email: "" });

  const openListings = allJobListings.filter((j) => !j.archived && j.status === "Open");

  function handleApply() {
    if (!applyingTo) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Enter your name and email to apply.");
      return;
    }
    submitApplication(applyingTo.id, form.name.trim(), form.email.trim());
    toast.success(`Application submitted for ${applyingTo.title}. We'll be in touch.`);
    setApplyingTo(null);
    setForm({ name: "", email: "" });
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm font-bold">
          C
        </span>
        <span className="text-lg font-semibold tracking-tight">Cosmade Medical</span>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Careers at Cosmade Medical</h1>
        <p className="text-muted-foreground mt-2">
          We build and service the medical equipment that keeps hospitals running. Join our team.
        </p>
      </div>

      {openListings.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open roles right now"
          description="Check back soon — new roles are posted here as they open."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {openListings.map((job) => (
            <div key={job.id} className="rounded-lg border p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{job.title}</h2>
                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {job.location}
                    </span>
                    <span>{job.department}</span>
                    <Badge variant="outline" className="font-normal">
                      {job.employmentType}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" onClick={() => setApplyingTo(job)}>
                  Apply
                </Button>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">{job.description}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!applyingTo} onOpenChange={(open) => !open && setApplyingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {applyingTo?.title}</DialogTitle>
            <DialogDescription>Tell us who you are and we&apos;ll follow up by email.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="apply-name" label="Full name">
              <Input
                id="apply-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field id="apply-email" label="Email">
              <Input
                id="apply-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleApply}>Submit application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
