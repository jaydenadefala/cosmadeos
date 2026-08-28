"use client";

import * as React from "react";
import { toast } from "sonner";
import { Palette, FileImage, FileText, LayoutTemplate, BookOpen } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EntityComments } from "@/components/ui/entity-comments";
import { Field } from "@/components/ui/field";
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
import { Textarea } from "@/components/ui/textarea";
import {
  BRAND_ASSET_CATEGORIES,
  updateBrandAsset,
  type BrandAsset,
  type BrandAssetCategory,
} from "@/lib/mock-data/brand-assets";

const CATEGORY_ICON: Record<BrandAssetCategory, typeof Palette> = {
  Logo: FileImage,
  "Color Palette": Palette,
  Typography: FileText,
  Template: LayoutTemplate,
  Guideline: BookOpen,
};

/**
 * Brand Asset detail — a Sheet (side drawer, per ADR-003), same
 * lightweight-metadata exception as Team Documents/Creative Assets.
 * Category and description are editable inline; there's no campaign link
 * (brand assets are canonical, not campaign-specific — see brand-assets.ts).
 */
export function BrandAssetDetailSheet({
  asset,
  open,
  onOpenChange,
}: {
  asset: BrandAsset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = CATEGORY_ICON[asset.category];
  const [description, setDescription] = React.useState(asset.description);

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setDescription(asset.description);
    }
  }, [open, asset.description]);

  const previewUrl = React.useMemo(() => {
    if (!asset.fileBlob || asset.category !== "Logo") return undefined;
    return URL.createObjectURL(asset.fileBlob);
  }, [asset.fileBlob, asset.category]);

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

  function saveDescription() {
    updateBrandAsset(asset.id, { description });
    toast.success("Description saved.");
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
            {asset.category} · {asset.sizeLabel}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 overflow-y-auto px-4">
          <div className="bg-muted flex h-32 items-center justify-center overflow-hidden rounded-lg">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- transient blob: URL, next/image can't optimize it
              <img src={previewUrl} alt={asset.name} className="h-full w-full object-contain p-4" />
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
            </dl>
          </div>

          <Field id="brand-asset-category" label="Category">
            <Select
              value={asset.category}
              onValueChange={(value) => {
                if (!value) return;
                updateBrandAsset(asset.id, { category: value as BrandAssetCategory });
                toast.success("Category updated.");
              }}
            >
              <SelectTrigger id="brand-asset-category" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BRAND_ASSET_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="brand-asset-description" label="Description">
            <Textarea
              id="brand-asset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              rows={3}
            />
          </Field>

          <div>
            <h3 className="mb-2 text-sm font-semibold">Comments</h3>
            <EntityComments entityKey={`brand-asset:${asset.id}`} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
