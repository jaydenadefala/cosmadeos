"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCampaigns } from "@/lib/mock-data/campaigns";
import {
  addContentPost,
  CONTENT_STATUSES,
  CONTENT_TYPES,
  setPostStatus,
  updateContentPost,
  type ContentPost,
  type ContentStatus,
  type ContentType,
} from "@/lib/mock-data/content-posts";
import { useEmployees } from "@/lib/mock-data/employees";

const NO_CAMPAIGN = "none";
const UNASSIGNED = "unassigned";

/**
 * Create/Edit panel for a Content Post — a Sheet (side drawer), per ADR-003.
 * Content posts are lighter-weight than a Campaign (no approval workflow,
 * no budget), so unlike Campaign Builder they don't warrant a full New Page
 * — same reasoning already applied to Team Documents and Creative Assets.
 * Handles both create (no `post` prop) and edit in one component.
 */
export function ContentPostEditSheet({
  post,
  defaultDate,
  open,
  onOpenChange,
}: {
  post?: ContentPost;
  defaultDate?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const campaigns = useCampaigns();
  const employees = useEmployees();
  const [form, setForm] = React.useState({
    title: post?.title ?? "",
    contentType: post?.contentType ?? ("Social Post" as ContentType),
    scheduledDate: post?.scheduledDate ?? defaultDate ?? "",
    campaignId: post?.campaignId ?? NO_CAMPAIGN,
    authorId: post?.authorId ?? UNASSIGNED,
    status: post?.status ?? ("Draft" as ContentStatus),
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        title: post?.title ?? "",
        contentType: post?.contentType ?? "Social Post",
        scheduledDate: post?.scheduledDate ?? defaultDate ?? "",
        campaignId: post?.campaignId ?? NO_CAMPAIGN,
        authorId: post?.authorId ?? UNASSIGNED,
        status: post?.status ?? "Draft",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    if (!form.title.trim()) {
      toast.error("Give this content a title.");
      return;
    }
    const campaignId = form.campaignId === NO_CAMPAIGN ? undefined : form.campaignId;
    const authorId = form.authorId === UNASSIGNED ? undefined : form.authorId;

    if (post) {
      updateContentPost(post.id, {
        title: form.title,
        contentType: form.contentType,
        scheduledDate: form.scheduledDate,
        campaignId,
        authorId,
      });
      setPostStatus(post.id, form.status);
      toast.success(`${form.title} saved.`);
    } else {
      addContentPost({
        title: form.title,
        contentType: form.contentType,
        scheduledDate: form.scheduledDate,
        campaignId,
        authorId,
      });
      toast.success(`${form.title} added to the calendar as a draft.`);
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{post ? "Edit content" : "New content"}</SheetTitle>
          <SheetDescription>
            {post ? `Update "${post.title}".` : "Schedule a new piece of content."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="content-title" label="Title">
            <Input
              id="content-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              autoFocus
            />
          </Field>
          <Field id="content-type" label="Type">
            <Select
              value={form.contentType}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, contentType: value as ContentType }))
              }
            >
              <SelectTrigger id="content-type" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="content-date" label="Scheduled date">
            <Input
              id="content-date"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
            />
          </Field>
          <Field id="content-campaign" label="Campaign">
            <Select
              value={form.campaignId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, campaignId: value }))}
            >
              <SelectTrigger id="content-campaign" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NO_CAMPAIGN
                      ? "Not linked to a campaign"
                      : (campaigns.find((c) => c.id === value)?.name ?? "Not linked to a campaign")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CAMPAIGN}>Not linked to a campaign</SelectItem>
                {campaigns
                  .filter((c) => !c.archived)
                  .map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          {post ? (
            <Field id="content-status" label="Status">
              <Select
                value={form.status}
                onValueChange={(value) => value && setForm((f) => ({ ...f, status: value as ContentStatus }))}
              >
                <SelectTrigger id="content-status" className="w-full">
                  <SelectValue>{(value: string) => value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
          <Field id="content-author" label="Author">
            <Select
              value={form.authorId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, authorId: value }))}
            >
              <SelectTrigger id="content-author" className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === UNASSIGNED
                      ? "Unassigned"
                      : (employees.find((e) => e.id === value)?.name ?? "Unassigned")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {employees
                  .filter((e) => !e.archived)
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <SheetFooter>
          <Button onClick={save}>{post ? "Save changes" : "Add to calendar"}</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
