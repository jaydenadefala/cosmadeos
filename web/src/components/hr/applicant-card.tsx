import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Applicant } from "@/lib/mock-data/applicants";

/**
 * Shared component (ROADMAP.md) — the card rendered inside the Applicants
 * Kanban board. Presentational only: takes the resolved job listing title
 * as a prop rather than importing the job-listings store itself, so this
 * component stays decoupled from where that lookup happens (mirrors how
 * the Employee Profile page resolves managerName before rendering). The
 * name is a separate `<Link>` rather than wrapping the whole card, since
 * dnd-kit's drag listeners are attached to the card's root (same reasoning
 * as `LeadCard`'s "View details" link).
 */
export function ApplicantCard({
  applicant,
  roleTitle,
}: {
  applicant: Applicant;
  roleTitle: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">{applicant.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <Link
          href={`/hr/recruitment/applicants/${applicant.id}`}
          className="block truncate text-sm font-medium hover:underline"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {applicant.name}
        </Link>
        <p className="text-muted-foreground truncate text-xs">{roleTitle}</p>
        <p className="text-muted-foreground mt-1 text-[11px]">Applied {applicant.appliedLabel}</p>
      </div>
    </div>
  );
}
