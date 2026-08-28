# HR Operating System (People & HR)

## Purpose
Define the People & HR workspace: its navigation structure, primary working surfaces, and how it conforms to the platform-wide architecture.

## Vision
Every employee-related task — onboarding, documents, hiring, performance, policies — lives inside one workspace with one consistent interaction language, matching the platform vision in [01 Vision/product-vision.md](../../01%20Vision/product-vision.md).

## Philosophy
"Workspaces are working environments, not dashboards" (ADR-002, [DECISIONS.md](../../DECISIONS.md)). The HR workspace's default landing experience is a working table (the Team Members / Employee Directory list), not a KPI dashboard.

## Architecture

### Global Nav Entry
`People & HR` — top-level workspace, per [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

### Workspace Sidebar (grouped sections)

**Authoritative grouping** — the design-structure teardown's explicit "How This Should Translate to Cosmade OS" section states this verbatim for HR: a left workspace navigation with grouped sections **Workforce, Recruitment, Learning, Performance, Policies, Settings** ([11 UX System/design-system-teardown.md](../../11%20UX%20System/design-system-teardown.md)). This is the section-name grouping to build against — treat it as the source of truth for this workspace, superseding the two supporting examples below.

**Supporting examples (same source, different purpose — do not treat as the final grouping):**
- The same source document, earlier, uses People & HR as a worked example of its general "Section → Pages → Subpages" sidebar *hierarchy pattern* (not a Cosmade-specific translation): a flat page list — Employee Directory, Employee Profiles, Employee Handbook, Training, Benefits, Recruitment, Performance, KPIs, Policies, Documents, Settings.
- The reference application itself (Spark & Co) — the literal screenshot being torn down — shows its own "People" workspace sidebar as: **Team Members** (top-level) / **ONBOARDING** — New Hire Onboarding / **DOCUMENTS** — Team Documents / **HIRE** — Applicants, Interviews, Job Listings, Careers Page, Settings. This is the reference app's own content, used to illustrate sidebar *mechanics* (uppercase section labels, active-item styling), not Cosmade OS's HR content.

**Inferred mapping (not stated verbatim in source — a reasonable placement, flagged as inference):** Recruitment ← Applicants, Interviews, Job Listings, Careers Page; Learning ← Training; Performance ← Performance Reviews; Policies ← Employee Handbook, Policies, Documents; Workforce ← Employee Directory, Employee Profiles, New Hire Onboarding, Benefits. This mapping should be confirmed against new source material rather than treated as decided.

Section labels are uppercase, non-clickable organizational labels; items beneath them are clickable pages with a small monochrome icon and text (per the general sidebar mechanics in [11 UX System/design-system-teardown.md](../../11%20UX%20System/design-system-teardown.md)).

### Primary Working Surface
Per the explicit translation guidance: the main content area is always a **productivity page** — named examples are the employee directory, the handbook, and the recruitment pipeline — never a collection of dashboard cards.

The one fully specified instance of such a page (the reference app's own "People"/Team Members table) is a **table**, not a dashboard:
- Page header: "People", subtitle "Showing 77 out of 77 users"
- Toolbar row: Search, Filters, Display, Bulk Actions
- Table columns: Checkbox, Name, Access
- Row: checkbox, circular avatar (40–48px, initials fallback), employee name (bold, purple, clickable → opens profile), secondary text (Invited/Pending/department/role metadata), Access column (plain text: Employee/Admin/Manager/Owner — not badges)

This table is the concrete model for the Employee Directory page specifically; the Handbook and Recruitment Pipeline pages are named as productivity-page examples but have no equivalent field-level detail in the source material.

## Principles
Follows the Universal Object Layout for the Employee object (Header → Summary Cards → Overview/Activity/Relationships/Documents/Knowledge/Tasks/Timeline/Analytics/AI/History tabs) — see [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Components
Employee Directory (table), Employee Profile (Universal Object Layout instance), New Hire Onboarding (Multi-Step Wizard pattern — see [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md)), Team Documents, Applicants/Interviews/Job Listings/Careers Page (Hire pipeline).

## User Flows
> **Gap:** Detailed onboarding, recruitment, and performance-review flows were not present in the supplied source material beyond the generic Multi-Step Wizard example (Personal Details → Employment → Documents → Benefits → Equipment → Training → Review → Complete).

## Information Architecture
Sidebar grouping as above; Employee object follows Universal Object Layout; navigation depth stays within the 4-level limit (Workspace → Section → Object → Details).

## Data Model
Partial — implied by the reference Employee table, not a formal schema: an Employee record carries at minimum `Name`, `Avatar` (image, or initials fallback), `Access` (enum: Employee/Admin/Manager/Owner), and a secondary-text status field (`Invited`/`Pending`/department/role metadata).
> **Gap:** Full schema (constraints, relationships, indexes, additional fields such as Benefits/Equipment/Training records referenced elsewhere) is pending Implementation Volume 2 (Database Blueprint).

## Permissions
Access levels observed in the reference table: Employee, Admin, Manager, Owner (plain-text, not badge-styled). Role list overlaps with the platform-wide role list in [09 Security/security-overview.md](../../09%20Security/security-overview.md) (HR Manager, Department Lead, Manager, Supervisor, Employee).

## AI Capabilities
Per the Global AI Experience pattern ([07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md)), an HR-context AI panel would summarize an employee record, surface onboarding status, or draft policy communications.
> **Gap:** No HR-specific AI examples were present in the source material (only Customer/Finance/Engineering examples were given).

## Automation
> **Gap:** Not detailed in source material beyond the generic Automation View Universal Workspace Component.

## Integrations
> **Gap:** Not present in source material.

## Analytics
> **Gap:** The authoritative HR grouping (Workforce, Recruitment, Learning, Performance, Policies, Settings) does not name a dedicated Analytics/Reports/KPIs section. (An earlier, non-authoritative illustrative list for this workspace did include a "KPIs" page — see the Workspace Sidebar section above — but since that list is explicitly a hierarchy-pattern example rather than the final translation, it should not be relied on as confirming an Analytics surface.) Every object still carries the platform-wide Analytics tab per the Universal Object Layout.

## Administration
`Settings` is one of the six authoritative grouping sections itself (Workforce, Recruitment, Learning, Performance, Policies, **Settings**), and also appears within the reference app's HIRE section as a page-level example.

## Security
See [09 Security/security-overview.md](../../09%20Security/security-overview.md).

## UX Notes
Matches the reference application's visual language exactly: generous white space, medium density, monochrome outline icons, soft lavender active sidebar state, purple accent for primary clickable text (employee names), plain-text access levels instead of heavy badges.

## Future Expansion
Complete this document with Benefits, Performance Review, and Policy workflow detail once available; consider a dedicated Recruitment sub-document if the Hire pipeline grows complex enough to need its own Kanban/Board View spec.

## Related Documents
[11 UX System/design-system-teardown.md](../../11%20UX%20System/design-system-teardown.md), [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md)
