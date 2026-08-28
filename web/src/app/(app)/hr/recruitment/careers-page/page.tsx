"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ExternalLink, Link as LinkIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { setJobListingStatus, useJobListings, type JobListingStatus } from "@/lib/mock-data/job-listings";

const STATUS_TONE: Record<JobListingStatus, string> = {
  Open: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Closed: "bg-muted text-foreground/70",
  Draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

/**
 * Careers Page (internal management view) — Recruitment sidebar group
 * (05 Department Operating Systems/HR/hr-operating-system.md, Hire pipeline:
 * Applicants/Interviews/Job Listings/Careers Page). This is the admin
 * control surface for what appears on the real, genuinely public
 * /careers page — publishing here (setting a listing to Open) makes it
 * appear there immediately, since both read the same job-listings store.
 */
export default function CareersPageManagementPage() {
  const allJobListings = useJobListings();
  const listings = allJobListings.filter((j) => !j.archived);
  const publishedCount = listings.filter((j) => j.status === "Open").length;
  const pagination = usePagination(listings);

  function copyPublicLink() {
    const url = `${window.location.origin}/careers`;
    navigator.clipboard?.writeText(url);
    toast.success("Public careers page link copied.");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold">Careers Page</h1>
          <p className="text-muted-foreground text-sm">
            {publishedCount} of {listings.length} listings published to the public careers page
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={copyPublicLink}>
            <LinkIcon className="size-3.5" />
            Copy public link
          </Button>
          <Button size="sm" className="gap-1.5" render={<Link href="/careers" target="_blank" />}>
            <ExternalLink className="size-3.5" />
            View public page
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        {listings.length === 0 ? (
          <EmptyState
            title="No job listings yet"
            description="Create a job listing to start publishing open roles to the public careers page."
            action={
              <Button size="sm" render={<Link href="/hr/recruitment/job-listings" />}>
                Go to Job Listings
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {pagination.pageItems.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <Link
                    href={`/hr/recruitment/job-listings/${job.id}`}
                    className="font-medium hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {job.department} · {job.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`border-0 font-medium ${STATUS_TONE[job.status]}`}>
                    {job.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const next = job.status === "Open" ? "Closed" : "Open";
                      setJobListingStatus(job.id, next);
                      toast.success(
                        next === "Open"
                          ? `${job.title} published to the careers page.`
                          : `${job.title} unpublished from the careers page.`,
                      );
                    }}
                  >
                    {job.status === "Open" ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        itemLabel="listings"
      />
    </div>
  );
}
