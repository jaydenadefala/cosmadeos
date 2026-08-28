# Design System Teardown — Reference Application Analysis

## Purpose
Capture the structural and visual analysis of a reference enterprise application (Spark & Co, "People" workspace) and translate it into concrete design guidance for every Cosmade OS department. This is the concrete visual/structural target referenced throughout [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md).

## Vision
Cosmade OS should feel calm, professional, structured, and purpose-built — "exactly why it resembles software people use eight hours a day" — rather than dashboard-heavy or decorative.

## Philosophy
This teardown is the source of ADR-002 ([DECISIONS.md](../DECISIONS.md)): workspaces are working environments, not dashboard collections. "Dashboards should have analytics. Workspaces should have tools."

## Architecture

### Overall Layout
Three major vertical/horizontal regions, all permanent — nothing floats, nothing overlaps, everything occupies a defined region:

```
┌──────────────────────────────────────────────────────────────┐
│ Global Navigation (Horizontal Top Bar)                       │
├──────────────┬─────────────────────────────────────────────── ┤
│ Workspace    │ Main Workspace                                 │
│ Navigation   │                                                │
│ (Left)       │                                                │
└──────────────┴────────────────────────────────────────────────┘
```

### 1. Global Navigation Bar (Top)
Full-width horizontal bar. Contains business functions, not pages, left to right (reference example: Me, News Feed, Tasks, Locations, People, Schedule, Timesheets, Reports — mapping to Cosmade OS's People, Sales, Marketing, Finance, Operations, etc.). Active tab: light gray background, dark text, slight emphasis — not blue, not heavily highlighted, very subtle.

### 2. Workspace Sidebar (Left)
~260–280px wide, does not auto-collapse, generous spacing, left-aligned. Structured into sections, not a flat list:

`Section (uppercase label) → Pages → Subpages`

Section labels: uppercase, small size, medium gray, large top margin, no border — organizational labels, not clickable items (e.g., `ONBOARDING`, `DOCUMENTS`, `HIRE`).

Sidebar items: small monochrome icon + text, comfortable spacing, ~40–48px height, very light hover state, no unnecessary decoration.

Active item: soft lavender background, rounded corners, purple icon, purple text — nothing flashy, no large borders, no left indicator bar.

Icons: outline style, consistent weight, small, monochrome.

### 3. Main Workspace
No floating cards, very structured.

**Page Header:** large bold title, left-aligned (e.g., "People"), with a gray, small subtitle immediately below (e.g., "Showing 77 out of 77 users") that tells the user where they are.

**Toolbar:** below the title, one row: Search, Filters ▼, Display ▼, Bulk Actions. Search — large width, left search icon, rounded corners, neutral border, no heavy shadow. Filters/Display — dropdown buttons, soft background, understated. Bulk Actions — same row, acts on multiple selected records.

**Content Area:** begins immediately after the toolbar. Large table. No unnecessary cards, no dashboard widgets — just work.

**Table Layout:** minimal columns (e.g., Checkbox, Name, Access). Row: checkbox, circular avatar (40–48px, initials fallback if no image, exactly like Slack), employee name (bold, purple, clickable → opens profile), secondary text below the name (gray, smaller — Invited/Pending/department/role/other metadata), Access column (plain text — Employee/Admin/Manager/Owner — not giant badges). Large vertical row spacing, easy to scan.

## Principles

**White Space:** one of the biggest reasons this UI feels premium — large margins, large padding, nothing crowded or compressed. The interface breathes.

**Visual Weight:** Large title → Toolbar → Table. Nothing else. No graphs, no statistics, no unnecessary KPI cards on this type of page.

**Information Density:** medium — enough information, never overwhelming.

**Typography Hierarchy:** Page Title (largest) → Section Headings → Table Headers → Primary Text → Secondary Text → Labels → Metadata. A user should understand the page within three seconds.

**Color Usage:** mostly white, very light gray, soft purple, black text, gray metadata. No saturated colors. Color indicates interaction only, never used decoratively.

**Interaction Philosophy:** professional, predictable, structured, calm, purpose-built.

## Components
Global Navigation Bar, Workspace Sidebar (sectioned), Page Header + subtitle, Toolbar (Search/Filters/Display/Bulk Actions), Data Table (checkbox/avatar/name/secondary text/access column).

## User Flows
> **Gap:** No interaction-level flow (e.g., clicking a row, opening a drawer) was detailed beyond "employee name is clickable, indicates this opens profile."

## Information Architecture
Directly maps onto the Universal Page Anatomy ([03 Design Principles/universal-page-anatomy.md](../03%20Design%20Principles/universal-page-anatomy.md)): Top Navigation = Global Navigation Bar; Workspace Sidebar = Workspace Navigation; Page Header = Page Header; Context Toolbar = Toolbar; Primary Content = Content Area/Table.

## Data Model
Not a formal schema, but the table implies concrete fields for the Employee record: `Name`, `Avatar` (circular image, initials fallback if absent), `Access` (enum: Employee/Admin/Manager/Owner, shown as plain text not a badge), and a secondary-text field carrying status/metadata (`Invited`/`Pending`/department/role). This is the only object in the entire source material with field-level detail this concrete — treat it as the reference shape for the Employee entity until Implementation Volume 2 formalizes it.

## Permissions
Access column values (Employee, Admin, Manager, Owner) are a visual permissions indicator, not a full permission model — see [09 Security/security-overview.md](../09%20Security/security-overview.md).

## AI Capabilities
N/A — not addressed in the teardown itself.

## Automation
N/A.

## Integrations
N/A.

## Analytics
Explicitly *excluded* from this page type by design — analytics belong on a separate overview/dashboard page, not the working table page.

## Administration
N/A.

## Security
N/A beyond the Access column noted above.

## UX Notes — How This Translates to Every Cosmade OS Department

Every primary department should adopt this exact structural pattern rather than a dashboard-centric layout:

- **HR:** left workspace navigation with grouped sections (Workforce, Recruitment, Learning, Performance, Policies, Settings); main content is always a productivity page (employee directory, handbook, recruitment pipeline) — see [05 Department Operating Systems/HR/hr-operating-system.md](../05%20Department%20Operating%20Systems/HR/hr-operating-system.md).
- **Sales:** grouped navigation for Leads, Companies, Contacts, Meetings, Playbooks, Knowledge, Reports; main area shows CRM/playbooks, not KPIs — see [05 Department Operating Systems/Sales/sales-operating-system.md](../05%20Department%20Operating%20Systems/Sales/sales-operating-system.md).
- **Marketing:** grouped navigation for Campaigns, Creative Library, Content Calendar, Brand Assets, Research, Reports — see [05 Department Operating Systems/Marketing/marketing-operating-system.md](../05%20Department%20Operating%20Systems/Marketing/marketing-operating-system.md).
- **Finance:** grouped navigation for Revenue, Expenses, Runway, Cash Flow, Budget Planning, Forecasting, Invoices, Bills, Banking, Reports — see [05 Department Operating Systems/Finance/finance-operating-system.md](../05%20Department%20Operating%20Systems/Finance/finance-operating-system.md).
- **Operations:** grouped navigation for SOPs, Procurement, Vendors, Inventory, Compliance, Requests, Audit Logs — see [05 Department Operating Systems/Operations/operations-operating-system.md](../05%20Department%20Operating%20Systems/Operations/operations-operating-system.md).
- **Knowledge Base:** organized like Notion — handbooks, SOPs, templates, meeting notes, lessons learned, best practices — see [05 Department Operating Systems/Knowledge/knowledge-operating-system.md](../05%20Department%20Operating%20Systems/Knowledge/knowledge-operating-system.md).
- **Training Center:** organized like a corporate LMS — learning paths, courses, assessments, certifications, progress, departmental training — see [05 Department Operating Systems/Training/training-operating-system.md](../05%20Department%20Operating%20Systems/Training/training-operating-system.md).

**Overall principle (restated as the closing standard of this teardown):** a global navigation switches between major company workspaces; a workspace sidebar exposes the tools and knowledge within the selected department; a main content area is dedicated to executing work; dashboards exist as overview pages, but most pages prioritize knowledge, processes, collaboration, and execution.

## Future Expansion
Apply this same teardown methodology to future reference applications as they're supplied, to keep expanding the concrete visual target beyond this single example.

## Related Documents
[CLAUDE.md](../CLAUDE.md), [03 Design Principles/universal-page-anatomy.md](../03%20Design%20Principles/universal-page-anatomy.md), [DECISIONS.md](../DECISIONS.md) (ADR-002), all [05 Department Operating Systems](../05%20Department%20Operating%20Systems) documents
