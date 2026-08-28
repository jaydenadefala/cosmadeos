import Link from "next/link";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  archiveSopDocuments,
  deleteSopDocument,
  duplicateSopDocument,
  type SopDocument,
} from "@/lib/mock-data/sop-documents";

/** SOP card — mirrors PlaybookCard/PolicyDocumentCard's proven shape for reference/process content. */
export function SopCard({
  sop,
  selected,
  onToggleSelect,
}: {
  sop: SopDocument;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {onToggleSelect ? (
            <Checkbox checked={!!selected} onCheckedChange={onToggleSelect} aria-label={`Select ${sop.title}`} />
          ) : null}
          <Badge variant="secondary" className="font-medium">
            {sop.category}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${sop.title}`} />}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const copy = duplicateSopDocument(sop.id);
                if (copy) toast.success(`${copy.title} created.`);
              }}
            >
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                archiveSopDocuments([sop.id]);
                toast.success(`${sop.title} archived.`);
              }}
            >
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                deleteSopDocument(sop.id);
                toast.success(`${sop.title} permanently deleted.`);
              }}
            >
              <Trash2 className="size-4" />
              Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <Link href={`/operations/sops/${sop.id}`} className="text-sm font-semibold hover:underline">
          {sop.title}
        </Link>
        <p className="text-muted-foreground mt-1 text-xs">{sop.summary}</p>
      </div>

      <div className="mt-auto border-t pt-3">
        <span className="text-muted-foreground text-[11px]">Updated {sop.lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
