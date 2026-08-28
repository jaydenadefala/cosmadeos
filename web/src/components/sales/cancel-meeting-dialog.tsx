"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

/**
 * Cancel Meeting — a Modal, per ADR-003 (destructive/dangerous confirmation),
 * with a required reason field. Built directly on `Dialog` rather than
 * `ConfirmationDialog` since that component has no slot for a text input.
 */
export function CancelMeetingDialog({
  trigger,
  meetingTitle,
  onConfirm,
}: {
  trigger: React.ReactElement;
  meetingTitle: string;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState("");

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setReason("");
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel &quot;{meetingTitle}&quot;?</DialogTitle>
          <DialogDescription>Let the team know why this meeting is being cancelled.</DialogDescription>
        </DialogHeader>
        <Field id="cancel-meeting-reason" label="Reason">
          <Textarea
            id="cancel-meeting-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Customer rescheduled to next week"
            rows={3}
          />
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Keep meeting</DialogClose>
          <DialogClose
            render={
              <Button
                variant="destructive"
                disabled={!reason.trim()}
                onClick={() => onConfirm(reason.trim())}
              />
            }
          >
            Cancel meeting
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
