import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Lead } from "@/lib/mock-data/leads";

/**
 * Shared component (ROADMAP.md) — the card rendered inside the Leads
 * pipeline Kanban board. Presentational only: takes the resolved owner
 * name/initials as props rather than importing the employees store,
 * mirroring ApplicantCard's decoupling from the job-listings store. The
 * "View details" link is a separate affordance rather than wrapping the
 * whole card, since dnd-kit's drag listeners are attached to the card's
 * root and a full-card `<Link>` would fight the drag gesture for pointer
 * events.
 */
export function LeadCard({
  lead,
  companyName,
  ownerName,
  ownerInitials,
}: {
  lead: Lead;
  companyName: string;
  ownerName: string;
  ownerInitials: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <Link
          href={`/sales/leads/${lead.id}`}
          className="truncate text-sm font-medium hover:underline"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {lead.contactName}
        </Link>
        <p className="text-muted-foreground truncate text-xs">{companyName}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums">
          ${lead.value.toLocaleString()}
        </span>
        <Avatar className="size-5" title={ownerName}>
          <AvatarFallback className="text-[9px]">{ownerInitials}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-muted-foreground text-[11px]">{lead.lastActivityLabel}</p>
    </div>
  );
}
