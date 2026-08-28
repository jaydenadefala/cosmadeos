# App Shell

## Purpose
Define the persistent frame every user lives inside — the foundation every workspace inherits, per ADR-001 ([DECISIONS.md](../DECISIONS.md)).

## Vision
Only after the App Shell is fully specified should the Dashboard be designed. This mirrors how mature products such as Notion, Linear, Slack, and Microsoft 365 are designed: the shell is the foundation that every workspace inherits.

## Philosophy
See [02 Product Philosophy/product-philosophy.md](../02%20Product%20Philosophy/product-philosophy.md) and the Platform Interaction Model in [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Architecture

The App Shell is the persistent frame surrounding every workspace. Per the recommendation adopted in ADR-001, it must include:

- Authentication experience
- Organization selector
- Workspace switcher
- Global navigation
- Sidebar behavior
- Command palette (see [06 Platform Core/global-command-palette.md](global-command-palette.md))
- Notification center
- AI assistant panel (see [07 Enterprise AI/global-ai-experience.md](../07%20Enterprise%20AI/global-ai-experience.md))
- User profile menu
- Global search experience
- Favorites and recents
- Quick-create flows

> **Gap:** This list is a **component scope**, not a detailed specification. No layout, interaction, or visual detail was supplied for any of these eleven components individually — they were named as "what Volume 2 should cover" but the detailed spec itself is not present in the source material. Per ADR-001, Dashboard design should not proceed until this gap is closed.

## Principles
The App Shell must remain stable while local/workspace navigation adapts (Principle 4 — Contextual Navigation, [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md)).

## Components
See Architecture list above. Related, already-specified pieces: Global Navigation Bar, Global Header, Global Footer, Workspace Switcher, Company Switcher — all detailed in [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## User Flows
> **Gap:** Not supplied.

## Information Architecture
The App Shell sits above the Workspace Anatomy layer (Workspace Header → KPIs → Toolbar → Tabs → Main Content → AI → Timeline → Related Objects) — see [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
Organization/Company Switcher implies multi-tenancy; role-based visibility applies at the shell level (see [09 Security/security-overview.md](../09%20Security/security-overview.md)).

## AI Capabilities
AI Assistant Panel is a first-class Shell component, always present — see [07 Enterprise AI/global-ai-experience.md](../07%20Enterprise%20AI/global-ai-experience.md).

## Automation
Quick-create flows intersect with automation (e.g., "Create Purchase Order" via Command Palette).

## Integrations
> **Gap:** Not present in source material.

## Analytics
> **Gap:** Not detailed at shell level.

## Administration
Organization selector and Company Switcher are administration-adjacent (multi-company support).

## Security
> **Gap:** Authentication experience is named as an App Shell component but not detailed. See [09 Security/security-overview.md](../09%20Security/security-overview.md).

## UX Notes
Should follow the same visual language as the rest of the platform (see [11 UX System/design-system-teardown.md](../11%20UX%20System/design-system-teardown.md)) — no shell-specific visual deviation was indicated.

## Future Expansion
**Priority next step.** Detail each of the eleven App Shell components individually before Dashboard design begins, per ADR-001.

## Related Documents
[DECISIONS.md](../DECISIONS.md) (ADR-001), [04 Enterprise Architecture/architectural-review-foundation-recap.md](../04%20Enterprise%20Architecture/architectural-review-foundation-recap.md), [13 Roadmaps/future-implementation-volumes.md](../13%20Roadmaps/future-implementation-volumes.md)
