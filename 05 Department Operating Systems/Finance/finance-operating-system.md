# Finance Operating System

## Purpose
Define the Finance workspace navigation and primary working surface.

## Vision
Revenue, expenses, cash flow, and forecasting live in one working environment, per [01 Vision/product-vision.md](../../01%20Vision/product-vision.md).

## Philosophy
Per ADR-002: the Finance workspace's daily-use surfaces are ledgers/tables (invoices, bills, banking), with cash-flow/runway analytics as a distinct overview, not the default landing page.

## Architecture

### Workspace Sidebar (grouped sections)
Per the design-structure teardown: **Revenue, Expenses, Runway, Cash Flow, Budget Planning, Forecasting, Invoices, Bills, Banking, Reports.**

### Primary Working Surface
Invoices/Bills/Banking as tables (Universal Toolbar: Search, Filters, Saved Views, Sort, Group, Columns, Density, Export, Import, Refresh, Create, Bulk Actions — see [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md)); Budget Planning/Forecasting as dedicated analytical views.

## Principles
Universal Object Layout applies to the Invoice object (and, by extension, Bill/Contract objects it shares tab structure with).

## Components
Invoices (table + Universal Object Layout detail page), Bills, Banking, Budget Planning tool, Forecasting tool, Cash Flow / Runway views.

## User Flows
> **Gap:** No detailed AP/AR or close-process flow was present in the source material.

## Information Architecture
Sidebar grouping as above; Invoice object cross-links via the Cross-Workspace Linking chain (`Customer → ... → Contracts → Invoices → Payments → ...`) — [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
Role list includes "Finance Manager" (see [09 Security/security-overview.md](../../09%20Security/security-overview.md)); the Developer Preview Toolbar's Workflow State Switcher lists Finance-specific test states: Positive Cash Flow, Negative Cash Flow, Budget Exceeded, Runway Warning — [06 Platform Core/developer-preview-toolbar.md](../../06%20Platform%20Core/developer-preview-toolbar.md).

## AI Capabilities
Global AI Experience example given explicitly for this workspace: "Explain cash flow changes," "Predict runway," "Highlight budget risks" — see [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md).

## Automation
> **Gap:** Not detailed beyond the generic Automation View component.

## Integrations
> **Gap:** Not present in source material (e.g., no banking/accounting integration detail supplied).

## Analytics
`Reports` is an explicit sidebar section; Runway/Cash Flow/Budget Planning/Forecasting are themselves analytical working surfaces.

## Administration
> **Gap:** Not detailed.

## Security
Financial data implies heightened permission sensitivity; see [09 Security/security-overview.md](../../09%20Security/security-overview.md) — full detail is a gap pending earlier Foundation chapters.

## UX Notes
Follows the same visual language as every other workspace; Finance is the workspace explicitly used as the AI-panel example in the source material, underscoring how central contextual AI is meant to be here.

## Future Expansion
Detailed close-process workflow, AP/AR automation, and financial reporting templates are candidates for future volumes.

## Related Documents
[07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md), [06 Platform Core/developer-preview-toolbar.md](../../06%20Platform%20Core/developer-preview-toolbar.md)
