"use client";

import * as React from "react";
import { FileText, Film, Image as ImageIcon, Paperclip } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EntityComments } from "@/components/ui/entity-comments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { assignAssetToCampaign, type AssetType, type CreativeAsset } from "@/lib/mock-data/creative-assets";
import { useCampaigns } from "@/lib/mock-data/campaigns";

const NO_CAMPAIGN = "none";

const TYPE_ICON: Record<AssetType, typeof ImageIcon> = {
  Image: ImageIcon,
  Video: Film,
  Document: FileText,
  Other: Paperclip,
};

/**
 * Creative Asset detail — a Sheet (side drawer, per ADR-003), same
 * lightweight-metadata exception as TeamDocumentDetailSheet. Shows a real
 * image/video preview when a session upload's `fileBlob` exists; seed assets
 * (no bytes, no backend yet) show a type icon instead. Assign to Campaign is
 * a genuine, real link into the Campaigns store (CLAUDE.md "Every Module
 * Must Be Connected").
 */
export function AssetDetailSheet({
  asset,
  open,
  onOpenChange,
}: {
  asset: CreativeAsset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const campaigns = useCampaigns();
  const Icon = TYPE_ICON[asset.assetType];

  const previewUrl = React.useMemo(() => {
    if (!asset.fileBlob) return undefined;
    if (asset.assetType !== "Image" && asset.assetType !== "Video") return undefined;
    return URL.createObjectURL(asset.fileBlob);
  }, [asset.fileBlob, asset.assetType]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleDownload() {
    if (!asset.fileBlob) return;
    const url = URL.createObjectURL(asset.fileBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = asset.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon className="text-muted-foreground size-4 shrink-0" />
            {asset.name}
          </SheetTitle>
          <SheetDescription>
            {asset.assetType} · {asset.sizeLabel}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-y-auto px-4">
          <div className="bg-muted flex h-40 items-center justify-center overflow-hidden rounded-lg">
            {previewUrl && asset.assetType === "Image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- transient blob: URL, next/image can't optimize it
              <img src={previewUrl} alt={asset.name} className="h-full w-full object-contain" />
            ) : previewUrl && asset.assetType === "Video" ? (
              <video src={previewUrl} controls className="h-full w-full" />
            ) : (
              <Icon className="text-muted-foreground size-10" />
            )}
          </div>

          {asset.fileBlob ? (
            <button
              onClick={handleDownload}
              className="text-primary text-left text-sm font-medium hover:underline"
            >
              Download
            </button>
          ) : (
            <p className="text-muted-foreground text-sm">
              No file bytes stored for this seed asset — download is available for assets uploaded
              during this session.
            </p>
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold">Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Uploaded by</dt>
              <dd className="flex items-center gap-1.5">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[9px]">{asset.uploadedByInitials}</AvatarFallback>
                </Avatar>
                {asset.uploadedBy}
              </dd>
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd>{asset.uploadedLabel}</dd>
              <dt className="text-muted-foreground">Type</dt>
              <dd>
                <Badge variant="outline" className="font-normal">
                  {asset.assetType}
                </Badge>
              </dd>
            </dl>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Campaign</h3>
            <Select
              value={asset.campaignId ?? NO_CAMPAIGN}
              onValueChange={(value) => {
                if (!value) return;
                const campaignId = value === NO_CAMPAIGN ? undefined : value;
                assignAssetToCampaign(asset.id, campaignId);
                toast.success(
                  campaignId ? "Asset linked to campaign." : "Asset unlinked from campaign.",
                );
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NO_CAMPAIGN
                      ? "Not linked to a campaign"
                      : (campaigns.find((c) => c.id === value)?.name ?? "Not linked to a campaign")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CAMPAIGN}>Not linked to a campaign</SelectItem>
                {campaigns
                  .filter((c) => !c.archived)
                  .map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Comments</h3>
            <EntityComments entityKey={`creative-asset:${asset.id}`} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
