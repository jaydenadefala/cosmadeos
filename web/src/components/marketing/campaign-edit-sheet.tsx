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
import { Textarea } from "@/components/ui/textarea";
import {
  assignDesigner,
  CAMPAIGN_CHANNELS,
  updateCampaign,
  type Campaign,
  type CampaignChannel,
} from "@/lib/mock-data/campaigns";
import { useEmployees } from "@/lib/mock-data/employees";

const UNASSIGNED = "unassigned";

/** Edit panel for a Campaign — a Sheet (side drawer), per ADR-003. Also handles Assign Designer. */
export function CampaignEditSheet({
  campaign,
  open,
  onOpenChange,
}: {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const employees = useEmployees();
  const [form, setForm] = React.useState({
    name: campaign.name,
    objective: campaign.objective,
    description: campaign.description,
    channel: campaign.channel,
    budget: String(campaign.budget),
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    designerId: campaign.designerId ?? UNASSIGNED,
  });

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft to the latest record each time the sheet opens, not a derived-render value
      setForm({
        name: campaign.name,
        objective: campaign.objective,
        description: campaign.description,
        channel: campaign.channel,
        budget: String(campaign.budget),
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        designerId: campaign.designerId ?? UNASSIGNED,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when the sheet transitions open, not on every keystroke
  }, [open]);

  function save() {
    updateCampaign(campaign.id, {
      name: form.name,
      objective: form.objective,
      description: form.description,
      channel: form.channel,
      budget: Number(form.budget) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    assignDesigner(campaign.id, form.designerId === UNASSIGNED ? "" : form.designerId);
    toast.success(`${form.name} saved.`);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit campaign</SheetTitle>
          <SheetDescription>Update &quot;{campaign.name}&quot;&apos;s details.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4">
          <Field id="edit-campaign-name" label="Campaign name">
            <Input
              id="edit-campaign-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field id="edit-campaign-objective" label="Objective">
            <Input
              id="edit-campaign-objective"
              value={form.objective}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
            />
          </Field>
          <Field id="edit-campaign-description" label="Description">
            <Textarea
              id="edit-campaign-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
            />
          </Field>
          <Field id="edit-campaign-channel" label="Channel">
            <Select
              value={form.channel}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, channel: value as CampaignChannel }))
              }
            >
              <SelectTrigger id="edit-campaign-channel" className="w-full">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_CHANNELS.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="edit-campaign-budget" label="Budget (₦)">
            <Input
              id="edit-campaign-budget"
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="edit-campaign-start" label="Start date">
              <Input
                id="edit-campaign-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </Field>
            <Field id="edit-campaign-end" label="End date">
              <Input
                id="edit-campaign-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </Field>
          </div>
          <Field id="edit-campaign-designer" label="Assigned designer">
            <Select
              value={form.designerId}
              onValueChange={(value) => value && setForm((f) => ({ ...f, designerId: value }))}
            >
              <SelectTrigger id="edit-campaign-designer" className="w-full">
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
          <Button onClick={save}>Save changes</Button>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
