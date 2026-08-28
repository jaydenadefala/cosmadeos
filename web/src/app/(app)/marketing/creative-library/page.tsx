"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ImagePlus, UploadCloud } from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CARD_GRID_DENSITY_CLASS, PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { AssetDetailSheet } from "@/components/marketing/asset-detail-sheet";
import { CreativeAssetCard } from "@/components/marketing/creative-asset-card";
import { useCampaigns } from "@/lib/mock-data/campaigns";
import {
  ASSET_TYPES,
  addCreativeAsset,
  archiveCreativeAssets,
  deleteCreativeAsset,
  useCreativeAssets,
  type CreativeAsset,
} from "@/lib/mock-data/creative-assets";
import { cn } from "@/lib/utils";

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: CreativeAsset[]) {
  const header = ["Name", "Type", "Size", "Uploaded By", "Uploaded"];
  const lines = rows.map((r) =>
    [r.name, r.assetType, r.sizeLabel, r.uploadedBy, r.uploadedLabel].map((v) => `"${v}"`).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "creative-library.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Creative Library — Marketing sidebar (05 Department Operating Systems/
 * Marketing/marketing-operating-system.md: "Creative Library (media/document
 * management, supports drag-and-drop per the platform's Drag & Drop
 * standard)"). Drag-and-drop is real — dragging any file onto the content
 * area uploads it, same store call as the "Upload" toolbar button. Assets
 * created here can link to a real Campaign (AssetDetailSheet), fulfilling
 * CLAUDE.md's "Every Module Must Be Connected."
 */
export default function CreativeLibraryPage() {
  const { data: session } = useSession();
  const allAssets = useCreativeAssets();
  const campaigns = useCampaigns();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [openAsset, setOpenAsset] = React.useState<CreativeAsset | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const dragCounter = React.useRef(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const assets = React.useMemo(() => allAssets.filter((a) => !a.archived), [allAssets]);

  const campaignById = React.useMemo(() => {
    const map = new Map<string, (typeof campaigns)[number]>();
    for (const campaign of campaigns) map.set(campaign.id, campaign);
    return map;
  }, [campaigns]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      { id: "assetType", label: "Type", options: ASSET_TYPES.map((t) => ({ value: t, label: t })) },
      {
        id: "campaignId",
        label: "Campaign",
        options: campaigns.map((c) => ({ value: c.id, label: c.name })),
      },
    ],
    [campaigns],
  );

  const filtered = React.useMemo(() => {
    let rows = assets;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (filters.assetType) rows = rows.filter((a) => a.assetType === filters.assetType);
    if (filters.campaignId) rows = rows.filter((a) => a.campaignId === filters.campaignId);
    return rows;
  }, [assets, search, filters]);

  const pagination = usePagination(filtered);

  function uploadFiles(files: FileList | File[]) {
    const uploaderName = session?.user?.name ?? "Unknown";
    const uploaderInitials = session?.user?.initials ?? "?";
    const list = Array.from(files);
    if (list.length === 0) return;
    list.forEach((file) => addCreativeAsset(file, uploaderName, uploaderInitials));
    toast.success(`${list.length} asset${list.length === 1 ? "" : "s"} uploaded.`);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    e.target.value = "";
    if (files && files.length > 0) uploadFiles(files);
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes("Files")) setDragActive(true);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelected}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Creative Library</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {assets.length} assets — drag files anywhere on this page
          to upload
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assets…"
        filters={
          <AdvancedFilter
            trigger={<FilterTriggerButton count={countActiveFilters(filters)} />}
            fields={filterFields}
            values={filters}
            onChange={setFilters}
          />
        }
        savedViewsControl={
          <SavedViewsMenu
            pageKey="marketing-creative-library"
            snapshot={{ search, filters, density }}
            onApply={applyView}
          />
        }
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Creative Library exported.");
        }}
        onCreate={() => fileInputRef.current?.click()}
        createLabel="Upload"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveCreativeAssets(selected);
              toast.success(`${selected.length} asset${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteCreativeAsset(id));
              toast.success(`${selected.length} asset${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="relative min-h-0 flex-1 overflow-auto">
        {dragActive ? (
          <div className="border-primary bg-primary/5 text-primary pointer-events-none absolute inset-2 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
            <UploadCloud className="size-8" />
            <p className="text-sm font-medium">Drop files to upload</p>
          </div>
        ) : null}

        {assets.length === 0 ? (
          <EmptyState
            icon={ImagePlus}
            title="No creative assets yet"
            description="Drag files anywhere on this page, or upload from your device to build your media library."
            action={
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                Upload files
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No assets match your search"
            description="Try a different name or clear your filters."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setFilters({});
                }}
              >
                Clear search and filters
              </Button>
            }
          />
        ) : (
          <div
            className={cn(
              "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
              CARD_GRID_DENSITY_CLASS[density],
            )}
          >
            {pagination.pageItems.map((asset) => (
              <CreativeAssetCard
                key={asset.id}
                asset={asset}
                campaignName={asset.campaignId ? campaignById.get(asset.campaignId)?.name : undefined}
                selected={selected.includes(asset.id)}
                onToggleSelect={() =>
                  setSelected((prev) =>
                    prev.includes(asset.id) ? prev.filter((id) => id !== asset.id) : [...prev, asset.id],
                  )
                }
                onOpen={() => setOpenAsset(asset)}
                onArchive={() => {
                  archiveCreativeAssets([asset.id]);
                  toast.success(`${asset.name} archived.`);
                }}
                onDelete={() => {
                  deleteCreativeAsset(asset.id);
                  toast.success(`${asset.name} permanently deleted.`);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        itemLabel="assets"
      />

      {openAsset ? (
        <AssetDetailSheet
          asset={openAsset}
          open={!!openAsset}
          onOpenChange={(open) => !open && setOpenAsset(null)}
        />
      ) : null}
    </div>
  );
}
