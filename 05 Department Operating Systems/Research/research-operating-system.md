# Research Operating System (Research & Development)

## Purpose
Define the Research & Development workspace — the second department (with Customers) flagged as needing dedicated source material.

## Vision
Per the top-level Global Navigation Architecture, "Research & Development" is a first-level workspace alongside HR, Sales, Marketing, Finance, and Operations — see [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Philosophy
Per ADR-002, this workspace's main area should be a working environment (a Research Project workspace/editor), not a dashboard.

## Architecture

### Workspace Sidebar (grouped sections)
> **Gap:** No sidebar grouping example was supplied for Research & Development, unlike HR/Sales/Marketing/Finance/Operations/Knowledge/Training, all of which received explicit translation guidance in the design-structure teardown.

> **Proposed (2026-08-15, pending review — not sourced):** Reasoning from CLAUDE.md's already-decided Research action set (`Create Project, Submit Idea, Approve Idea, Archive Research, Compare Competitors, Create Prototype, Assign Researchers, Record Findings, Generate Report`), grouped in the flat, table-listed pattern Sales/Marketing/Operations already use:
>
> - **Projects** — the primary working surface (Create Project, Assign Researchers), opens the Research Workspace New Page below
> - **Ideas** — Submit Idea, Approve Idea (an intake/approval queue distinct from active Projects)
> - **Competitive Analysis** — Compare Competitors
> - **Prototypes** — Create Prototype
> - **Findings & Reports** — Record Findings, Generate Report
>
> Deliberately excludes a "Research" library/archive section — Marketing's sidebar already owns that (`/marketing/research`, a read-only reference card grid) per this document's Related Documents. This workspace is the *authoring* side (active projects, prototypes, findings); Marketing's Research is the *reference* side once findings are published. That split should be confirmed, not assumed, before building.
>
> This is a proposal, not a decision — review and edit (or replace outright) before any build work begins against it.

### Primary Working Surface
Research Workspace — named explicitly as a New Page pattern in the platform's Modal/Drawer/New Page rule (complex work, never a modal): "Research Workspace" is listed alongside Knowledge Editor, Campaign Builder, Workflow Builder, Report Designer, Document Editor — see [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md).

> **Proposed (2026-08-15, pending review — not sourced):** A Projects table as the workspace landing page (Universal Toolbar, one row per Research Project — status, assigned researchers, linked Customer/Marketing campaign if any), with "Create Project" opening the Research Workspace New Page for the actual authoring surface (findings, prototypes, competitive notes), matching the New-Page-for-complex-authoring rule already cited above.

## Principles
Universal Object Layout applies to the Research Project object (named explicitly among the canonical objects in [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md)).

## Components
Research Workspace (New Page), Research library (linked from Marketing's sidebar as a shared "Research" section, and from the Customer Cross-Workspace Linking chain).

## User Flows
> **Gap:** No detailed flows supplied.

## Information Architecture
Research Project is a Cross-Workspace Linking chain node (`... → Support → Knowledge → Research → Marketing Campaigns → AI Insights`), directly connecting Research to Customer, Knowledge, and Marketing.

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
> **Gap:** No Research-specific role was named in the source material's role lists.

## AI Capabilities
> **Gap:** No Research-specific AI examples were supplied.

## Automation
> **Gap:** Not detailed.

## Integrations
> **Gap:** Not present in source material.

## Analytics
> **Gap:** Not detailed.

## Administration
> **Gap:** Not detailed.

## Security
> **Gap:** See [09 Security/security-overview.md](../../09%20Security/security-overview.md).

## UX Notes
> **Gap:** No visual/structural example specific to this workspace was supplied; should follow the shared platform visual language by default.

## Future Expansion
**Priority gap**, alongside Customers ([05 Department Operating Systems/Customers/customers-operating-system.md](../Customers/customers-operating-system.md)). Needs a dedicated sidebar grouping and working-surface description; given Marketing's "Research" sidebar section and the Customer linking chain, this workspace likely centers on product/market research projects connected to both Customer accounts and Marketing campaigns.

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md), [05 Department Operating Systems/Marketing/marketing-operating-system.md](../Marketing/marketing-operating-system.md)
