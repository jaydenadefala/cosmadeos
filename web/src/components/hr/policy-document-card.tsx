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
  archivePolicyDocuments,
  deletePolicyDocument,
  duplicatePolicyDocument,
  type PolicyDocument,
} from "@/lib/mock-data/policy-documents";

/** Card for a Handbook/Policy document — mirrors PlaybookCard/KnowledgeArticleCard's proven shape. */
export function PolicyDocumentCard({
  document,
  selected,
  onToggleSelect,
}: {
  document: PolicyDocument;
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
              aria-label={`Select ${document.title}`}
            />
          ) : null}
          <Badge variant="secondary" className="font-medium">
            {document.docType}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Actions for ${document.title}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const copy = duplicatePolicyDocument(document.id);
                if (copy) toast.success(`${copy.title} created.`);
              }}
            >
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                archivePolicyDocuments([document.id]);
                toast.success(`${document.title} archived.`);
              }}
            >
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                deletePolicyDocument(document.id);
                toast.success(`${document.title} permanently deleted.`);
              }}
            >
              <Trash2 className="size-4" />
              Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div>
        <Link
          href={`/hr/policy-documents/${document.id}`}
          className="text-sm font-semibold hover:underline"
        >
          {document.title}
        </Link>
        <p className="text-muted-foreground mt-1 text-xs">{document.summary}</p>
      </div>

      <div className="mt-auto border-t pt-3">
        <span className="text-muted-foreground text-[11px]">Updated {document.lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
