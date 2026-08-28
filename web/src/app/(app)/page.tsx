"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Briefcase,
  DollarSign,
  Handshake,
  Megaphone,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { useApplicants } from "@/lib/mock-data/applicants";
import { useCampaigns } from "@/lib/mock-data/campaigns";
import { useCompanies } from "@/lib/mock-data/companies";
import { useEmployees } from "@/lib/mock-data/employees";
import { useJobListings } from "@/lib/mock-data/job-listings";
import { useLeads } from "@/lib/mock-data/leads";

/**
 * Dashboard — the root workspace ("/"). Per ADR-002 ("workspaces are working
 * environments, not dashboards"), this is the one deliberate exception: the
 * Dashboard workspace's whole purpose IS the cross-workspace overview, the
 * same way each object's own Analytics tab or a department's Reports page is
 * read-only by design. Every number here is computed live from the real
 * HR/Sales/Marketing stores — never hardcoded — and Quick Actions route into
 * genuine creation flows in those workspaces, not decorative buttons.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const employees = useEmployees();
  const leads = useLeads();
  const companies = useCompanies();
  const applicants = useApplicants();
  const jobListings = useJobListings();
  const campaigns = useCampaigns();

  const activeEmployees = employees.filter((e) => !e.archived && e.status === "Active");
  const pendingHires = employees.filter((e) => !e.archived && (e.status === "Invited" || e.status === "Pending"));

  const activeLeads = leads.filter((l) => !l.archived);
  const openLeads = activeLeads.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const openPipelineValue = openLeads.reduce((sum, l) => sum + l.value, 0);

  const activeCampaigns = campaigns.filter((c) => !c.archived && c.status === "Active");
  const pendingCampaignApprovals = campaigns.filter((c) => !c.archived && c.approvalStatus === "Pending");

  const openJobListings = jobListings.filter((j) => !j.archived && j.status === "Open");
  const activeApplicants = applicants.filter(
    (a) => !a.archived && a.stage !== "hired" && a.stage !== "rejected",
  );

  const recentLeads = activeLeads.slice(0, 5);
  const recentApplicants = activeApplicants.slice(0, 5);
  const recentCampaigns = campaigns.filter((c) => !c.archived).slice(0, 5);

  const companyById = React.useMemo(() => {
    const map = new Map<string, (typeof companies)[number]>();
    for (const company of companies) map.set(company.id, company);
    return map;
  }, [companies]);

  const jobListingById = React.useMemo(() => {
    const map = new Map<string, (typeof jobListings)[number]>();
    for (const job of jobListings) map.set(job.id, job);
    return map;
  }, [jobListings]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">
          Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here&apos;s what&apos;s happening across Cosmade OS today.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Active Employees" value={String(activeEmployees.length)} icon={Users} />
          <MetricCard
            label="Open Pipeline"
            value={`$${openPipelineValue.toLocaleString()}`}
            icon={DollarSign}
          />
          <MetricCard label="Active Campaigns" value={String(activeCampaigns.length)} icon={Megaphone} />
          <MetricCard label="Open Applicants" value={String(activeApplicants.length)} icon={Briefcase} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5" onClick={() => router.push("/hr/onboarding")}>
              <UserPlus className="size-3.5" />
              Onboard Employee
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => router.push("/sales/leads")}
            >
              <Plus className="size-3.5" />
              Add Lead
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => router.push("/marketing/campaigns/new")}
            >
              <Plus className="size-3.5" />
              New Campaign
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => router.push("/hr/recruitment/job-listings")}
            >
              <Plus className="size-3.5" />
              Post Job
            </Button>
          </div>
        </div>

        {pendingHires.length > 0 || pendingCampaignApprovals.length > 0 ? (
          <div className="bg-accent/40 rounded-lg border p-4">
            <h2 className="mb-2 text-sm font-semibold">Needs Attention</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {pendingHires.length > 0 ? (
                <li>
                  <Link href="/hr/directory" className="text-primary hover:underline">
                    {pendingHires.length} pending onboarding{pendingHires.length === 1 ? "" : "s"}
                  </Link>
                  <span className="text-muted-foreground"> — invited employees haven&apos;t started yet</span>
                </li>
              ) : null}
              {pendingCampaignApprovals.length > 0 ? (
                <li>
                  <Link href="/marketing/campaigns" className="text-primary hover:underline">
                    {pendingCampaignApprovals.length} campaign{pendingCampaignApprovals.length === 1 ? "" : "s"}{" "}
                    awaiting approval
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Deals</h2>
              <Link href="/sales/leads" className="text-primary text-xs hover:underline">
                View all
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm">No open deals yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="rounded-lg border p-2.5 text-sm">
                    <Link href="/sales/leads" className="font-medium hover:underline">
                      {lead.contactName}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {companyById.get(lead.companyId)?.name ?? "—"} · ${lead.value.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Applicants</h2>
              <Link href="/hr/recruitment/applicants" className="text-primary text-xs hover:underline">
                View all
              </Link>
            </div>
            {recentApplicants.length === 0 ? (
              <p className="text-muted-foreground text-sm">No open applicants yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentApplicants.map((applicant) => (
                  <li key={applicant.id} className="rounded-lg border p-2.5 text-sm">
                    <Link href="/hr/recruitment/applicants" className="font-medium hover:underline">
                      {applicant.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {jobListingById.get(applicant.jobListingId)?.title ?? "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Campaigns</h2>
              <Link href="/marketing/campaigns" className="text-primary text-xs hover:underline">
                View all
              </Link>
            </div>
            {recentCampaigns.length === 0 ? (
              <p className="text-muted-foreground text-sm">No campaigns yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentCampaigns.map((campaign) => (
                  <li key={campaign.id} className="rounded-lg border p-2.5 text-sm">
                    <Link
                      href={`/marketing/campaigns/${campaign.id}`}
                      className="font-medium hover:underline"
                    >
                      {campaign.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {campaign.status} · {campaign.channel}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard label="Open Job Listings" value={String(openJobListings.length)} icon={Briefcase} />
          <MetricCard
            label="Companies"
            value={String(companies.filter((c) => !c.archived).length)}
            icon={Handshake}
          />
          <MetricCard
            label="Team Size"
            value={String(employees.filter((e) => !e.archived).length)}
            icon={Users}
          />
        </div>
      </div>
    </div>
  );
}
