"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Route, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LearningPathEditSheet } from "@/components/training/learning-path-edit-sheet";
import { useCourses } from "@/lib/mock-data/courses";
import { archiveLearningPaths, deleteLearningPath, useLearningPaths } from "@/lib/mock-data/learning-paths";

/** Learning Paths — Training Center sidebar. Each row is an ordered curriculum of real courses. */
export default function LearningPathsPage() {
  const router = useRouter();
  const allPaths = useLearningPaths();
  const courses = useCourses();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [createOpen, setCreateOpen] = React.useState(false);
  const columnVisibility = useColumnVisibility([
    { id: "department", label: "Target department" },
    { id: "courses", label: "Courses" },
  ]);

  const paths = React.useMemo(() => allPaths.filter((p) => !p.archived), [allPaths]);

  const courseById = React.useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    for (const course of courses) map.set(course.id, course);
    return map;
  }, [courses]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return paths;
    const q = search.trim().toLowerCase();
    return paths.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [paths, search]);

  const pagination = usePagination(filtered);

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.density === "comfortable" || snapshot.density === "compact" || snapshot.density === "dense") {
      setDensity(snapshot.density);
    }
    if (Array.isArray(snapshot.hiddenColumns)) {
      columnVisibility.setHiddenIds(snapshot.hiddenColumns as string[]);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Learning Paths</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {paths.length} paths
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search learning paths…"
        savedViewsControl={
          <SavedViewsMenu
            pageKey="training-learning-paths"
            snapshot={{ search, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setCreateOpen(true)}
        createLabel="New Path"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveLearningPaths(selected);
              toast.success(`${selected.length} path${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteLearningPath(id));
              toast.success(`${selected.length} path${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {paths.length === 0 ? (
          <EmptyState
            icon={Route}
            title="No learning paths yet"
            description="Build a curriculum by sequencing existing courses."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                New Path
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No paths match your search"
            description="Try a different name or clear your search."
            action={
              <Button size="sm" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <div className="p-4 sm:p-6">
            <Table density={density}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                      pagination.pageItems.length > 0 &&
                      pagination.pageItems.every((p) => selected.includes(p.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((p) => prev.includes(p.id))
                          ? prev.filter((id) => !pagination.pageItems.some((p) => p.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((p) => p.id)])],
                      )
                    }
                      aria-label="Select all paths"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  {columnVisibility.isVisible("department") ? <TableHead>Target department</TableHead> : null}
                  {columnVisibility.isVisible("courses") ? <TableHead>Courses</TableHead> : null}
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((path) => (
                  <TableRow key={path.id} data-state={selected.includes(path.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(path.id)}
                        onCheckedChange={() =>
                          setSelected((prev) => (prev.includes(path.id) ? prev.filter((id) => id !== path.id) : [...prev, path.id]))
                        }
                        aria-label={`Select ${path.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <button className="hover:underline" onClick={() => router.push(`/training/learning-paths/${path.id}`)}>
                        {path.title}
                      </button>
                    </TableCell>
                    {columnVisibility.isVisible("department") ? (
                      <TableCell>{path.targetDepartment || "—"}</TableCell>
                    ) : null}
                    {columnVisibility.isVisible("courses") ? (
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {path.courseIds.length} course{path.courseIds.length === 1 ? "" : "s"}
                        </Badge>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {path.courseIds
                            .map((id) => courseById.get(id)?.title)
                            .filter(Boolean)
                            .slice(0, 2)
                            .join(", ")}
                          {path.courseIds.length > 2 ? "…" : ""}
                        </span>
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={`Actions for ${path.title}`} />}>
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/training/learning-paths/${path.id}`)}>Open</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              archiveLearningPaths([path.id]);
                              toast.success(`${path.title} archived.`);
                            }}
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              deleteLearningPath(path.id);
                              toast.success(`${path.title} permanently deleted.`);
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        itemLabel="paths"
      />

      <LearningPathEditSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(path) => router.push(`/training/learning-paths/${path.id}`)}
      />
    </div>
  );
}
