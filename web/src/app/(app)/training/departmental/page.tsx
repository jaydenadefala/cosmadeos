"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building, Rows3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Density } from "@/components/ui/page-toolbar";
import { Pagination, usePagination } from "@/components/ui/pagination";
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
import { assignTraining, TRAINING_CATEGORIES, useTrainingAssignments, type TrainingCategory } from "@/lib/mock-data/training-assignments";

/**
 * Departmental Training — Training Center sidebar (05 Department Operating
 * Systems/Training/training-operating-system.md: "departmental training
 * assignment"). Groups HR's training-assignments.ts by real Employee
 * department — the same underlying record set as /hr/training, rolled up
 * for a department-level view rather than forked into new data.
 */
export default function DepartmentalTrainingPage() {
  const employees = useEmployees();
  const assignments = useTrainingAssignments();
  const courses = useCourses();
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [assignForm, setAssignForm] = React.useState({
    department: "",
    employeeId: "",
    courseId: "",
    category: "Compliance" as TrainingCategory,
    dueDate: "",
  });

  const activeAssignments = React.useMemo(() => assignments.filter((a) => !a.archived), [assignments]);

  const departments = React.useMemo(() => Array.from(new Set(employees.map((e) => e.department))).sort(), [employees]);

  const rollup = React.useMemo(() => {
    return departments.map((department) => {
      const deptEmployeeIds = new Set(employees.filter((e) => e.department === department).map((e) => e.id));
      const rows = activeAssignments.filter((a) => deptEmployeeIds.has(a.employeeId));
      const completed = rows.filter((a) => a.status === "Completed").length;
      return {
        department,
        employeeCount: deptEmployeeIds.size,
        assignmentCount: rows.length,
        completed,
        rate: rows.length > 0 ? Math.round((completed / rows.length) * 100) : 0,
      };
    });
  }, [departments, employees, activeAssignments]);

  const pagination = usePagination(rollup);

  const employeesInDepartment = employees.filter((e) => e.department === assignForm.department);

  function handleAssign() {
    if (!assignForm.employeeId || !assignForm.courseId || !assignForm.dueDate) {
      toast.error("Choose a department, employee, course, and due date.");
      return;
    }
    assignTraining({
      employeeId: assignForm.employeeId,
      courseId: assignForm.courseId,
      category: assignForm.category,
      dueDate: assignForm.dueDate,
    });
    toast.success("Training assigned.");
    setAssignOpen(false);
    setAssignForm({ department: "", employeeId: "", courseId: "", category: "Compliance", dueDate: "" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold">Departmental Training</h1>
        <p className="text-muted-foreground text-sm">Training assignment completion rolled up by department</p>
      </div>

      <div className="flex items-center justify-end gap-2 border-b px-4 py-3 sm:px-6">
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
        <Button size="sm" onClick={() => setAssignOpen(true)}>
          Assign Training
        </Button>
        <Link href="/hr/training">
          <Button size="sm" variant="outline">
            View all assignments
          </Button>
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        {rollup.length === 0 ? (
          <EmptyState icon={Building} title="No departments yet" description="Add employees in HR to see departmental rollups." />
        ) : (
          <Table density={density}>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.pageItems.map((row) => (
                <TableRow key={row.department}>
                  <TableCell className="font-medium">{row.department}</TableCell>
                  <TableCell>{row.employeeCount}</TableCell>
                  <TableCell>{row.assignmentCount}</TableCell>
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
        itemLabel="departments"
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign training by department</DialogTitle>
            <DialogDescription>Choose a department, then an employee within it.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="dept-select" label="Department">
              <Select
                value={assignForm.department}
                onValueChange={(value) => value && setAssignForm((f) => ({ ...f, department: value, employeeId: "" }))}
              >
                <SelectTrigger id="dept-select" className="w-full">
                  <SelectValue>{(value: string) => value || "Select a department…"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="dept-employee" label="Employee">
              <Select
                value={assignForm.employeeId}
                onValueChange={(value) => value && setAssignForm((f) => ({ ...f, employeeId: value }))}
              >
                <SelectTrigger id="dept-employee" className="w-full">
                  <SelectValue>
                    {(value: string) => employeesInDepartment.find((e) => e.id === value)?.name ?? "Select an employee…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {employeesInDepartment.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="dept-course" label="Course">
              <Select
                value={assignForm.courseId}
                onValueChange={(value) => value && setAssignForm((f) => ({ ...f, courseId: value }))}
              >
                <SelectTrigger id="dept-course" className="w-full">
                  <SelectValue>{(value: string) => courses.find((c) => c.id === value)?.title ?? "Select a course…"}</SelectValue>
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
            <Field id="dept-category" label="Category">
              <Select
                value={assignForm.category}
                onValueChange={(value) => value && setAssignForm((f) => ({ ...f, category: value as TrainingCategory }))}
              >
                <SelectTrigger id="dept-category" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="dept-due-date" label="Due date">
              <Input
                id="dept-due-date"
                type="date"
                value={assignForm.dueDate}
                onChange={(e) => setAssignForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
