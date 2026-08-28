import Link from "next/link";
import { Bookmark } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ResearchItem } from "@/lib/mock-data/research-items";

/**
 * Research item card — Marketing's Research grid. Mirrors
 * `KnowledgeArticleCard`'s shape/lifecycle exactly (this session's proven
 * pattern for reference-content sidebar items) — a card grid rather than a
 * table since this is reference content to browse and read, not a working
 * record set.
 */
export function ResearchItemCard({
  item,
  authorName,
  authorInitials,
  onToggleFavorite,
  selected,
  onToggleSelect,
}: {
  item: ResearchItem;
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
              aria-label={`Select ${item.title}`}
            />
          ) : null}
          <Badge variant="secondary" className="font-medium">
            {item.category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 -mr-1 -mt-1"
          aria-label={
            item.favorited ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`
          }
          onClick={onToggleFavorite}
        >
          <Bookmark className={cn("size-4", item.favorited && "fill-primary text-primary")} />
        </Button>
      </div>

      <div>
        <Link href={`/marketing/research/${item.id}`} className="text-sm font-semibold hover:underline">
          {item.title}
        </Link>
        <p className="text-muted-foreground mt-1 text-xs">{item.summary}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">{authorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">{authorName}</span>
        </div>
        <span className="text-muted-foreground text-[11px]">Updated {item.lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
