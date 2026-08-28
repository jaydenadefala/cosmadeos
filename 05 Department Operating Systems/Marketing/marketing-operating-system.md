# Marketing Operating System

## Purpose
Define the Marketing workspace navigation and primary working surface.

## Vision
Campaign execution, creative assets, and content live together as one working environment, per [01 Vision/product-vision.md](../../01%20Vision/product-vision.md).

## Philosophy
Per ADR-002: the workspace prioritizes campaign and content tools over dashboard widgets.

## Architecture

### Workspace Sidebar (grouped sections)
Per the design-structure teardown: **Campaigns, Creative Library, Content Calendar, Brand Assets, Research, Reports.**

### Primary Working Surface
Campaign Builder (a New Page pattern per [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md) — complex authoring work, never a modal), Creative Library (media/document management, supports drag-and-drop per the platform's Drag & Drop standard), Content Calendar (Calendar View Universal Workspace Component).

## Principles
Universal Object Layout applies to the Campaign object.

## Components
Campaign Builder (New Page), Creative Library / Media Library (drag-and-drop enabled), Content Calendar, Brand Assets repository, Research library, Reports view.

## User Flows
> **Gap:** No detailed campaign lifecycle flow was present in the source material. Empty-state example given generically: "No Campaigns Yet" → Create Campaign / Import Campaign / View Examples / Watch Tutorial / Generate with AI (see [03 Design Principles/states-and-feedback.md](../../03%20Design%20Principles/states-and-feedback.md)).

## Information Architecture
Sidebar grouping as above; Campaign object cross-links via the standard Cross-Workspace Linking chain ([04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md)).

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
Role list includes "Marketing Manager" (see [09 Security/security-overview.md](../../09%20Security/security-overview.md)).

## AI Capabilities
> **Gap:** No Marketing-specific AI examples were supplied (only Customer/Finance/Engineering examples given in source material). Should follow the same Global AI Experience pattern — see [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md).

## Automation
> **Gap:** Not detailed beyond the generic Automation View component.

## Integrations
> **Gap:** Not present in source material.

## Analytics
`Reports` is an explicit sidebar section; detailed metrics not supplied.

## Administration
> **Gap:** Not detailed.

## Security
See [09 Security/security-overview.md](../../09%20Security/security-overview.md).

## UX Notes
Creative Library and Campaign Builder are explicitly named as Drag & Drop-supported surfaces in the platform-wide standard ([03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md)).

## Future Expansion
Campaign performance analytics and multi-channel attribution are natural candidates for future volumes.

## Related Documents
[11 UX System/design-system-teardown.md](../../11%20UX%20System/design-system-teardown.md), [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md)
