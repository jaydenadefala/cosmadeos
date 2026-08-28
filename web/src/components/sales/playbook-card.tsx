import Link from "next/link";
import { Bookmark } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Playbook } from "@/lib/mock-data/playbooks";

/**
 * Shared component (ROADMAP.md Shared Component Library) — a standalone
 * card for browsing Knowledge-adjacent content (Playbooks, and later
 * Knowledge Base articles). Presentational only: takes the resolved author
 * name/initials as props rather than importing the employees store,
 * mirroring LeadCard/ApplicantCard's decoupling. Unlike those two, this
 * card supplies its own chrome (`bg-card rounded-lg border`) since it isn't
 * rendered inside `KanbanBoard`, which normally provides that.
 */
export function PlaybookCard({
  playbook,
  authorName,
  authorInitials,
  onToggleFavorite,
  selected,
  onToggleSelect,
}: {
  playbook: Playbook;
  authorName: string;
  authorInitials: string;
  onToggleFavorite: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {onToggleSelect ? (
            <Checkbox
              checked={!!selected}
              onCheckedChange={onToggleSelect}
              aria-label={`Select ${playbook.title}`}
            />
          ) : null}
          <Badge variant="secondary" className="font-medium">
            {playbook.category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 -mr-1 -mt-1"
          aria-label={
            playbook.favorited
              ? `Remove ${playbook.title} from favorites`
              : `Add ${playbook.title} to favorites`
          }
          onClick={onToggleFavorite}
        >
          <Bookmark
            className={cn("size-4", playbook.favorited && "fill-primary text-primary")}
          />
        </Button>
      </div>

      <div>
        <Link
          href={`/sales/playbooks/${playbook.id}`}
          className="text-sm font-semibold hover:underline"
        >
          {playbook.title}
        </Link>
        <p className="text-muted-foreground mt-1 text-xs">{playbook.summary}</p>
      </div>

      <p className="text-muted-foreground text-xs">{playbook.steps.length} steps</p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">{authorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">{authorName}</span>
        </div>
        <span className="text-muted-foreground text-[11px]">
          Updated {playbook.lastUpdatedLabel}
        </span>
      </div>
    </div>
  );
}
