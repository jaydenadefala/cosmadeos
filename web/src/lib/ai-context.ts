import type { WorkspaceId } from "@/lib/navigation";

/**
 * AI Assistant Panel — contextual suggestion sets.
 * Source: 07 Enterprise AI/global-ai-experience.md — "Every workspace includes
 * a contextual AI panel that understands: current page, current user, current
 * permissions, related records, relevant documents, knowledge graph, active
 * workflows." Three worked examples were supplied verbatim (customer, finance,
 * engineering/operations); that document explicitly flags the rest as a gap:
 * "No AI examples were supplied for HR, Marketing, Operations, Knowledge,
 * Training, or Research contexts. These should follow the same
 * contextual-panel pattern once available." The sets below extend the
 * documented pattern to every workspace, per that instruction — clearly
 * labeled as AI suggestions, never auto-executed (CLAUDE.md AI Philosophy:
 * "Users remain in control at all times").
 */
export interface AISuggestion {
  id: string;
  prompt: string;
  response: string;
}

export type AIContextKind =
  | "customer"
  | "finance"
  | "operations"
  | "hr"
  | "sales"
  | "marketing"
  | "knowledge"
  | "training"
  | "research"
  | "documents"
  | "analytics"
  | "administration"
  | "dashboard";

const SUGGESTIONS: Record<AIContextKind, AISuggestion[]> = {
  // Verbatim from the source doc's Customer example.
  customer: [
    {
      id: "summarize-account",
      prompt: "Summarize this account",
      response:
        "This account has been active with no overdue invoices. Recent activity shows steady engagement across support and equipment records. No immediate risk signals detected in the available data.",
    },
    {
      id: "draft-renewal",
      prompt: "Draft a renewal strategy",
      response:
        "Draft: lead with the account's usage trend, propose a renewal 60 days ahead of the current contract end date, and offer a bundled service-plan upgrade based on the equipment currently installed.",
    },
    {
      id: "expansion-opportunities",
      prompt: "Show expansion opportunities",
      response:
        "Based on installed equipment and support case volume, this account may be a candidate for an additional service contract or a training package for newly onboarded staff.",
    },
  ],
  // Verbatim from the source doc's Finance example.
  finance: [
    {
      id: "explain-cash-flow",
      prompt: "Explain cash flow changes",
      response:
        "Cash flow shifted this period primarily due to timing — a larger-than-usual batch of invoices was paid out ahead of schedule, while incoming receivables tracked close to plan.",
    },
    {
      id: "predict-runway",
      prompt: "Predict runway",
      response:
        "At the current burn rate and with no major planned expenses, runway projects to extend comfortably beyond the next two quarters — revisit this estimate after the next forecasting cycle.",
    },
    {
      id: "highlight-budget-risks",
      prompt: "Highlight budget risks",
      response:
        "One category is trending above its planned allocation for this period. Everything else is tracking within its budgeted range.",
    },
  ],
  // Verbatim from the source doc's Engineering example, mapped to Operations
  // (the closest built department — vendors, compliance, field equipment).
  operations: [
    {
      id: "troubleshooting-steps",
      prompt: "Recommend troubleshooting steps",
      response:
        "Start with the most common failure point for this equipment category, then check recent maintenance history before escalating to a full service visit.",
    },
    {
      id: "similar-repair-cases",
      prompt: "Find similar repair cases",
      response:
        "A small number of similar cases were resolved by the same root cause in the past. Worth checking whether the same fix applies here before scheduling a technician.",
    },
  ],
  hr: [
    {
      id: "summarize-performance",
      prompt: "Summarize this employee's history",
      response:
        "Consistent performance ratings across recent review cycles, no open disciplinary items, and current training assignments are on track.",
    },
    {
      id: "onboarding-checklist",
      prompt: "Draft an onboarding checklist",
      response:
        "Draft checklist: equipment provisioning, benefits enrollment deadline, manager 1:1 in week one, required compliance training, 30/60/90-day check-in schedule.",
    },
    {
      id: "retention-risk",
      prompt: "Flag retention risk signals",
      response:
        "No strong risk signals present in the available record data. Recommend a routine check-in as good practice regardless.",
    },
  ],
  sales: [
    {
      id: "summarize-deal",
      prompt: "Summarize this deal",
      response:
        "Deal is progressing through the expected stages with no unusually long stalls. Last recorded activity was within the typical follow-up window for this stage.",
    },
    {
      id: "draft-followup",
      prompt: "Draft a follow-up email",
      response:
        "Draft: thank them for the last conversation, restate the proposed next step, and offer two specific times for a follow-up call this week.",
    },
    {
      id: "next-best-action",
      prompt: "Suggest next best action",
      response:
        "Based on the current stage, scheduling a follow-up meeting is the most common next step that moves deals like this one forward.",
    },
  ],
  marketing: [
    {
      id: "summarize-campaign",
      prompt: "Summarize campaign performance",
      response:
        "Performance is tracking close to plan across the channels in use, with no channel significantly underperforming its target this period.",
    },
    {
      id: "audience-segments",
      prompt: "Suggest audience segments",
      response:
        "Consider segmenting by prior engagement level — a dedicated follow-up sequence for previously-engaged contacts typically outperforms a single broad send.",
    },
    {
      id: "draft-copy",
      prompt: "Draft social copy variations",
      response:
        "Draft variation A (direct/benefit-led), variation B (question-led), variation C (social-proof-led) — test all three against the same audience segment.",
    },
  ],
  knowledge: [
    {
      id: "summarize-article",
      prompt: "Summarize this article",
      response:
        "This article covers the core process end-to-end with no flagged gaps. Last updated within the platform's normal review cadence.",
    },
    {
      id: "related-articles",
      prompt: "Suggest related articles",
      response:
        "A few articles in adjacent categories cover overlapping ground — worth cross-linking so readers don't have to search for them separately.",
    },
    {
      id: "flag-outdated",
      prompt: "Flag outdated content",
      response:
        "Nothing in this article appears to reference a deprecated process based on the available record data.",
    },
  ],
  training: [
    {
      id: "summarize-progress",
      prompt: "Summarize this learner's progress",
      response:
        "On track against the assigned learning path, with completed assessments scoring within the expected passing range.",
    },
    {
      id: "recommend-course",
      prompt: "Recommend next course",
      response:
        "Based on the current learning path, the next logical course continues the same skill track rather than branching into a new one.",
    },
    {
      id: "at-risk-learners",
      prompt: "Flag at-risk learners",
      response:
        "No overdue assignments or failed assessments detected in the available record data for this group.",
    },
  ],
  research: [
    {
      id: "summarize-findings",
      prompt: "Summarize findings",
      response:
        "Findings so far point toward the hypothesis being partially supported — recommend one more validation pass before drawing a final conclusion.",
    },
    {
      id: "compare-prior-research",
      prompt: "Compare to prior research",
      response:
        "This overlaps partially with an earlier project in the same category — worth reviewing that project's conclusions before finalizing this one.",
    },
    {
      id: "draft-executive-summary",
      prompt: "Draft executive summary",
      response:
        "Draft: one-sentence headline finding, three supporting data points, one recommended next action.",
    },
  ],
  documents: [
    {
      id: "summarize-document",
      prompt: "Summarize this document",
      response:
        "This document covers standard terms with nothing unusual flagged relative to similar documents on file.",
    },
    {
      id: "extract-key-terms",
      prompt: "Extract key terms",
      response:
        "Key terms to confirm: effective date, renewal/termination clause, and any exclusivity or minimum-commitment language.",
    },
    {
      id: "find-similar-documents",
      prompt: "Find similar documents",
      response:
        "A few documents in the same category share similar structure — worth comparing terms before finalizing this one.",
    },
  ],
  analytics: [
    {
      id: "explain-metric-change",
      prompt: "Explain this metric's change",
      response:
        "The change this period is consistent with normal seasonal variation rather than an anomaly, based on the available trend data.",
    },
    {
      id: "most-behind-plan",
      prompt: "Which department is most behind plan?",
      response:
        "Most departments are tracking close to plan this period. Worth a closer look at whichever one shows the largest variance in its own Reports page.",
    },
  ],
  administration: [
    {
      id: "summarize-audit-activity",
      prompt: "Summarize recent audit activity",
      response:
        "No unusual patterns detected in the available activity data for this period.",
    },
    {
      id: "flag-permission-changes",
      prompt: "Flag unusual permission changes",
      response:
        "No role or permission changes outside the normal pattern were found in the available record data.",
    },
  ],
  dashboard: [
    {
      id: "summarize-today",
      prompt: "Summarize what changed today",
      response:
        "Activity across the platform today is within the normal range — no unusual spikes or drop-offs stand out in the available data.",
    },
    {
      id: "whats-attention",
      prompt: "What needs my attention?",
      response:
        "Nothing urgent stands out right now. Check each workspace's own list for anything approaching a due date.",
    },
  ],
};

/** Fallback order when a workspace has no dedicated suggestion set. */
const WORKSPACE_TO_CONTEXT: Partial<Record<WorkspaceId, AIContextKind>> = {
  dashboard: "dashboard",
  hr: "hr",
  sales: "sales",
  marketing: "marketing",
  research: "research",
  operations: "operations",
  finance: "finance",
  documents: "documents",
  knowledge: "knowledge",
  training: "training",
  customers: "customer",
  analytics: "analytics",
  administration: "administration",
};

export function getSuggestionsForContext(kind: AIContextKind): AISuggestion[] {
  return SUGGESTIONS[kind] ?? SUGGESTIONS.dashboard;
}

export function getContextKindForWorkspace(workspaceId: WorkspaceId): AIContextKind {
  return WORKSPACE_TO_CONTEXT[workspaceId] ?? "dashboard";
}
