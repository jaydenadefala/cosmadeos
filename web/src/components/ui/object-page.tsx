import { cn } from "@/lib/utils";
import { ObjectTabs, type ObjectTabId } from "@/components/ui/object-tabs";

/**
 * Universal Object Layout — 04 Enterprise Architecture/enterprise-information-architecture.md:
 * "Every major entity opens as a full-page workspace. Never a cramped modal.
 * Structure: Header → Summary Cards → Tabs." This is the one shared layout
 * every business object (Employee, Customer, Invoice, Campaign, ...) renders
 * through — never a bespoke per-object layout.
 */
export function ObjectPage({
  header,
  summaryCards,
  tabs,
  defaultTab,
  className,
}: {
  header: React.ReactNode;
  summaryCards?: React.ReactNode;
  tabs: Partial<Record<ObjectTabId, React.ReactNode>>;
  defaultTab?: ObjectTabId;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {header}
      {summaryCards ? (
        <div className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-4">
          {summaryCards}
        </div>
      ) : null}
      <ObjectTabs tabs={tabs} defaultTab={defaultTab} />
    </div>
  );
}
