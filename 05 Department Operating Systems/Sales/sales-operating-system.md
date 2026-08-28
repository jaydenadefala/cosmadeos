# Sales Operating System

## Purpose
Define the Sales workspace navigation and primary working surface.

## Vision
CRM and commercial execution feel like the platform's other workspaces — a working environment first, per [01 Vision/product-vision.md](../../01%20Vision/product-vision.md) and the platform's HubSpot-inspired interaction model ([04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md)).

## Philosophy
Per ADR-002 ([DECISIONS.md](../../DECISIONS.md)): the Sales workspace's main area shows CRM/pipeline data or playbooks, not KPI cards.

## Architecture

### Workspace Sidebar (grouped sections)
Per the design-structure teardown's explicit translation guidance: **Leads, Companies, Contacts, Meetings, Playbooks, Knowledge, Reports.**

### Primary Working Surface
Main area shows CRM or playbook content — pipeline/board or table views of Leads/Companies/Contacts — not a dashboard of KPI widgets.

## Principles
Universal Object Layout applies to Customer/Company/Contact/Deal-type objects (Header → Summary Cards → standard tab set).

## Components
Leads list/board, Companies directory, Contacts directory, Meetings (calendar/timeline integration), Playbooks (Knowledge-adjacent content), Reports view.

## User Flows
> **Gap:** No detailed lead-to-close flow was present in the source material.

## Information Architecture
Sidebar grouping as above; Customer object cross-links into Sales via the Cross-Workspace Linking chain (`Customer → Products → Installations → Engineers → Contracts → Invoices → Payments → Training → Support → Knowledge → Research → Marketing Campaigns → AI Insights`) — see [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
Role list includes "Sales Manager" (see [09 Security/security-overview.md](../../09%20Security/security-overview.md)).

## AI Capabilities
Global AI Experience example given for account context: "Summarize this account," "Draft a renewal strategy," "Show expansion opportunities" — see [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md).

## Automation
> **Gap:** Not detailed beyond the generic Automation View component.

## Integrations
> **Gap:** Not present in source material (e.g., no email/calendar sync detail supplied).

## Analytics
`Reports` is an explicit sidebar section; detailed metrics not supplied.

## Administration
> **Gap:** Not detailed.

## Security
See [09 Security/security-overview.md](../../09%20Security/security-overview.md).

## UX Notes
Follows the same visual language as every other workspace (whitespace, monochrome icons, soft active states) — see [11 UX System/design-system-teardown.md](../../11%20UX%20System/design-system-teardown.md).

## Future Expansion
Pipeline/deal object schema, forecasting, and quota management are natural candidates for a future Sales-specific volume once Implementation Volume 2 data model work begins.

## Related Documents
[11 UX System/design-system-teardown.md](../../11%20UX%20System/design-system-teardown.md), [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md)
