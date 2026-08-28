import Link from "next/link";
import { Bookmark } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { KnowledgeBaseEntry } from "@/lib/mock-data/knowledge-base";

/**
 * Card for a Knowledge Base entry (Template/Meeting Notes/Lessons Learned/
 * Best Practice) — mirrors Sales' `KnowledgeArticleCard` exactly, the
 * proven shape for browsable reference content across this codebase.
 */
export function KnowledgeBaseCard({
  entry,
  authorName,
  authorInitials,
  onToggleFavorite,
  selected,
  onToggleSelect,
}: {
  entry: KnowledgeBaseEntry;
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
            <Checkbox checked={!!selected} onCheckedChange={onToggleSelect} aria-label={`Select ${entry.title}`} />
          ) : null}
          <Badge variant="secondary" className="font-medium">
            {entry.category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 -mr-1 -mt-1"
          aria-label={entry.favorited ? `Remove ${entry.title} from favorites` : `Add ${entry.title} to favorites`}
          onClick={onToggleFavorite}
        >
          <Bookmark className={cn("size-4", entry.favorited && "fill-primary text-primary")} />
        </Button>
      </div>

      <div>
        <Link href={`/knowledge/articles/${entry.id}`} className="text-sm font-semibold hover:underline">
          {entry.title}
        </Link>
        <p className="text-muted-foreground mt-1 text-xs">{entry.summary}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">{authorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">{authorName}</span>
        </div>
        <span className="text-muted-foreground text-[11px]">Updated {entry.lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
