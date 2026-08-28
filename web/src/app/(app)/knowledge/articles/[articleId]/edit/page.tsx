"use client";

import * as React from "react";
import { notFound, useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NewPageLayout } from "@/components/ui/new-page-layout";
import { Textarea } from "@/components/ui/textarea";
import { updateKnowledgeBaseEntry, useKnowledgeBaseEntries } from "@/lib/mock-data/knowledge-base";

/**
 * Knowledge Editor (edit mode) — reuses the same New Page pattern as
 * creation (/knowledge/articles/new). Editing a Knowledge Base entry is
 * itself authoring work, so per ADR-003 it stays on a New Page rather than
 * dropping into a Sheet/modal the way lighter reference content elsewhere
 * (Handbooks, SOPs, Playbooks) does.
 */
export default function KnowledgeEditorEditPage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = use(params);
  const router = useRouter();
  const allEntries = useKnowledgeBaseEntries();
  const entry = allEntries.find((e) => e.id === articleId);

  const [form, setForm] = React.useState(() => ({
    title: entry?.title ?? "",
    category: entry?.category ?? "",
    summary: entry?.summary ?? "",
    content: entry?.content ?? "",
  }));

  if (!entry) notFound();

  const canSave = form.title.trim().length > 0 && form.summary.trim().length > 0;

  function save() {
    if (!entry || !canSave) {
      toast.error("Give this entry a title and a summary before saving.");
      return;
    }
    updateKnowledgeBaseEntry(entry.id, {
      title: form.title.trim(),
      category: form.category.trim() || entry.category,
      summary: form.summary.trim(),
      content: form.content.trim(),
    });
    toast.success(`${form.title.trim()} updated.`);
    router.push(`/knowledge/articles/${entry.id}`);
  }

  return (
    <NewPageLayout
      title={`Edit — ${entry.title}`}
      subtitle={`${entry.section} · previous version saved to History automatically`}
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
        <Field id="edit-category" label="Category">
          <Input
            id="edit-category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
        </Field>

        <Field id="edit-title" label="Title">
          <Input
            id="edit-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus
          />
        </Field>

        <Field id="edit-summary" label="Summary">
          <Textarea
            id="edit-summary"
            value={form.summary}
            onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            rows={2}
          />
        </Field>

        <Field id="edit-content" label="Content">
          <Textarea
            id="edit-content"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={10}
          />
        </Field>
      </div>
    </NewPageLayout>
  );
}
