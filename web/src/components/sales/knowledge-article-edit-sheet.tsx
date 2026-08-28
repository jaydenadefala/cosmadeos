"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { updateKnowledgeArticle, type KnowledgeArticle } from "@/lib/mock-data/knowledge-articles";

/** Edit panel for a Knowledge Article — a Sheet (side drawer), per ADR-003. Saving pushes the prior content onto `versionHistory`. */
export function KnowledgeArticleEditSheet({
  article,
  open,
  onOpenChange,
}: {
  article: KnowledgeArticle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = React.useState({
    title: article.title,
    category: article.category,
    summary: article.summary,
    content: article.content,
  });

  // Genuine external-prop sync — see MEMORY.md / CompanyEditSheet precedent.
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        title: article.title,
        category: article.category,
        summary: article.summary,
        content: article.content,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateKnowledgeArticle(article.id, form);
    toast.success(`${form.title} saved — previous version kept in History.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit article</SheetTitle>
          <SheetDescription>
            Update &quot;{article.title}&quot;. The previous version is kept in History.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-article-title" label="Title">
            <Input
              id="edit-article-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field id="edit-article-category" label="Category">
            <Input
              id="edit-article-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </Field>
          <Field id="edit-article-summary" label="Summary">
            <Textarea
              id="edit-article-summary"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              rows={2}
            />
          </Field>
          <Field id="edit-article-content" label="Content">
            <Textarea
              id="edit-article-content"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8}
            />
          </Field>
        </div>
        <SheetFooter>
          <Button onClick={save}>Save changes</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
