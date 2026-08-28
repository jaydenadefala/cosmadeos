"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/**
 * Universal Object Layout standard tab set —
 * 04 Enterprise Architecture/enterprise-information-architecture.md:
 * "Every object page contains: Overview, Activity, Relationships, Documents,
 * Knowledge, Tasks, Timeline, Analytics, AI Assistant, History,
 * Settings (where applicable)." Naming is standardized platform-wide —
 * departments do not get to rename or reorder these (CLAUDE.md Naming
 * Conventions). Only the tabs a given object actually supplies render,
 * but always in this canonical order.
 */
export const OBJECT_TAB_ORDER = [
  "overview",
  "activity",
  "relationships",
  "documents",
  "knowledge",
  "tasks",
  "timeline",
  "analytics",
  "ai",
  "history",
  "settings",
] as const;

export type ObjectTabId = (typeof OBJECT_TAB_ORDER)[number];

const TAB_LABELS: Record<ObjectTabId, string> = {
  overview: "Overview",
  activity: "Activity",
  relationships: "Relationships",
  documents: "Documents",
  knowledge: "Knowledge",
  tasks: "Tasks",
  timeline: "Timeline",
  analytics: "Analytics",
  ai: "AI",
  history: "History",
  settings: "Settings",
};

export function ObjectTabs({
  tabs,
  defaultTab,
}: {
  tabs: Partial<Record<ObjectTabId, React.ReactNode>>;
  defaultTab?: ObjectTabId;
}) {
  const activeTabs = OBJECT_TAB_ORDER.filter((id) => tabs[id] !== undefined);
  if (activeTabs.length === 0) return null;

  return (
    <Tabs defaultValue={defaultTab ?? activeTabs[0]} className="min-h-0 flex-1 gap-0">
      <div className="border-b px-4 sm:px-6">
        <ScrollArea>
          <TabsList className="h-auto gap-1 bg-transparent p-0">
            {activeTabs.map((id) => (
              <TabsTrigger
                key={id}
                value={id}
                className="data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {TAB_LABELS[id]}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
      {activeTabs.map((id) => (
        <TabsContent key={id} value={id} className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          {tabs[id]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
