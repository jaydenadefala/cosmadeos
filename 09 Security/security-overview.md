# Security Overview

## Purpose
Record what is known about Cosmade OS's security, roles, and permission model from supplied source material, and flag what is not.

## Vision
> **Gap:** No dedicated security vision statement was present in the supplied source material — the Foundation recap references "Roles, permissions, and security" as established in an earlier chapter not supplied.

## Philosophy
Permission-awareness and auditability are treated as first-class, non-optional product qualities: every feature must be "permission-aware" and have "audit logging implemented" per the [Enterprise Quality Checklist](../11%20UX%20System/enterprise-quality-checklist.md), and every future feature decision must pass "does it respect permissions and security?" per [14 Future Ideas/future-decision-principles.md](../14%20Future%20Ideas/future-decision-principles.md).

## Architecture
> **Gap:** No RBAC architecture, authentication mechanism, or permission-evaluation model was detailed in the supplied source material.

The only concrete role/permission detail available comes from the Developer Preview Toolbar's Role Switcher ([06 Platform Core/developer-preview-toolbar.md](../06%20Platform%20Core/developer-preview-toolbar.md)), which lists the full role set the platform must support:

`Owner · Administrator · Finance Manager · HR Manager · Sales Manager · Marketing Manager · Operations Manager · Department Lead · Manager · Supervisor · Employee · Guest · External Partner · Vendor · Customer`

Changing role must instantly refresh: visible menus, buttons, permissions, actions, tables, widgets, empty states, restricted pages — establishing that permission enforcement must be comprehensive and reactive, not just route-level.

## Principles
- Hidden UI should be genuinely permission-gated, not just visually hidden — the Permission Overlay dev tool exists specifically to make "Hidden — Requires Finance Manager"-type states visible and testable.
- Export actions respect the same permission model as viewing ("export permissions respected" — [Enterprise Quality Checklist](../11%20UX%20System/enterprise-quality-checklist.md)).
- Sensitive data must be protected; audit logging must be implemented for every feature.

## Components
Role Switcher, Permission Overlay, Company Switcher (multi-tenancy testing) — all part of the Developer Preview Toolbar, dev-mode only.

## User Flows
> **Gap:** No authentication or authorization flow was supplied.

## Information Architecture
> **Gap:** No permission-matrix-to-object mapping was supplied (e.g., which roles can view/edit/approve which object types).

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
See Role list above. Department-specific roles observed across supplied Department OS documents: Finance Manager, HR Manager, Sales Manager, Marketing Manager, Operations Manager. No Customer-, Knowledge-, Training-, or Research-specific role was named.

## AI Capabilities
The AI panel is explicitly described as aware of "current permissions" — see [07 Enterprise AI/global-ai-experience.md](../07%20Enterprise%20AI/global-ai-experience.md).

## Automation
> **Gap:** Not detailed.

## Integrations
> **Gap:** Not detailed. See [10 Integrations/integrations-overview.md](../10%20Integrations/integrations-overview.md).

## Analytics
> **Gap:** Not detailed.

## Administration
`Administration` is a first-level workspace in the Global Navigation Architecture ([04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md)); its internal structure is not detailed.

## Security
This document's primary subject; see gaps noted throughout.

## UX Notes
The Permission Overlay's design choice — showing *why* something is hidden ("Hidden — Requires Finance Manager") rather than simply hiding it — is a notable UX pattern worth carrying into the production permission-denied Universal State, not just the dev toolbar. Currently only specified for the dev tool; consider whether production should adopt a similar transparency pattern for permission-denied states.

## Future Expansion
**Priority gap.** Full RBAC model, permission matrix per object/action, and authentication architecture should be sourced from Foundation Chapters 1–9 if available, or authored fresh as part of Implementation Volume 2/3.

## Related Documents
[06 Platform Core/developer-preview-toolbar.md](../06%20Platform%20Core/developer-preview-toolbar.md), [11 UX System/enterprise-quality-checklist.md](../11%20UX%20System/enterprise-quality-checklist.md), [14 Future Ideas/future-decision-principles.md](../14%20Future%20Ideas/future-decision-principles.md)
