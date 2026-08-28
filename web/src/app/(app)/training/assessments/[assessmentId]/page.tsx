"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityComments } from "@/components/ui/entity-comments";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/ui/metric-card";
import { ObjectHeader } from "@/components/ui/object-header";
import { ObjectPage } from "@/components/ui/object-page";
import { RecordStatusBanner } from "@/components/ui/record-status-banner";
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
import { Textarea } from "@/components/ui/textarea";
import { useCourses } from "@/lib/mock-data/courses";
import { useEmployees } from "@/lib/mock-data/employees";
import {
  addQuestion,
  archiveAssessments,
  deleteAssessment,
  recordAttempt,
  useAssessmentAttempts,
  useAssessments,
} from "@/lib/mock-data/assessments";
import { AIAssistantPanel } from "@/components/ui/ai-assistant-panel";
import { RecordHistory, useLogRecordHistory } from "@/components/ui/record-history";

/** Assessment detail page — Universal Object Layout instance. Questions + attempt history for a real Course's quiz. */
export default function AssessmentDetailPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = use(params);
  const router = useRouter();
  const allAssessments = useAssessments();
  const allAttempts = useAssessmentAttempts();
  const courses = useCourses();
  const employees = useEmployees();
  const [questionOpen, setQuestionOpen] = React.useState(false);
  const [questionForm, setQuestionForm] = React.useState({ question: "", optionsText: "", correctIndex: "0" });
  const [attemptOpen, setAttemptOpen] = React.useState(false);
  const [attemptForm, setAttemptForm] = React.useState({ employeeId: "", scorePercent: "" });
  const [deleting, setDeleting] = React.useState(false);

  const logHistory = useLogRecordHistory(`assessment:${assessmentId}`);
  const assessment = allAssessments.find((a) => a.id === assessmentId);
  if (!assessment) {
    if (deleting) return null;
    notFound();
  }

  const course = courses.find((c) => c.id === assessment.courseId);
  const attempts = allAttempts.filter((a) => a.assessmentId === assessment.id);
  const passRate = attempts.length > 0 ? Math.round((attempts.filter((a) => a.result === "Passed").length / attempts.length) * 100) : 0;

  function handleAddQuestion() {
    const options = questionForm.optionsText.split("\n").map((o) => o.trim()).filter(Boolean);
    if (!questionForm.question.trim() || options.length < 2) {
      toast.error("Give the question text and at least two options.");
      return;
    }
    addQuestion(assessment!.id, {
      question: questionForm.question.trim(),
      options,
      correctIndex: Math.min(Number(questionForm.correctIndex) || 0, options.length - 1),
    });
    logHistory("added a question", questionForm.question.trim());
    toast.success("Question added.");
    setQuestionOpen(false);
    setQuestionForm({ question: "", optionsText: "", correctIndex: "0" });
  }

  /** CLAUDE.md's Training action set: "Review Assessment, Retake Assessment" — recording any attempt covers both. */
  function handleRecordAttempt() {
    if (!attemptForm.employeeId || attemptForm.scorePercent === "") {
      toast.error("Choose an employee and enter a score.");
      return;
    }
    const attempt = recordAttempt({
      assessmentId: assessment!.id,
      employeeId: attemptForm.employeeId,
      scorePercent: Number(attemptForm.scorePercent),
    });
    logHistory("recorded an attempt", `${attempt.scorePercent}% — ${attempt.result}`);
    toast.success(`Attempt recorded — ${attempt.result}.`);
    setAttemptOpen(false);
    setAttemptForm({ employeeId: "", scorePercent: "" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {assessment.archived ? (
        <RecordStatusBanner
          status="archived"
          message={`"${assessment.title}" is archived.`}
          onDeletePermanently={() => {
            setDeleting(true);
            deleteAssessment(assessment.id);
            toast.success(`"${assessment.title}" permanently deleted.`);
            router.push("/training/assessments");
          }}
        />
      ) : null}
      <ObjectPage
        header={
          <ObjectHeader
            icon={ClipboardCheck}
            name={assessment.title}
            status={{ label: course?.title ?? "No course" }}
            onShare={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success("Link copied to clipboard.");
            }}
            primaryAction={{ label: "Retake Assessment", icon: RotateCcw, onClick: () => setAttemptOpen(true) }}
            secondaryActions={[
              {
                label: assessment.archived ? "Restore" : "Archive",
                onClick: () => {
                  archiveAssessments([assessment.id]);
                  logHistory("archived this record");
                  toast.success(`"${assessment.title}" was archived.`);
                },
              },
            ]}
          />
        }
        summaryCards={
          <>
            <MetricCard label="Questions" value={String(assessment.questions.length)} icon={ClipboardCheck} />
            <MetricCard label="Passing score" value={`${assessment.passingScorePercent}%`} />
            <MetricCard label="Attempts" value={String(attempts.length)} />
            <MetricCard label="Pass rate" value={`${passRate}%`} />
          </>
        }
        tabs={{
          overview: (
            <div className="flex max-w-2xl flex-col gap-5">
              {course ? (
                <p className="text-sm">
                  Course:{" "}
                  <Link href={`/training/courses/${course.id}`} className="font-medium hover:underline">
                    {course.title}
                  </Link>
                </p>
              ) : null}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Questions</h3>
                  <Button size="sm" variant="outline" onClick={() => setQuestionOpen(true)}>
                    <Plus className="size-4" />
                    Add Question
                  </Button>
                </div>
                {assessment.questions.length === 0 ? (
                  <EmptyState title="No questions yet" description="Add the first question to this quiz." />
                ) : (
                  <div className="flex flex-col gap-2">
                    {assessment.questions.map((q, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <span className="text-sm font-medium">
                          {i + 1}. {q.question}
                        </span>
                        <ul className="text-muted-foreground mt-1 flex flex-col gap-0.5 text-xs">
                          {q.options.map((opt, oi) => (
                            <li key={oi} className={oi === q.correctIndex ? "text-emerald-700 dark:text-emerald-400 font-medium" : ""}>
                              {oi === q.correctIndex ? "✓ " : "· "}
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Attempt history</h3>
                {attempts.length === 0 ? (
                  <EmptyState title="No attempts yet" description="Record an attempt to start tracking results." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium">
                            {employees.find((e) => e.id === attempt.employeeId)?.name ?? "—"}
                          </TableCell>
                          <TableCell>{attempt.scorePercent}%</TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 font-medium ${
                                attempt.result === "Passed"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {attempt.result}
                            </Badge>
                          </TableCell>
                          <TableCell>{attempt.attemptDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          ),
          activity: <EntityComments entityKey={`assessment:${assessment.id}`} />,
          timeline: <p className="text-muted-foreground text-sm">No timeline events yet.</p>,
          ai: <AIAssistantPanel contextKind="training" contextLabel="this assessment" />,
          history: <RecordHistory entityKey={`assessment:${assessment.id}`} />,
          settings: (
            <ConfirmationDialog
              trigger={
                <button className="text-destructive inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                  <Trash2 className="size-4" />
                  Delete permanently
                </button>
              }
              title={`Permanently delete "${assessment.title}"?`}
              description="This cannot be undone. Consider archiving instead if you might need this record again."
              confirmLabel="Delete permanently"
              variant="destructive"
              onConfirm={() => {
                setDeleting(true);
                deleteAssessment(assessment.id);
                toast.success(`"${assessment.title}" permanently deleted.`);
                router.push("/training/assessments");
              }}
            />
          ),
        }}
      />

      <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>One option per line; mark which is correct by its position (0 = first).</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="question-text" label="Question">
              <Textarea
                id="question-text"
                value={questionForm.question}
                onChange={(e) => setQuestionForm((f) => ({ ...f, question: e.target.value }))}
                rows={2}
              />
            </Field>
            <Field id="question-options" label="Options (one per line)">
              <Textarea
                id="question-options"
                value={questionForm.optionsText}
                onChange={(e) => setQuestionForm((f) => ({ ...f, optionsText: e.target.value }))}
                rows={4}
              />
            </Field>
            <Field id="question-correct" label="Correct option index">
              <Input
                id="question-correct"
                type="number"
                min={0}
                value={questionForm.correctIndex}
                onChange={(e) => setQuestionForm((f) => ({ ...f, correctIndex: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleAddQuestion}>Add question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={attemptOpen} onOpenChange={setAttemptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record attempt</DialogTitle>
            <DialogDescription>Log a new or retake attempt for {assessment.title}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 px-4 pb-2">
            <Field id="attempt-employee" label="Employee">
              <Select
                value={attemptForm.employeeId}
                onValueChange={(value) => value && setAttemptForm((f) => ({ ...f, employeeId: value }))}
              >
                <SelectTrigger id="attempt-employee" className="w-full">
                  <SelectValue>{(value: string) => employees.find((e) => e.id === value)?.name ?? "Select an employee…"}</SelectValue>
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
            <Field id="attempt-score" label="Score (%)">
              <Input
                id="attempt-score"
                type="number"
                min={0}
                max={100}
                value={attemptForm.scorePercent}
                onChange={(e) => setAttemptForm((f) => ({ ...f, scorePercent: e.target.value }))}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button onClick={handleRecordAttempt}>Record attempt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
