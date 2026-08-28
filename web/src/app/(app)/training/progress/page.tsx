"use client";

import * as React from "react";
import { toast } from "sonner";
import { Download, Rows3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import type { Density } from "@/components/ui/page-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourseEnrollments } from "@/lib/mock-data/course-enrollments";
import { useCourses } from "@/lib/mock-data/courses";
import { useEmployees } from "@/lib/mock-data/employees";
import { useTrainingAssignments } from "@/lib/mock-data/training-assignments";

/** Client-side CSV export — genuinely generates and downloads a file, no backend needed. */
function exportToCsv(rows: { employee: string; course: string; status: string; progress: number }[]) {
  const header = ["Employee", "Course", "Status", "Progress %"];
  const lines = rows.map((r) => [r.employee, r.course, r.status, String(r.progress)].map((v) => `"${v}"`).join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "training-progress.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Progress — Training Center sidebar (05 Department Operating Systems/
 * Training/training-operating-system.md: "`Progress` functions as an
 * explicit analytics-adjacent sidebar section"). An analytics/overview
 * exception per ADR-002, same category as every workspace's Reports page —
 * computed live from real Course Enrollments, never stored redundantly.
 */
export default function TrainingProgressPage() {
  const enrollments = useCourseEnrollments();
  const courses = useCourses();
  const employees = useEmployees();
  const assignments = useTrainingAssignments();
  const [density, setDensity] = React.useState<Density>("comfortable");

  const activeEnrollments = React.useMemo(() => enrollments.filter((e) => !e.archived), [enrollments]);

  const totals = React.useMemo(() => {
    const completed = activeEnrollments.filter((e) => e.status === "Completed").length;
    const inProgress = activeEnrollments.filter((e) => e.status === "In Progress").length;
    const notStarted = activeEnrollments.filter((e) => e.status === "Not Started").length;
    const overallRate = activeEnrollments.length > 0 ? Math.round((completed / activeEnrollments.length) * 100) : 0;
    return { completed, inProgress, notStarted, overallRate, total: activeEnrollments.length };
  }, [activeEnrollments]);

  const byCourse = React.useMemo(() => {
    return courses
      .filter((c) => !c.archived)
      .map((course) => {
        const rows = activeEnrollments.filter((e) => e.courseId === course.id);
        const completed = rows.filter((e) => e.status === "Completed").length;
        return {
          course,
          enrolled: rows.length,
          completed,
          rate: rows.length > 0 ? Math.round((completed / rows.length) * 100) : 0,
        };
      })
      .filter((r) => r.enrolled > 0);
  }, [courses, activeEnrollments]);

  const csvRows = React.useMemo(
    () =>
      activeEnrollments.map((e) => ({
        employee: employees.find((emp) => emp.id === e.employeeId)?.name ?? "—",
        course: courses.find((c) => c.id === e.courseId)?.title ?? "—",
        status: e.status,
        progress: e.progressPercent,
      })),
    [activeEnrollments, employees, courses],
  );

  const activeAssignments = React.useMemo(() => assignments.filter((a) => !a.archived), [assignments]);
  const assignmentTotals = React.useMemo(() => {
    const completed = activeAssignments.filter((a) => a.status === "Completed").length;
    const inProgress = activeAssignments.filter((a) => a.status === "In Progress").length;
    const notStarted = activeAssignments.filter((a) => a.status === "Not Started").length;
    return { completed, inProgress, notStarted, total: activeAssignments.length };
  }, [activeAssignments]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Progress</h1>
        <p className="text-muted-foreground text-sm">Course completion across the organization</p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <MetricCard label="Total Enrollments" value={String(totals.total)} />
          <MetricCard label="Completed" value={String(totals.completed)} />
          <MetricCard label="In Progress" value={String(totals.inProgress)} />
          <MetricCard label="Not Started" value={String(totals.notStarted)} />
          <MetricCard label="Overall Completion Rate" value={`${totals.overallRate}%`} />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Completion by course</h2>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="Density" />}>
                <Rows3 className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["comfortable", "compact", "dense"] as const).map((d) => (
                  <DropdownMenuCheckboxItem
                    key={d}
                    checked={density === d}
                    onCheckedChange={() => setDensity(d)}
                    closeOnClick={false}
                    className="capitalize"
                  >
                    {d}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                exportToCsv(csvRows);
                toast.success("Progress exported.");
              }}
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>
        {byCourse.length === 0 ? (
          <EmptyState title="No enrollment data yet" description="Assign training to employees to start tracking completion." />
        ) : (
          <Table density={density}>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCourse.map((row) => (
                <TableRow key={row.course.id}>
                  <TableCell className="font-medium">{row.course.title}</TableCell>
                  <TableCell>{row.enrolled}</TableCell>
                  <TableCell>{row.completed}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {row.rate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="mt-8 mb-4">
          <h2 className="text-sm font-semibold">HR training assignments (due-date checklist)</h2>
          <p className="text-muted-foreground text-xs">
            Separate from course enrollment above — see /hr/training for the underlying record set.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Assignments" value={String(assignmentTotals.total)} />
          <MetricCard label="Completed" value={String(assignmentTotals.completed)} />
          <MetricCard label="In Progress" value={String(assignmentTotals.inProgress)} />
          <MetricCard label="Not Started" value={String(assignmentTotals.notStarted)} />
        </div>
      </div>
    </div>
  );
}
