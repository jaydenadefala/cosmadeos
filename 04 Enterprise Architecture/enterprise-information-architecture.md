# Enterprise Information Architecture (IA)

**Implementation Series — Volume 1**

## Purpose
Define exactly how navigation, workspaces, objects, and layout compose into one coherent information architecture across every department of Cosmade OS.

## Vision
Every employee should know exactly where to go. Nothing should feel hidden. Nothing should require more than three clicks. Navigation should be predictable. Every workspace should behave consistently. Every object should feel familiar regardless of department. The platform should feel like one unified operating system.

## Philosophy
See [02 Product Philosophy/product-philosophy.md](../02%20Product%20Philosophy/product-philosophy.md) and [03 Design Principles/five-ux-principles.md](../03%20Design%20Principles/five-ux-principles.md).

## Architecture

### Enterprise Navigation Principles

The navigation must satisfy six principles:

**Principle 1 — Workspace-Based Navigation.** The platform is organized into workspaces rather than isolated modules. Each workspace owns its own dashboards, objects, analytics, documents, AI assistant, automation, and settings.

**Principle 2 — Universal Object Model.** Every major object (Customer, Employee, Vendor, Campaign, Research Project, Document, Equipment, Invoice, Contract, Supplier) uses the same structure. Every object page contains: Overview, Activity, Relationships, Documents, Knowledge, Tasks, Timeline, Analytics, AI Assistant, History, Settings (where applicable). Users immediately know where information lives.

**Principle 3 — Global Search First.** Navigation should never be the fastest way — search should be. `Ctrl+K` / `⌘K` searches everything: Employees, Hospitals, Invoices, Projects, Products, Research, Documents, Workflows, Knowledge.

**Principle 4 — Contextual Navigation.** Navigation changes based on where users are. Example — Customer Workspace sidebar changes to: Overview, Contacts, Equipment, Projects, Support, Training, Documents, Contracts, Meetings, Knowledge, Analytics, AI. The global navigation remains stable while local navigation adapts.

**Principle 5 — Progressive Disclosure.** Do not overwhelm users. Show only what is relevant. Advanced tools remain available but do not clutter the interface.

**Principle 6 — Consistency.** Every page follows the same design language: Header → Actions → Filters → Primary Content → Details Panel → AI Panel → Timeline → Footer Actions. Users should never need to relearn the interface.

### Global Navigation Architecture

The left navigation is the permanent backbone of the platform. First level (nothing else belongs here):

`Dashboard · People & HR · Sales · Marketing · Research & Development · Operations · Finance · Documents · Knowledge Base · Training Center · Customers · Analytics · Administration`

> **Implementation note (ADR-004):** This document's source text describes this list as "the left navigation." During implementation this was found to conflict with [11 UX System/design-system-teardown.md](../11%20UX%20System/design-system-teardown.md), which maps the same workspace list onto the reference app's **top horizontal bar**. Per ADR-004 in [DECISIONS.md](../DECISIONS.md), the top-bar placement is what's actually built — this section is left as written because it accurately transcribes the source material, but treat ADR-004 as authoritative for implementation.

### Global Header

Contains: Global Search, Quick Create, Notifications, Approvals, Tasks, Calendar, AI Command Center, Bookmarks, Recently Viewed, Help, Profile, Workspace Switcher, Company Switcher (multi-company).

### Global Footer

Contains: Platform Status, Version, Environment, Support, Keyboard Shortcuts, Accessibility, Privacy, Terms.

### Workspace Anatomy

Every workspace shares one layout: `Workspace Header → Workspace KPIs → Toolbar → Workspace Tabs → Main Content → AI Assistant → Timeline → Related Objects`. This pattern repeats everywhere.

> **Note (ADR-002):** "Workspace KPIs" in this layout refers to summary indicators within the workspace header area, not a dashboard-of-widgets main content area. Per the design-structure teardown ([11 UX System/design-system-teardown.md](../11%20UX%20System/design-system-teardown.md)), the Main Content region for daily-use pages should be a working table/tool, with dashboards demoted to a distinct overview page. Read this section together with that correction.

### Universal Workspace Components

Every workspace includes: Dashboard, List View, Board View, Calendar View, Timeline View, Graph View, Analytics View, Knowledge View, Automation View, Settings. Not every object uses every view, but the pattern remains consistent.

### Universal Object Layout

Every major entity opens as a full-page workspace — never a cramped modal. Structure:

`Header (Name, Status, Tags, Primary Actions) → Summary Cards → Tabs (Overview, Activity, Relationships, Documents, Knowledge, Tasks, Timeline, Analytics, AI, History)`

Applies to: Customer, Employee, Product, Vendor, Campaign, Research Project, Warehouse, Equipment, Contract, Invoice, Asset, Training Course, SOP, Knowledge Article.

### Global AI Experience

AI is not hidden in a chat window — it exists everywhere. Every workspace includes a contextual AI panel that understands: current page, current user, current permissions, related records, relevant documents, knowledge graph, active workflows. See [07 Enterprise AI/global-ai-experience.md](../07%20Enterprise%20AI/global-ai-experience.md) for full expansion and examples.

### Global Command Palette

Available from any screen. Supports: Navigate, Create, Search, Run Workflow, Generate AI Summary, Start Meeting, Open Customer, Open Employee, Create Purchase Order, Create Campaign, Open Knowledge Article, Generate Report. Everything from one interface. See [06 Platform Core/global-command-palette.md](../06%20Platform%20Core/global-command-palette.md).

### Cross-Workspace Linking

Every object is linked. Example chain: `Customer → Products → Installations → Engineers → Contracts → Invoices → Payments → Training → Support → Knowledge → Research → Marketing Campaigns → AI Insights`. Users never feel trapped inside one module.

### Responsive Information Architecture

**Desktop (1440px+):** Three-column layout — global sidebar, main workspace, context/AI panel.

**Tablet:** Collapsible sidebar; AI panel becomes a slide-over drawer; responsive tables collapse into cards where appropriate.

**Mobile:** Bottom navigation for primary workspaces; context actions become floating action buttons; lists become stacked cards; filters become bottom sheets; tables convert to mobile-optimized views. No horizontal scrolling except analytical grids where unavoidable.

### Navigation Depth Rules

Maximum navigation depth: Level 1 — Workspace, Level 2 — Section, Level 3 — Object, Level 4 — Details. Never exceed four levels. Breadcrumbs always visible.

### Universal States

Every screen defines: Empty State, Loading State, Skeleton Loading, Partial Loading, Offline State, Sync Pending, Permission Denied, Error State, Archived State, Deleted State, Read Only, Maintenance Mode. Every state has a defined visual treatment and user action.

### Cross-Cutting UX Standards

Every page supports: keyboard navigation, accessibility (WCAG 2.2 AA), dark mode, light mode, localization, RTL readiness, high-density mode, touch interactions, offline caching where applicable, autosave for editable content, undo for destructive actions, audit trail access where permitted.

### Platform Interaction Model

The entire platform should feel like: Notion (knowledge organization), Linear (speed and navigation), Rippling (operational workflows), HubSpot (CRM and commercial execution), Confluence (documentation), Superhuman (keyboard-first productivity), Palantir Foundry (connected operational intelligence). Not by copying their visual styles, but by adopting their interaction patterns and productivity principles.

## Principles
See "Enterprise Navigation Principles" above; also governed by the platform-wide [Decision-Making Framework](../14%20Future%20Ideas/future-decision-principles.md).

## Components
Global Navigation Bar, Global Header, Global Footer, Workspace Sidebar, Universal Workspace Components, Universal Object Layout, Global Command Palette, Global AI Panel — detailed component specs live in [06 Platform Core](../06%20Platform%20Core) and [07 Enterprise AI](../07%20Enterprise%20AI).

## User Flows
> **Gap:** No end-to-end user flow diagrams were present in the source material. Should be authored per Department OS document.

## Information Architecture
See "Navigation Depth Rules" and "Global Navigation Architecture" above. Full department-level breakdowns: [05 Department Operating Systems](../05%20Department%20Operating%20Systems).

## Data Model
> **Gap:** Pending Implementation Volume 2 — Database Blueprint (not yet authored). See [13 Roadmaps/future-implementation-volumes.md](../13%20Roadmaps/future-implementation-volumes.md).

## Permissions
> **Gap:** Referenced as established in Foundation chapters ("Roles, permissions, and security") not present in the supplied source material. Known partial detail (role list only): [09 Security/security-overview.md](../09%20Security/security-overview.md).

## AI Capabilities
See "Global AI Experience" above and [07 Enterprise AI](../07%20Enterprise%20AI) in full.

## Automation
Every workspace owns an Automation View as a Universal Workspace Component; the Global Command Palette supports "Run Workflow" directly.

## Integrations
> **Gap:** Not present in source material. See [10 Integrations/integrations-overview.md](../10%20Integrations/integrations-overview.md).

## Analytics
Every workspace owns an Analytics View as a Universal Workspace Component; every object includes an Analytics tab.

## Administration
Every workspace owns a Settings surface; global Administration is the top-level nav item for company-wide configuration.

## Security
> **Gap:** See [09 Security/security-overview.md](../09%20Security/security-overview.md).

## UX Notes
This volume operationalizes the Five UX Principles and Universal Page Anatomy into concrete navigation structure — read alongside [03 Design Principles](../03%20Design%20Principles) and [11 UX System/design-system-teardown.md](../11%20UX%20System/design-system-teardown.md) for the visual/structural target.

## Future Expansion
This is Implementation Series Volume 1. Volumes 2–5 (Database Blueprint, Backend/Microservice Architecture, Frontend Engineering Spec, Master Execution Roadmap) build on top of this IA — see [13 Roadmaps/future-implementation-volumes.md](../13%20Roadmaps/future-implementation-volumes.md). Per ADR-001, the App Shell ([06 Platform Core/app-shell.md](../06%20Platform%20Core/app-shell.md)) must be fully specified before Dashboard design proceeds.
