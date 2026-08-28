"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Send } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment, useComments } from "@/lib/mock-data/comments";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Comments tab/section for any object's detail page — every entity needs
 * Comments per CLAUDE.md "Functionality-First Implementation Rules". Shared
 * across Companies/Contacts/Leads/Meetings/Playbooks rather than rebuilt
 * per entity.
 */
export function EntityComments({ entityKey }: { entityKey: string }) {
  const { data: session } = useSession();
  const comments = useComments(entityKey);
  const [draft, setDraft] = React.useState("");

  const userName = session?.user?.name ?? "You";
  const userInitials = initialsOf(userName);

  function submit() {
    if (!draft.trim()) return;
    addComment(entityKey, userName, userInitials, draft.trim());
    setDraft("");
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-start gap-2.5">
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
          />
          <Button size="sm" className="self-end gap-1.5" onClick={submit} disabled={!draft.trim()}>
            <Send className="size-3.5" />
            Comment
          </Button>
        </div>
      </div>

      {comments.length === 0 ? (
        <p className="text-muted-foreground text-sm">No comments yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="text-xs">{comment.authorInitials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-muted-foreground text-xs">{comment.createdLabel}</span>
                </div>
                <p className="text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
