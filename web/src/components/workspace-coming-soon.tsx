import { Construction } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

/**
 * Shared placeholder for any workspace/page not yet built. Keeps the shell
 * fully navigable during Phase 1 without faking Phase 5+ content.
 */
export function WorkspaceComingSoon({
  workspace,
  phase,
}: {
  workspace: string;
  phase: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={Construction}
        title={`${workspace} — not yet built`}
        description={`This page is scoped in ${phase} of ROADMAP.md but hasn't been implemented yet.`}
      />
    </div>
  );
}
