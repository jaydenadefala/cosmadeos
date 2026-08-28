"use client";

import * as React from "react";
import { Share2, Star, MoreHorizontal, Sparkles, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ObjectHeaderTone = "default" | "success" | "warning" | "destructive";

const toneClasses: Record<ObjectHeaderTone, string> = {
  default: "bg-muted text-foreground/70",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
};

export interface ObjectHeaderAction {
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

/**
 * Object Header Standard — 03 Design Principles/universal-page-anatomy.md.
 * "Every object page begins with: Object Icon, Object Name, Status, Owner,
 * Department, Last Updated, Quick Actions, Share, Favorite, AI Summary,
 * Health Indicator, Relationship Count, Approval Status. This standard
 * applies everywhere — no department or object type gets a custom header."
 */
export function ObjectHeader({
  icon: Icon,
  name,
  status,
  owner,
  department,
  lastUpdated,
  healthIndicator,
  relationshipCount,
  approvalStatus,
  aiSummary,
  onGenerateAiSummary,
  favorited = false,
  onToggleFavorite,
  onShare,
  primaryAction,
  secondaryActions,
  className,
}: {
  icon: LucideIcon;
  name: string;
  status?: { label: string; tone?: ObjectHeaderTone };
  owner?: { name: string; initials: string };
  department?: string;
  lastUpdated?: string;
  healthIndicator?: { label: string; tone: ObjectHeaderTone };
  relationshipCount?: number;
  approvalStatus?: { label: string; tone?: ObjectHeaderTone };
  aiSummary?: string;
  onGenerateAiSummary?: () => void;
  favorited?: boolean;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  primaryAction?: ObjectHeaderAction;
  secondaryActions?: ObjectHeaderAction[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 border-b px-4 py-4 sm:px-6", className)}>
      <div className="flex items-start gap-3">
        <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {status ? (
              <Badge className={cn("border-0 font-medium", toneClasses[status.tone ?? "default"])}>
                {status.label}
              </Badge>
            ) : null}
            {owner ? (
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Avatar className="size-4">
                  <AvatarFallback className="text-[9px]">{owner.initials}</AvatarFallback>
                </Avatar>
                {owner.name}
              </span>
            ) : null}
            {department ? <span className="text-muted-foreground">{department}</span> : null}
            {lastUpdated ? (
              <span className="text-muted-foreground">Updated {lastUpdated}</span>
            ) : null}
            {healthIndicator ? (
              <span className={cn("flex items-center gap-1 font-medium", toneClasses[healthIndicator.tone].split(" ")[1])}>
                <span className={cn("size-1.5 rounded-full", toneClasses[healthIndicator.tone].split(" ")[0].replace("/10", ""))} />
                {healthIndicator.label}
              </span>
            ) : null}
            {approvalStatus ? (
              <Badge variant="outline" className="font-normal">
                {approvalStatus.label}
              </Badge>
            ) : null}
            {typeof relationshipCount === "number" ? (
              <span className="text-muted-foreground">
                {relationshipCount} relationship{relationshipCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                  aria-pressed={favorited}
                  onClick={onToggleFavorite}
                />
              }
            >
              <Star className={cn("size-4", favorited && "fill-current text-amber-500")} />
            </TooltipTrigger>
            <TooltipContent>{favorited ? "Favorited" : "Add to favorites"}</TooltipContent>
          </Tooltip>

          {onShare ? (
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Share" onClick={onShare} />}>
                <Share2 className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          ) : null}

          {secondaryActions && secondaryActions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="More actions" />}>
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {secondaryActions.map((action) => (
                  <DropdownMenuItem key={action.label} onClick={action.onClick}>
                    {action.icon ? <action.icon className="size-4" /> : null}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {primaryAction ? (
            <Button onClick={primaryAction.onClick} className="ml-1">
              {primaryAction.icon ? <primaryAction.icon className="size-4" /> : null}
              {primaryAction.label}
            </Button>
          ) : null}
        </div>
      </div>

      {aiSummary || onGenerateAiSummary ? (
        <div className="bg-accent/40 flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
          <Sparkles className="text-accent-foreground mt-0.5 size-4 shrink-0" />
          {aiSummary ? (
            <p className="text-foreground/90">{aiSummary}</p>
          ) : (
            <Button variant="link" className="h-auto p-0" onClick={onGenerateAiSummary}>
              Generate AI summary
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
