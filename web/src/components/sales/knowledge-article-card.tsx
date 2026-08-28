import Link from "next/link";
import { Bookmark } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { KnowledgeArticle } from "@/lib/mock-data/knowledge-articles";

/**
 * `KnowledgeArticle` — the shared component named in ROADMAP.md's Shared
 * Component Library, built here for the Sales workspace's Knowledge sidebar
 * item. Mirrors `PlaybookCard`'s shape/lifecycle exactly (this session's
 * proven pattern for Knowledge-adjacent content) — a card grid rather than
 * a table since this is reference content to browse and read, not a
 * working record set.
 */
export function KnowledgeArticleCard({
  article,
  authorName,
  authorInitials,
  onToggleFavorite,
  selected,
  onToggleSelect,
}: {
  article: KnowledgeArticle;
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
              aria-label={`Select ${article.title}`}
            />
          ) : null}
          <Badge variant="secondary" className="font-medium">
            {article.category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 -mr-1 -mt-1"
          aria-label={
            article.favorited
              ? `Remove ${article.title} from favorites`
              : `Add ${article.title} to favorites`
          }
          onClick={onToggleFavorite}
        >
          <Bookmark className={cn("size-4", article.favorited && "fill-primary text-primary")} />
        </Button>
      </div>

      <div>
        <Link
          href={`/sales/knowledge/${article.id}`}
          className="text-sm font-semibold hover:underline"
        >
          {article.title}
        </Link>
        <p className="text-muted-foreground mt-1 text-xs">{article.summary}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarFallback className="text-[10px]">{authorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">{authorName}</span>
        </div>
        <span className="text-muted-foreground text-[11px]">Updated {article.lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
