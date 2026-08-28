# Global Command Palette

## Purpose
Define the single always-available interface for navigating, creating, searching, and running workflows anywhere in Cosmade OS.

## Vision
Everything from one interface — no user should need to hunt through menus to perform a common action.

## Philosophy
Directly operationalizes Principle 3 — Global Search First ([04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md)) and Speed Over Decoration ([03 Design Principles/five-ux-principles.md](../03%20Design%20Principles/five-ux-principles.md)).

## Architecture
Invoked via `Ctrl+K` / `⌘K` from any screen. Supports: Navigate, Create, Search, Run Workflow, Generate AI Summary, Start Meeting, Open Customer, Open Employee, Create Purchase Order, Create Campaign, Open Knowledge Article, Generate Report.

## Principles
Search should always be faster than navigation clicking.

## Components
Single overlay input with typeahead results across all searchable object types (Employees, Hospitals, Invoices, Projects, Products, Research, Documents, Workflows, Knowledge).

## User Flows
> **Gap:** No detailed interaction flow (e.g., keyboard result navigation, result grouping/ranking) was supplied.

## Information Architecture
Sits at the App Shell level ([06 Platform Core/app-shell.md](app-shell.md)), available from every workspace regardless of navigation depth.

## Data Model
> **Gap:** Pending Implementation Volume 2 (search index design).

## Permissions
Results should respect the current user's permissions (implied by platform-wide permission-aware standard in [11 UX System/enterprise-quality-checklist.md](../11%20UX%20System/enterprise-quality-checklist.md); not explicitly detailed for the palette itself).

## AI Capabilities
"Generate AI Summary" is a first-class command palette action.

## Automation
"Run Workflow" is a first-class command palette action.

## Integrations
> **Gap:** Not present in source material.

## Analytics
> **Gap:** Not detailed.

## Administration
> **Gap:** Not detailed.

## Security
> **Gap:** See [09 Security/security-overview.md](../09%20Security/security-overview.md).

## UX Notes
Keyboard-first by design, consistent with the Superhuman-inspired productivity principle in the Platform Interaction Model.

## Future Expansion
Detailed ranking/typeahead behavior and per-object quick-create forms are candidates for the future Frontend Engineering Spec (Implementation Volume 4).

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [06 Platform Core/app-shell.md](app-shell.md), [03 Design Principles/interaction-patterns.md](../03%20Design%20Principles/interaction-patterns.md) (Keyboard Navigation)
