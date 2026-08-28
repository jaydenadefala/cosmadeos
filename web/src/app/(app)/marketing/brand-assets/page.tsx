"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  BookOpen,
  Copy,
  FileImage,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Palette,
  Trash2,
} from "lucide-react";

import {
  AdvancedFilter,
  ActiveFilterChips,
  FilterTriggerButton,
  countActiveFilters,
  type FilterFieldConfig,
} from "@/components/ui/advanced-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { CARD_GRID_DENSITY_CLASS, PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { cn } from "@/lib/utils";
import { Pagination, usePagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BrandAssetDetailSheet } from "@/components/marketing/brand-asset-detail-sheet";
import {
  BRAND_ASSET_CATEGORIES,
  addBrandAsset,
  archiveBrandAssets,
  deleteBrandAsset,
  duplicateBrandAsset,
  useBrandAssets,
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

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: BrandAsset[]) {
  const header = ["Name", "Category", "Description", "Size"];
  const lines = rows.map((r) =>
    [r.name, r.category, r.description, r.sizeLabel].map((v) => `"${v}"`).join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "brand-assets.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Brand Assets — Marketing sidebar (05 Department Operating Systems/
 * Marketing/marketing-operating-system.md: "Brand Assets repository").
 * Canonical brand materials (logos, colors, typography, templates,
 * guidelines) — the shared source of truth, distinct from Creative
 * Library's campaign-specific working assets.
 */
export default function BrandAssetsPage() {
  const { data: session } = useSession();
  const allAssets = useBrandAssets();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [openAsset, setOpenAsset] = React.useState<BrandAsset | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState<{
    file: File | null;
    category: BrandAssetCategory;
    description: string;
  }>({ file: null, category: "Logo", description: "" });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const assets = React.useMemo(() => allAssets.filter((a) => !a.archived), [allAssets]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [
      {
        id: "category",
        label: "Category",
        options: BRAND_ASSET_CATEGORIES.map((c) => ({ value: c, label: c })),
      },
    ],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = assets;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (filters.category) rows = rows.filter((a) => a.category === filters.category);
    return rows;
  }, [assets, search, filters]);

  const pagination = usePagination(filtered);

  function handleUpload() {
    if (!uploadForm.file) {
      toast.error("Choose a file to upload.");
      return;
    }
    const uploaderName = session?.user?.name ?? "Unknown";
    const uploaderInitials = session?.user?.initials ?? "?";
    const asset = addBrandAsset(
      uploadForm.file,
      uploadForm.category,
      uploadForm.description,
      uploaderName,
      uploaderInitials,
    );
    toast.success(`${asset.name} uploaded.`);
    setUploadOpen(false);
    setUploadForm({ file: null, category: "Logo", description: "" });
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Brand Assets</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {assets.length} assets — the canonical source of truth
          every campaign draws from
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search brand assets…"
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
            pageKey="marketing-brand-assets"
            snapshot={{ search, filters, density }}
            onApply={applyView}
          />
        }
        onExport={() => {
          exportToCsv(filtered);
          toast.success("Brand Assets exported.");
        }}
        onCreate={() => setUploadOpen(true)}
        createLabel="Upload"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveBrandAssets(selected);
              toast.success(`${selected.length} asset${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteBrandAsset(id));
              toast.success(`${selected.length} asset${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {assets.length === 0 ? (
          <EmptyState
            icon={Palette}
            title="No brand assets yet"
            description="Upload your logo, color palette, typography, and guidelines so every campaign draws from one source of truth."
            action={
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                Upload asset
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
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", CARD_GRID_DENSITY_CLASS[density])}>
            {pagination.pageItems.map((asset) => {
              const Icon = CATEGORY_ICON[asset.category];
              return (
                <div key={asset.id} className="bg-card flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selected.includes(asset.id)}
                        onCheckedChange={() =>
                          setSelected((prev) =>
                            prev.includes(asset.id)
                              ? prev.filter((id) => id !== asset.id)
                              : [...prev, asset.id],
                          )
                        }
                        aria-label={`Select ${asset.name}`}
                      />
                      <Badge variant="secondary" className="font-medium">
                        <Icon className="size-3" />
                        {asset.category}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            aria-label={`Actions for ${asset.name}`}
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setOpenAsset(asset)}>Open</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const copy = duplicateBrandAsset(asset.id);
                            if (copy) toast.success(`${copy.name} created.`);
                          }}
                        >
                          <Copy className="size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            archiveBrandAssets([asset.id]);
                            toast.success(`${asset.name} archived.`);
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            deleteBrandAsset(asset.id);
                            toast.success(`${asset.name} permanently deleted.`);
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <button onClick={() => setOpenAsset(asset)} className="text-left">
                    <p className="truncate text-sm font-semibold hover:underline">{asset.name}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{asset.description}</p>
                  </button>

                  <div className="mt-auto border-t pt-2">
                    <span className="text-muted-foreground text-[11px]">{asset.sizeLabel}</span>
                  </div>
                </div>
              );
            })}
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
        <BrandAssetDetailSheet
          asset={openAsset}
          open={!!openAsset}
          onOpenChange={(open) => !open && setOpenAsset(null)}
        />
      ) : null}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload brand asset</DialogTitle>
            <DialogDescription>
              Add a logo, palette, typography reference, template, or guideline document.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) =>
                setUploadForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))
              }
              className="text-sm"
            />
            <Field id="brand-upload-category" label="Category">
              <Select
                value={uploadForm.category}
                onValueChange={(value) =>
                  value && setUploadForm((f) => ({ ...f, category: value as BrandAssetCategory }))
                }
              >
                <SelectTrigger id="brand-upload-category" className="w-full">
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
            <Field id="brand-upload-description" label="Description">
              <Textarea
                id="brand-upload-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
