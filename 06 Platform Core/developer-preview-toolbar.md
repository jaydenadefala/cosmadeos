# Developer Preview Toolbar (Development Mode Only)

## Purpose
Give designers and developers a way to verify every workspace, role, dataset, and workflow state without repeatedly navigating through the full application — an internal tool that shortens feedback loops and improves QA coverage without touching the production application.

## Vision
A developer can switch between departments, screens, user roles, datasets, workflow states, and device sizes in seconds, instead of manually drilling into navigation to inspect each department.

## Philosophy
Internal tooling in service of the platform's own quality bar ([11 UX System/enterprise-quality-checklist.md](../11%20UX%20System/enterprise-quality-checklist.md)) — it exists purely to make development and QA faster and more thorough, never to be exposed to end users.

## Architecture

**Availability:** Development mode only (`NODE_ENV=development` or a feature flag). Must never appear in production.

**Placement:** Top-right corner of the global navigation bar, immediately before the notification bell and user profile. Must look like native UI, not a debug panel.

### Components

**Department Switcher** — First dropdown; changes the active department instantly and loads its default landing page (e.g., Sales → Sales Dashboard, Marketing → Marketing Dashboard, Knowledge Base → Knowledge Home). Full list: Dashboard, People & HR, Sales, Marketing, Research & Development, Operations, Finance, Documents, Knowledge Base, Training Center, Customers, Reports, Administration.

**Screen Switcher** — Second dropdown; switches directly to any screen within the selected department without navigating through menus (e.g., under People & HR: Employee Directory, Employee Profile, Recruitment, Performance Reviews, Benefits, Training, Policies, Employee Handbook, Settings).

**Role Switcher** — Lets developers preview permissions instantly. Full role list: Owner, Administrator, Finance Manager, HR Manager, Sales Manager, Marketing Manager, Operations Manager, Department Lead, Manager, Supervisor, Employee, Guest, External Partner, Vendor, Customer. Changing role immediately refreshes visible menus, buttons, permissions, actions, tables, widgets, empty states, and restricted pages.

**Company Switcher** (optional but recommended) — Since the platform is multi-company, switch companies instantly for testing: Cosmade Medical, Acme Ltd, Demo Company, Enterprise Sandbox.

**Theme Switcher** — Light / Dark / System, updates instantly.

**Viewport Simulator** — Presets instead of manual browser resizing: Desktop XL, Desktop, Laptop, Tablet Landscape, Tablet Portrait, Mobile Large, Mobile Small. Resizes the application container in-browser.

**Density Switcher** — Comfortable / Compact / Dense. Updates table row height, sidebar spacing, card spacing, margins.

**Language Switcher** — English, French, Arabic, Chinese, Spanish. Used to verify localization and RTL layouts.

**Permission Overlay** (optional toggle) — When enabled, every hidden button displays "Hidden — Requires Finance Manager" instead of disappearing. Very useful for QA.

**Grid Overlay** (optional) — Displays 8px spacing grid, layout columns, responsive breakpoints, safe areas. Useful for designers.

**Component Inspector** — When enabled, hovering a component shows its identity (e.g., "Employee Table" / Component: `employee-table-v2` / Status: Connected / Data Source: `employees` / Permission: `HR_VIEW`).

**Sample Data Switcher** — Instantly load different datasets: Small Company (50 Employees), Medium Company (250 Employees), Enterprise (5,000 Employees), Healthcare Company, Manufacturing Company, Empty Company, Stress Test.

**Workflow State Switcher** — Preview different process states per module. Examples — Recruitment: No Applicants / 50 Applicants / Hiring / Offer Sent / Rejected / Archived. Finance: Positive Cash Flow / Negative Cash Flow / Budget Exceeded / Runway Warning. CRM: Healthy Pipeline / Empty Pipeline / Enterprise Deals / Lost Quarter.

**Notification Generator** — Generate test notifications: Success, Error, Warning, Information, Approval Request, Mention, Reminder.

## Principles
Never appears in production; must look like native UI; every switch should update the live application state instantly rather than requiring a reload.

## Components
See Architecture section above for the full component list.

## User Flows
A developer opens the toolbar, selects a Department, Screen, Role, and Sample Data set, and immediately sees the resulting permission-aware, populated screen — no manual navigation or test-data setup required.

## Information Architecture
Sits in the Global Header, dev-mode only — does not participate in the production App Shell ([06 Platform Core/app-shell.md](app-shell.md)).

## Data Model
> **Gap:** Sample dataset schemas not detailed beyond the named presets above.

## Permissions
The Role Switcher and Permission Overlay exist specifically to make the platform's permission model testable — see [09 Security/security-overview.md](../09%20Security/security-overview.md).

## AI Capabilities
> **Gap:** Not detailed (no AI-specific preview state named beyond generic workflow states).

## Automation
> **Gap:** Not detailed.

## Integrations
> **Gap:** Not present in source material.

## Analytics
> **Gap:** Not detailed.

## Administration
Company Switcher and Sample Data Switcher are administration-adjacent testing tools.

## Security
Must be strictly gated to development mode; a production leak of this toolbar would expose an unauthenticated role/permission bypass surface. This is the single highest security-sensitivity item in the toolbar spec.

## UX Notes
Should look like native UI, not a debug panel — same visual restraint as the rest of the platform.

## Future Expansion
Responsive Testing standard ([11 UX System/responsive-testing-standards.md](../11%20UX%20System/responsive-testing-standards.md)) is the natural complement to the Viewport Simulator component here — the toolbar is the interactive tool, the standard is the required breakpoint matrix.

## Related Documents
[11 UX System/responsive-testing-standards.md](../11%20UX%20System/responsive-testing-standards.md), [09 Security/security-overview.md](../09%20Security/security-overview.md), [06 Platform Core/app-shell.md](app-shell.md)
