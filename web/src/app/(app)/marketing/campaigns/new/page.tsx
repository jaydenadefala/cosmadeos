"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { addCampaign, CAMPAIGN_CHANNELS, type CampaignChannel } from "@/lib/mock-data/campaigns";

/**
 * Campaign Builder — Marketing sidebar (05 Department Operating Systems/
 * Marketing/marketing-operating-system.md). A mandatory New Page per
 * ADR-003 (complex authoring work, never a modal/drawer), built on the
 * shared NewPageLayout. Saves as a Draft campaign; approval, scheduling
 * follow-up, and designer assignment happen from the campaign detail page.
 */
export default function CampaignBuilderPage() {
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "",
    objective: "",
    description: "",
    channel: "Email" as CampaignChannel,
    budget: "",
    startDate: "",
    endDate: "",
  });

  const canSave = form.name.trim().length > 0 && form.objective.trim().length > 0;

  function save() {
    if (!canSave) {
      toast.error("Give the campaign a name and objective before saving.");
      return;
    }
    const campaign = addCampaign({
      name: form.name.trim(),
      objective: form.objective.trim(),
      description: form.description.trim(),
      channel: form.channel,
      budget: Number(form.budget) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    toast.success(`${campaign.name} created as a draft.`);
    router.push(`/marketing/campaigns/${campaign.id}`);
  }

  return (
    <NewPageLayout
      title="New Campaign"
      subtitle="Draft a campaign — approve and launch it from the campaign page"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={!canSave}>
            Save draft
          </Button>
        </>
      }
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4 sm:p-6">
        <Field id="campaign-name" label="Campaign name">
          <Input
            id="campaign-name"
            placeholder="e.g. Q4 Regional Distributor Push"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
        </Field>

        <Field id="campaign-objective" label="Objective">
          <Input
            id="campaign-objective"
            placeholder="What should this campaign achieve?"
            value={form.objective}
            onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
          />
        </Field>

        <Field id="campaign-description" label="Description">
          <Textarea
            id="campaign-description"
            placeholder="Audience, key message, creative approach…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field id="campaign-channel" label="Channel">
            <Select
              value={form.channel}
              onValueChange={(value) =>
                value && setForm((f) => ({ ...f, channel: value as CampaignChannel }))
              }
            >
              <SelectTrigger id="campaign-channel" className="w-full">
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

          <Field id="campaign-budget" label="Budget (₦)">
            <Input
              id="campaign-budget"
              type="number"
              min={0}
              placeholder="0"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field id="campaign-start" label="Start date">
            <Input
              id="campaign-start"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </Field>
          <Field id="campaign-end" label="End date">
            <Input
              id="campaign-end"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </Field>
        </div>
      </div>
    </NewPageLayout>
  );
}
