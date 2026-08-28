"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Copy,
  FileText,
  Film,
  Image as ImageIcon,
  MoreHorizontal,
  Paperclip,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { duplicateCreativeAsset, type AssetType, type CreativeAsset } from "@/lib/mock-data/creative-assets";

const TYPE_ICON: Record<AssetType, typeof ImageIcon> = {
  Image: ImageIcon,
  Video: Film,
  Document: FileText,
  Other: Paperclip,
};

/**
 * Creative Asset card — Marketing's Creative Library grid. Shows a real
 * image thumbnail for session-uploaded images (via a component-owned
 * `blob:` URL, revoked on unmount), a type icon otherwise (seed assets carry
 * no file bytes — no backend/storage yet).
 */
export function CreativeAssetCard({
  asset,
  campaignName,
  selected,
  onToggleSelect,
  onOpen,
  onArchive,
  onDelete,
}: {
  asset: CreativeAsset;
  campaignName?: string;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const Icon = TYPE_ICON[asset.assetType];

  const thumbnailUrl = React.useMemo(() => {
    if (!asset.fileBlob || asset.assetType !== "Image") return undefined;
    return URL.createObjectURL(asset.fileBlob);
  }, [asset.fileBlob, asset.assetType]);

  React.useEffect(() => {
    return () => {
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [thumbnailUrl]);

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${asset.name}`}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${asset.name}`} />}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const copy = duplicateCreativeAsset(asset.id);
                if (copy) toast.success(`${copy.name} created.`);
              }}
            >
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        onClick={onOpen}
        className="bg-muted flex h-28 w-full items-center justify-center overflow-hidden rounded-md"
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- transient blob: URL, next/image can't optimize it
          <img src={thumbnailUrl} alt={asset.name} className="h-full w-full object-cover" />
        ) : (
          <Icon className="text-muted-foreground size-8" />
        )}
      </button>

      <div>
        <button onClick={onOpen} className="truncate text-left text-sm font-medium hover:underline">
          {asset.name}
        </button>
        <p className="text-muted-foreground mt-0.5 text-xs">{asset.sizeLabel}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
        <Badge variant="secondary" className="font-medium">
          {asset.assetType}
        </Badge>
        {campaignName ? (
          <span className="text-muted-foreground truncate text-[11px]">{campaignName}</span>
        ) : null}
      </div>
    </div>
  );
}
