"use client";

import { FileText } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EntityComments } from "@/components/ui/entity-comments";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TeamDocument } from "@/lib/mock-data/team-documents";

/**
 * Team Document detail — a Sheet (side drawer, per ADR-003: viewing is a
 * drawer job, not a full new page) rather than an `ObjectPage`, since a
 * document's extra information (version history, comments, permissions) is
 * comparatively lightweight next to a full business object like Company or
 * Lead. Version History and Comments are both real per CLAUDE.md
 * "Functionality-First Implementation Rules."
 */
export function TeamDocumentDetailSheet({
  document,
  open,
  onOpenChange,
}: {
  document: TeamDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="text-muted-foreground size-4 shrink-0" />
            {document.name}
          </SheetTitle>
          <SheetDescription>
            {document.type} · {document.sizeLabel}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-y-auto px-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Uploaded by</dt>
              <dd className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[9px]">
                    {document.uploadedByInitials}
                  </AvatarFallback>
                </Avatar>
                {document.uploadedBy}
              </dd>
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd>{document.uploadedLabel}</dd>
              <dt className="text-muted-foreground">Visibility</dt>
              <dd>
                <Badge variant="outline" className="font-normal">
                  {document.visibility}
                </Badge>
              </dd>
            </dl>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Version History</h3>
            {document.versionHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No earlier versions — uploading a file with this same name creates a new version
                here.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {document.versionHistory.map((version, i) => (
                  <div key={i} className="rounded-lg border p-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{version.uploadedBy}</span>
                      <Badge variant="outline" className="font-normal">
                        {version.uploadedLabel}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{version.sizeLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Comments</h3>
            <EntityComments entityKey={`document:${document.id}`} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
