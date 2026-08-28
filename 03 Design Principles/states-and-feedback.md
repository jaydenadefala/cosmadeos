# States & Feedback: Empty, Loading, Error, Offline

> Reference note — rolls up into [11 UX System/enterprise-quality-checklist.md](../11%20UX%20System/enterprise-quality-checklist.md) (Reliability section) and [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md) (Universal States).

## Empty States

Every empty page teaches users. Instead of "No Records," display: Explanation, Benefits, Quick Start Guide, Import, Templates, AI Suggestions, Create Button. Example — "No Campaigns Yet" → Create Campaign / Import Campaign / View Examples / Watch Tutorial / Generate with AI.

## Loading Experience

Loading should feel intelligent: Skeleton UI → Progressive Loading → Lazy Loading → Streaming Data → Background Refresh. Never freeze the interface.

## Error Experience

Errors should be human. Bad: "Error 500." Good: "We couldn't publish the campaign because approval is still pending." Always offer: Retry, View Details, Contact Support, Report Issue.

## Offline Experience

If connection drops: warn the user, continue editing where possible, queue supported actions, auto-sync on reconnect, display sync status clearly.

## AI Interaction Standards

AI should never interrupt work. AI appears as: Suggestions, Summaries, Recommendations, Insights, Drafts, Predictions. Users remain in control. Every AI-generated action is clearly labeled. See [07 Enterprise AI/ai-interaction-standards.md](../07%20Enterprise%20AI/ai-interaction-standards.md) for the full expansion of this standard.

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md) (Universal States), [07 Enterprise AI/ai-interaction-standards.md](../07%20Enterprise%20AI/ai-interaction-standards.md)
