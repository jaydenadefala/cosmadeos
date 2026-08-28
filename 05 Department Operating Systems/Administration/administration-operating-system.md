# Administration Operating System

> **PROPOSED DOCUMENT — pending your review, not sourced.** No source material exists for the Administration workspace at all — not even a paragraph, unlike Customers and Research which at least have partial documents. Everything below is inferred from two things that *are* already decided elsewhere in this repository: CLAUDE.md's Administration action set and [09 Security/security-overview.md](../../09%20Security/security-overview.md)'s role list. Nothing here should be treated as source of truth until you've reviewed and confirmed or edited it — per CLAUDE.md's Rules for Proposing Architectural Changes, this is a proposal, not a decision. Drafted 2026-08-15 in response to an explicit request to unblock this workspace via proposed documentation.

## Purpose
Define the Administration workspace — the platform's own management surface, where an Owner/Administrator configures the organization itself rather than doing department work inside it.

## Vision
`Administration` is named as the final entry in the canonical top-level Global Navigation Architecture list (`... Customers · Analytics · Administration`) in [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md) line 36, but its internal structure was never detailed in any supplied source material — confirmed explicitly in [09 Security/security-overview.md](../../09%20Security/security-overview.md): "`Administration` is a first-level workspace... its internal structure is not detailed."

> **Proposed:** The organization's control plane — user/role management, department configuration, workflow/automation authoring, integrations, and platform-wide audit — the one workspace that manages the platform rather than doing business work inside it, matching how Owner/Administrator differ from every other role in the security doc's role list.

## Philosophy
Per ADR-002, this workspace's main area should still be a working environment (a Users table, a Roles table, an Audit Log), not a widget dashboard — consistent with every other built department. Given its content is inherently sensitive (user accounts, role assignments, integration credentials), it should also default to the platform's most restrictive Read Only / Permission Denied treatment for any role other than Owner/Administrator.

## Architecture

### Workspace Sidebar (grouped sections)
> **Proposed (not sourced):** Reasoning directly from CLAUDE.md's Administration action set (`Create User, Assign Role, Reset Password, Configure Department, Create Workflow, Create Automation, Manage Integrations, Audit Activity`), grouped in the same flat, table-listed pattern every other built department uses:

- **Users** — Create User, Reset Password (mirrors HR's Employee Directory pattern, but platform-account-scoped rather than HR-record-scoped — the two are related but distinct: an Employee record can exist without a platform login, and vice versa for External Partner/Vendor/Customer portal accounts)
- **Roles & Permissions** — Assign Role, built against the role list already established in [09 Security/security-overview.md](../../09%20Security/security-overview.md): `Owner · Administrator · Finance Manager · HR Manager · Sales Manager · Marketing Manager · Operations Manager · Department Lead · Manager · Supervisor · Employee · Guest · External Partner · Vendor · Customer`
- **Departments** — Configure Department (the workspace-level settings each department already exposes via its own `Settings` tab, e.g., `/hr/settings`, surfaced here as a single cross-department control point)
- **Workflows & Automation** — Create Workflow, Create Automation
- **Integrations** — Manage Integrations, see [10 Integrations/integrations-overview.md](../../10%20Integrations/integrations-overview.md)
- **Audit Log** — Audit Activity, mirrors Operations' existing Audit Logs page (`/operations/audit-logs`) but platform-wide rather than Operations-scoped

### Primary Working Surface
> **Proposed (not sourced):** A Users table as the workspace landing page (Universal Toolbar, one row per platform account — name, role, department, status, last active), matching ADR-002 and the pattern every other built department uses.

## Principles
Universal Object Layout would apply to a `User` object (distinct from `Employee` — see Users section above) and a `Role` object, neither of which currently exists as a canonical object in [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md)'s object list. Confirm whether `User` should become a canonical Universal Object Layout object before building.

## Components
> **Proposed (not sourced):** User directory, Role/permission matrix editor, Department configuration list, Workflow builder (already named as a New Page pattern in [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md), alongside Research Workspace/Campaign Builder/Report Designer), Integrations directory, platform-wide Audit Log viewer (mirrors Operations' Audit Log viewer).

## User Flows
> **Gap:** Not supplied. Needs at minimum: invite-user flow, role-assignment flow, and the platform's actual permission-evaluation model (currently only simulated via the Developer Preview Toolbar's Role Switcher, not a real enforcement layer — see [09 Security/security-overview.md](../../09%20Security/security-overview.md)).

## Information Architecture
> **Gap:** No permission-matrix-to-object mapping was supplied. This is the same underlying gap blocking the Security/permission audit in [ROADMAP.md](../../ROADMAP.md) — Administration's Roles & Permissions section and the platform-wide RBAC model are the same piece of missing architecture, not two separate gaps.

## Data Model
> **Gap:** Pending Implementation Volume 2. A `User` entity (platform account, role, department, status) would need to be modeled distinctly from `Employee` (HR record) — most platforms keep these separate (not every Employee has login access; External Partners/Vendors/Customers may have login access without an Employee record).

## Permissions
Administration is itself the workspace that manages permissions — see Roles & Permissions above and [09 Security/security-overview.md](../../09%20Security/security-overview.md). By convention this workspace should be visible only to Owner/Administrator roles; every other role should see a Permission Denied state, once real RBAC exists to enforce it.

## AI Capabilities
> **Gap:** No Administration-specific AI examples were supplied in [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md) (that document names Customer, Finance, and Engineering contexts only, and explicitly flags Administration-context examples as a gap).

## Automation
Create Workflow / Create Automation are named directly in CLAUDE.md's Administration action set — this workspace is where the "Can it participate in automation?" question from CLAUDE.md's Decision-Making Framework gets a literal authoring surface, for every other department's records.

## Integrations
See [10 Integrations/integrations-overview.md](../../10%20Integrations/integrations-overview.md) (also a gap — no integrations are documented anywhere yet).

## Analytics
> **Gap:** Not detailed. Would likely surface user activity / login / audit-trend analytics once a real backend exists to measure them from.

## Administration
This document's primary subject.

## Security
Highest-sensitivity workspace on the platform by construction (user accounts, role assignments, integration credentials) — should be the first workspace to receive real RBAC enforcement once Implementation Volume 2/3 exist, not a later add-on.

## UX Notes
> **Gap:** No visual/structural example specific to this workspace was supplied; should follow the shared platform visual language by default, same as every other built department.

## Future Expansion
**Blocked pending your review of this proposal.** Once confirmed (or replaced), this becomes a normal Functionality-First build like every other department — Users table, Roles table, Departments list, Workflow/Automation builder (New Page), Integrations directory, platform Audit Log.

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [09 Security/security-overview.md](../../09%20Security/security-overview.md), [10 Integrations/integrations-overview.md](../../10%20Integrations/integrations-overview.md), [ROADMAP.md](../../ROADMAP.md), [DECISIONS.md](../../DECISIONS.md) (ADR-009, ADR-011)
