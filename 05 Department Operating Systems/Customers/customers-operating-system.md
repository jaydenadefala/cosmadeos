# Customers Operating System

## Purpose
Define the Customers workspace — currently the least-specified department in the supplied source material.

## Vision
Per the platform vision, Customer is one of the canonical Universal Object Layout objects and the anchor of the Cross-Workspace Linking chain: `Customer → Products → Installations → Engineers → Contracts → Invoices → Payments → Training → Support → Knowledge → Research → Marketing Campaigns → AI Insights` — see [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Philosophy
Per ADR-002, the Customer workspace's main area should be a working surface (customer list/account table), not a dashboard-of-widgets landing page.

## Architecture

### Workspace Sidebar (grouped sections)
The Implementation Vol. 1 IA gives the *contextual navigation* example for an individual Customer object's detail page sidebar: **Overview, Contacts, Equipment, Projects, Support, Training, Documents, Contracts, Meetings, Knowledge, Analytics, AI.**

> **Gap:** This is the per-customer detail-page navigation, not the top-level Customers workspace list-page sidebar grouping (unlike HR/Sales/Marketing/Finance/Operations, no explicit workspace-level sidebar grouping was supplied for Customers). Do not assume the two are identical — the workspace-level grouping should be authored from new source material rather than inferred.

> **Proposed (2026-08-15, pending review — not sourced):** No new source material has arrived, so this proposal reasons from two things that *are* already decided: CLAUDE.md's Customers action set (`Add Customer, Merge Customer, Create Opportunity, Create Contract, Record Meeting, Upload Documents, Assign Manager, Track Health, Renew Contract`) and this document's own Cross-Workspace Linking chain (`Customer → Products → Installations → Engineers → Contracts → Invoices → Payments → Training → Support → Knowledge → Research → Marketing Campaigns → AI Insights`). Combining the two, matching the flat, table-grouped pattern Operations and Sales already use:
>
> - **Accounts** — the primary customer/account table (Add Customer, Merge Customer, Track Health, Assign Manager)
> - **Opportunities** — post-sale expansion/renewal pipeline (Create Opportunity), distinct from Sales' pre-sale Leads pipeline
> - **Installed Equipment** — Installations, tied to the medical-equipment/field-service domain noted in [CONTEXT.md](../../CONTEXT.md)
> - **Contracts & Renewals** — Create Contract, Renew Contract
> - **Meetings** — Record Meeting (mirrors Sales' Meetings section)
> - **Reports** — mirrors every other built department's terminal sidebar item
>
> This is a proposal, not a decision — review and edit (or replace outright) before any build work begins against it.

### Primary Working Surface
> **Gap:** No workspace-level landing page description supplied for Customers. By platform convention (ADR-002) it should be a customer/account table, not a dashboard.

> **Proposed (2026-08-15, pending review — not sourced):** An Accounts table (Universal Toolbar, same pattern as Sales' Companies/Contacts pages) as the workspace landing page — one row per Customer, key columns for account health, assigned manager, active contract status, and installed equipment count. Matches ADR-002 and mirrors how every other built department lands on a working table, not a dashboard.

## Principles
Universal Object Layout applies fully to the Customer object; it is in fact the object most fully exemplified in the source material.

## Components
Customer detail page (Universal Object Layout instance with the contextual tab set above), Equipment/Installation tracking, Support case view, Training records.

## User Flows
> **Gap:** No detailed flows supplied.

## Information Architecture
Customer is the anchor node of the platform's Cross-Workspace Linking model — see [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
> **Gap:** No Customer-specific role was named (contrast with Finance Manager, HR Manager, Sales Manager, Marketing Manager, Operations Manager all being named — see [09 Security/security-overview.md](../../09%20Security/security-overview.md)). "Customer" itself appears as an *external* role type in the Developer Preview Toolbar's role list, suggesting customer-facing portal access is a distinct concern from the internal Customers workspace.

## AI Capabilities
Global AI Experience example given explicitly for Customer context: "Summarize this account," "Draft a renewal strategy," "Show expansion opportunities" — see [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md).

## Automation
> **Gap:** Not detailed.

## Integrations
> **Gap:** Not present in source material.

## Analytics
`Analytics` is an explicit tab in the per-customer detail page.

## Administration
> **Gap:** Not detailed.

## Security
> **Gap:** See [09 Security/security-overview.md](../../09%20Security/security-overview.md).

## UX Notes
Given the domain context noted in [CONTEXT.md](../../CONTEXT.md) (medical equipment, hospitals as customers, saved-view example "My Lagos Hospitals"), this workspace likely carries the heaviest cross-department linkage of any object in the platform.

## Future Expansion
**Priority gap.** This is one of two departments (with Research) flagged in [00 Executive Summary/00-executive-summary.md](../../00%20Executive%20Summary/00-executive-summary.md) as needing dedicated source material — specifically the top-level workspace list-page structure, and given the apparent healthcare/medical-equipment focus, likely a dedicated Field Service / Equipment sub-volume.

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md), [CONTEXT.md](../../CONTEXT.md)
