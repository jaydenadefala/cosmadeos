# Global AI Experience

## Purpose
Define how AI is embedded across Cosmade OS as a contextual capability, not a bolted-on chat feature.

## Vision
AI is not hidden in a chat window. It exists everywhere.

## Philosophy
AI should never interrupt work; it appears as suggestions, summaries, recommendations, insights, drafts, and predictions — users remain in control at all times. See [02 Product Philosophy/product-philosophy.md](../02%20Product%20Philosophy/product-philosophy.md).

## Architecture
Every workspace includes a contextual AI panel that understands: current page, current user, current permissions, related records, relevant documents, knowledge graph, active workflows.

### Examples by Context

**Customer page:** "Summarize this account." / "Draft a renewal strategy." / "Show expansion opportunities."

**Finance page:** "Explain cash flow changes." / "Predict runway." / "Highlight budget risks."

**Engineering page:** "Recommend troubleshooting steps." / "Find similar repair cases."

> **Gap:** No AI examples were supplied for HR, Marketing, Operations, Knowledge, Training, or Research contexts. These should follow the same contextual-panel pattern once available.

## Principles
1. AI is always contextual, never a generic detached chatbot.
2. AI actions are always clearly labeled.
3. Users remain in control — every AI output is a suggestion/draft/recommendation, never an autonomous unlabeled change.

## Components
AI Assistant Panel (present in every workspace and every App Shell instance — [06 Platform Core/app-shell.md](../06%20Platform%20Core/app-shell.md)); AI Insights tab (Universal Object Layout, [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md)); AI Summary (Object Header Standard, [03 Design Principles/universal-page-anatomy.md](../03%20Design%20Principles/universal-page-anatomy.md)); "Generate AI Summary" command (Global Command Palette, [06 Platform Core/global-command-palette.md](../06%20Platform%20Core/global-command-palette.md)).

## User Flows
> **Gap:** No detailed AI interaction flow (e.g., how a suggestion is accepted/edited/dismissed) was supplied beyond "users remain in control."

## Information Architecture
The AI panel is aware of the knowledge graph — connecting it structurally to [05 Department Operating Systems/Knowledge/knowledge-operating-system.md](../05%20Department%20Operating%20Systems/Knowledge/knowledge-operating-system.md) and the (currently undocumented) Data Platform knowledge graph referenced in [04 Enterprise Architecture/architectural-review-foundation-recap.md](../04%20Enterprise%20Architecture/architectural-review-foundation-recap.md).

## Data Model
> **Gap:** Pending Implementation Volume 2; knowledge graph architecture referenced but not detailed in supplied source material.

## Permissions
AI panel is explicitly aware of "current permissions" — AI must respect the same permission boundaries as the rest of the platform.

## AI Capabilities
See Architecture examples above; also see [07 Enterprise AI/ai-interaction-standards.md](ai-interaction-standards.md) for the interaction-level rules.

## Automation
AI participates in automation via the Global Command Palette's "Run Workflow" and "Generate Report" actions.

## Integrations
> **Gap:** Not present in source material.

## Analytics
AI predictions (e.g., "Predict runway") are themselves a form of analytics delivered conversationally rather than via chart.

## Administration
> **Gap:** Not detailed (e.g., no admin controls for enabling/disabling AI features per workspace were supplied).

## Security
AI must respect current user permissions when surfacing related records — no detail beyond this general statement was supplied. See [09 Security/security-overview.md](../09%20Security/security-overview.md).

## UX Notes
Every AI-generated action is clearly labeled — see [07 Enterprise AI/ai-interaction-standards.md](ai-interaction-standards.md) and [03 Design Principles/states-and-feedback.md](../03%20Design%20Principles/states-and-feedback.md).

## Future Expansion
Extend contextual AI examples to every department once source material is available; detail the knowledge graph data architecture in Implementation Volume 2.

## Related Documents
[07 Enterprise AI/ai-interaction-standards.md](ai-interaction-standards.md), [06 Platform Core/app-shell.md](../06%20Platform%20Core/app-shell.md), [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md)
