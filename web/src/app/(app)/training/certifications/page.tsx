"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Award, Download, MoreHorizontal, Trash2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { PageToolbar, type Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { SavedViewsMenu } from "@/components/ui/saved-views-menu";
import { useColumnVisibility } from "@/lib/use-column-visibility";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourses } from "@/lib/mock-data/courses";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  archiveCertifications,
  CERTIFICATION_STATUSES,
  deleteCertification,
  issueCertificate,
  revokeCertificate,
  useCertifications,
  type Certification,
  type CertificationStatus,
} from "@/lib/mock-data/certifications";

const STATUS_TONE: Record<CertificationStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Expired: "bg-destructive/10 text-destructive",
};

/** CLAUDE.md's Training action set: "Download Certificate" — a genuine text-file download, same Blob pattern as every CSV export. */
function downloadCertificate(cert: Certification, employeeName: string, courseTitle: string) {
  const content = `COSMADE MEDICAL — CERTIFICATE OF COMPLETION\n\nCertificate No: ${cert.certificateNumber}\nAwarded to: ${employeeName}\nCourse: ${courseTitle}\nIssued: ${cert.issuedDate}${cert.expiryDate ? `\nExpires: ${cert.expiryDate}` : ""}\nStatus: ${cert.status}\n`;
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cert.certificateNumber}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Certifications — Training Center sidebar. CLAUDE.md's Training action set: "Issue Certificate, Download Certificate." */
export default function CertificationsPage() {
  const allCertifications = useCertifications();
  const employees = useEmployees();
  const courses = useCourses();
  const [search, setSearch] = React.useState("");
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [filters, setFilters] = React.useState<Record<string, string | undefined>>({});
  const [selected, setSelected] = React.useState<string[]>([]);
  const [issueOpen, setIssueOpen] = React.useState(false);
  const [issueForm, setIssueForm] = React.useState({ employeeId: "", courseId: "", expiryDate: "" });
  const columnVisibility = useColumnVisibility([
    { id: "course", label: "Course" },
    { id: "issued", label: "Issued" },
    { id: "expires", label: "Expires" },
  ]);

  const certifications = React.useMemo(() => allCertifications.filter((c) => !c.archived), [allCertifications]);

  const employeeById = React.useMemo(() => {
    const map = new Map<string, (typeof employees)[number]>();
    for (const employee of employees) map.set(employee.id, employee);
    return map;
  }, [employees]);

  const courseById = React.useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    for (const course of courses) map.set(course.id, course);
    return map;
  }, [courses]);

  const filterFields: FilterFieldConfig[] = React.useMemo(
    () => [{ id: "status", label: "Status", options: CERTIFICATION_STATUSES.map((s) => ({ value: s, label: s })) }],
    [],
  );

  const filtered = React.useMemo(() => {
    let rows = certifications;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (c) =>
          employeeById.get(c.employeeId)?.name.toLowerCase().includes(q) ||
          courseById.get(c.courseId)?.title.toLowerCase().includes(q) ||
          c.certificateNumber.toLowerCase().includes(q),
      );
    }
    if (filters.status) rows = rows.filter((c) => c.status === filters.status);
    return rows;
  }, [certifications, search, filters, employeeById, courseById]);

  const pagination = usePagination(filtered);

  function handleIssue() {
    if (!issueForm.employeeId || !issueForm.courseId) {
      toast.error("Choose an employee and a course.");
      return;
    }
    const cert = issueCertificate({
      employeeId: issueForm.employeeId,
      courseId: issueForm.courseId,
      expiryDate: issueForm.expiryDate || undefined,
    });
    toast.success(`${cert.certificateNumber} issued.`);
    setIssueOpen(false);
    setIssueForm({ employeeId: "", courseId: "", expiryDate: "" });
  }

  function applyView(snapshot: Record<string, unknown>) {
    if (typeof snapshot.search === "string") setSearch(snapshot.search);
    if (snapshot.filters && typeof snapshot.filters === "object") {
      setFilters(snapshot.filters as Record<string, string | undefined>);
    }
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
        <h1 className="text-lg font-semibold">Certifications</h1>
        <p className="text-muted-foreground text-sm">
          Showing {filtered.length} out of {certifications.length} certificates
        </p>
      </div>

      <PageToolbar
        density={density}
        onDensityChange={setDensity}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee, course, or certificate number…"
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
            pageKey="training-certifications"
            snapshot={{ search, filters, density, hiddenColumns: columnVisibility.hiddenIds }}
            onApply={applyView}
          />
        }
        columns={columnVisibility.columns}
        onColumnToggle={columnVisibility.toggle}
        onCreate={() => setIssueOpen(true)}
        createLabel="Issue Certificate"
        selectedCount={selected.length}
        onClearSelection={() => setSelected([])}
        bulkActions={[
          {
            label: "Archive",
            onClick: () => {
              archiveCertifications(selected);
              toast.success(`${selected.length} certificate${selected.length === 1 ? "" : "s"} archived.`);
              setSelected([]);
            },
          },
          {
            label: "Delete",
            variant: "destructive",
            onClick: () => {
              selected.forEach((id) => deleteCertification(id));
              toast.success(`${selected.length} certificate${selected.length === 1 ? "" : "s"} deleted.`);
              setSelected([]);
            },
          },
        ]}
      />
      <ActiveFilterChips fields={filterFields} values={filters} onChange={setFilters} />

      <div className="min-h-0 flex-1 overflow-auto">
        {certifications.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates issued yet"
            description="Issue a certificate once an employee completes a course."
            action={
              <Button size="sm" onClick={() => setIssueOpen(true)}>
                Issue Certificate
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No certificates match your search"
            description="Try a different term or clear your filters."
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
          <div className="p-4 sm:p-6">
            <Table density={density}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                      pagination.pageItems.length > 0 &&
                      pagination.pageItems.every((c) => selected.includes(c.id))
                    }
                    onCheckedChange={() =>
                      setSelected((prev) =>
                        pagination.pageItems.every((c) => prev.includes(c.id))
                          ? prev.filter((id) => !pagination.pageItems.some((c) => c.id === id))
                          : [...new Set([...prev, ...pagination.pageItems.map((c) => c.id)])],
                      )
                    }
                      aria-label="Select all certificates"
                    />
                  </TableHead>
                  <TableHead>Certificate No.</TableHead>
                  <TableHead>Employee</TableHead>
                  {columnVisibility.isVisible("course") ? <TableHead>Course</TableHead> : null}
                  {columnVisibility.isVisible("issued") ? <TableHead>Issued</TableHead> : null}
                  {columnVisibility.isVisible("expires") ? <TableHead>Expires</TableHead> : null}
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((cert) => {
                  const employee = employeeById.get(cert.employeeId);
                  const course = courseById.get(cert.courseId);
                  return (
                    <TableRow key={cert.id} data-state={selected.includes(cert.id) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(cert.id)}
                          onCheckedChange={() =>
                            setSelected((prev) => (prev.includes(cert.id) ? prev.filter((id) => id !== cert.id) : [...prev, cert.id]))
                          }
                          aria-label={`Select ${cert.certificateNumber}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/training/certifications/${cert.id}`} className="hover:underline">
                          {cert.certificateNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{employee?.name ?? "—"}</TableCell>
                      {columnVisibility.isVisible("course") ? <TableCell>{course?.title ?? "—"}</TableCell> : null}
                      {columnVisibility.isVisible("issued") ? <TableCell>{cert.issuedDate}</TableCell> : null}
                      {columnVisibility.isVisible("expires") ? <TableCell>{cert.expiryDate ?? "—"}</TableCell> : null}
                      <TableCell>
                        <Badge className={`border-0 font-medium ${STATUS_TONE[cert.status]}`}>{cert.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" aria-label={`Actions for ${cert.certificateNumber}`} />}
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => downloadCertificate(cert, employee?.name ?? "—", course?.title ?? "—")}
                            >
                              <Download className="size-4" />
                              Download Certificate
                            </DropdownMenuItem>
                            {cert.status === "Active" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  revokeCertificate(cert.id);
                                  toast.success(`${cert.certificateNumber} marked Expired.`);
                                }}
                              >
                                Mark Expired
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => {
                                archiveCertifications([cert.id]);
                                toast.success(`${cert.certificateNumber} archived.`);
                              }}
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                deleteCertification(cert.id);
                                toast.success(`${cert.certificateNumber} permanently deleted.`);
                              }}
                            >
                              <Trash2 className="size-4" />
                              Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        itemLabel="certificates"
      />

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue certificate</DialogTitle>
            <DialogDescription>Issue a certificate of completion to an employee.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="issue-employee" label="Employee">
              <Select
                value={issueForm.employeeId}
                onValueChange={(value) => value && setIssueForm((f) => ({ ...f, employeeId: value }))}
              >
                <SelectTrigger id="issue-employee" className="w-full">
                  <SelectValue>{(value: string) => employeeById.get(value)?.name ?? "Select an employee…"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="issue-course" label="Course">
              <Select value={issueForm.courseId} onValueChange={(value) => value && setIssueForm((f) => ({ ...f, courseId: value }))}>
                <SelectTrigger id="issue-course" className="w-full">
                  <SelectValue>{(value: string) => courseById.get(value)?.title ?? "Select a course…"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="issue-expiry" label="Expiry date (optional)">
              <Input
                id="issue-expiry"
                type="date"
                value={issueForm.expiryDate}
                onChange={(e) => setIssueForm((f) => ({ ...f, expiryDate: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleIssue}>Issue certificate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
