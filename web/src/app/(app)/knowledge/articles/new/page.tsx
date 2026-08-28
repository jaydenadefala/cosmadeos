"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NewPageLayout } from "@/components/ui/new-page-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/lib/mock-data/employees";
import { useMeetings } from "@/lib/mock-data/meetings";
import {
  addKnowledgeBaseEntry,
  KNOWLEDGE_BASE_SECTIONS,
  type KnowledgeBaseSection,
} from "@/lib/mock-data/knowledge-base";

/**
 * Knowledge Editor — Knowledge Base workspace (05 Department Operating
 * Systems/Knowledge/knowledge-operating-system.md: "Knowledge Editor — a New
 * Page pattern... Supports Drag & Drop for organizing content... never a
 * modal"). A genuine New Page per ADR-003, distinct from the lighter
 * Dialog-based creation used by Handbooks/SOPs elsewhere — this workspace's
 * own source doc names the New Page authoring surface explicitly.
 */
export default function KnowledgeEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const employees = useEmployees();
  const meetings = useMeetings();

  const sectionParam = searchParams.get("section") as KnowledgeBaseSection | null;
  const initialSection: KnowledgeBaseSection =
    sectionParam && KNOWLEDGE_BASE_SECTIONS.includes(sectionParam) ? sectionParam : "Best Practice";

  // Only resolve once the session has actually loaded — falling back to
  // employees[0] before then would "win" the once-only effect below and
  // never get corrected once the real signed-in employee is known.
  const defaultAuthor = React.useMemo(() => {
    if (sessionStatus !== "authenticated") return "";
    return employees.find((e) => e.email === session?.user?.email)?.id ?? employees[0]?.id ?? "";
  }, [employees, session, sessionStatus]);

  const [form, setForm] = React.useState({
    section: initialSection,
    title: "",
    category: "",
    summary: "",
    content: "",
    authorId: "",
    relatedMeetingId: "",
  });

  // Author defaults to the signed-in employee once resolved.
  React.useEffect(() => {
    if (defaultAuthor && !form.authorId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the draft's author to the resolved session employee once, not a derived-render value
      setForm((f) => ({ ...f, authorId: defaultAuthor }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAuthor]);

  const canSave = form.title.trim().length > 0 && form.summary.trim().length > 0 && !!form.authorId;

  function save() {
    if (!canSave) {
      toast.error("Give this entry a title, a summary, and an author before saving.");
      return;
    }
    const entry = addKnowledgeBaseEntry({
      section: form.section,
      title: form.title.trim(),
      category: form.category.trim() || form.section,
      summary: form.summary.trim(),
      content: form.content.trim(),
      authorId: form.authorId,
      relatedMeetingId: form.relatedMeetingId || undefined,
    });
    toast.success(`${entry.title} added to ${entry.section}s.`);
    router.push(`/knowledge/articles/${entry.id}`);
  }

  return (
    <NewPageLayout
      title="Knowledge Editor"
      subtitle="Document a template, meeting note, lesson learned, or best practice for the whole organization"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={!canSave}>
            Save
          </Button>
        </>
      }
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field id="entry-section" label="Section">
            <Select
              value={form.section}
              onValueChange={(value) => value && setForm((f) => ({ ...f, section: value as KnowledgeBaseSection }))}
            >
              <SelectTrigger id="entry-section" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {KNOWLEDGE_BASE_SECTIONS.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="entry-category" label="Category">
            <Input
              id="entry-category"
              placeholder="e.g. Sales, Operations, Finance"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
        </div>

        <Field id="entry-title" label="Title">
          <Input
            id="entry-title"
            placeholder="e.g. Running a Strong Equipment Demo"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />
        </Field>

        <Field id="entry-summary" label="Summary">
          <Textarea
            id="entry-summary"
            placeholder="One or two sentences describing what this covers"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            rows={2}
          />
        </Field>

        <Field id="entry-content" label="Content">
          <Textarea
            id="entry-content"
            placeholder="Write the full content here…"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={10}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field id="entry-author" label="Author">
            <Select
              value={form.authorId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, authorId: value }))}
            >
              <SelectTrigger id="entry-author" className="w-full">
                <SelectValue>{(value: string) => employees.find((e) => e.id === value)?.name ?? "Select an author"}</SelectValue>
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

          {form.section === "Meeting Notes" ? (
            <Field id="entry-meeting" label="Related meeting (optional)">
              <Select
                value={form.relatedMeetingId || "none"}
                onValueChange={(value) => value && setForm((f) => ({ ...f, relatedMeetingId: value === "none" ? "" : value }))}
              >
                <SelectTrigger id="entry-meeting" className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === "none" || !value ? "None" : meetings.find((m) => m.id === value)?.title ?? "None"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {meetings.map((meeting) => (
                    <SelectItem key={meeting.id} value={meeting.id}>
                      {meeting.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </div>
      </div>
    </NewPageLayout>
  );
}
