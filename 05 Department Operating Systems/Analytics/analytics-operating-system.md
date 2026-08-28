# Analytics Operating System

> **PROPOSED DOCUMENT — pending your review, not sourced.** No source material exists for the Analytics workspace at all. It is named only once in the entire supplied source material — as an entry in the canonical top-level navigation list in [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md) line 36 — with zero further detail anywhere. Everything below is inferred from platform-wide patterns already decided elsewhere (ADR-002's dashboard/workspace split, each department's existing Reports page, the per-object Analytics tab). Nothing here should be treated as source of truth until reviewed. Drafted 2026-08-15 in response to an explicit request to unblock this workspace via proposed documentation.

## Purpose
Define the Analytics workspace — a company-wide BI/reporting hub, distinct from two things that are already built and should not be confused with it: (1) the per-object `Analytics` tab (Universal Object Layout, present on every business object), and (2) each department's own Reports page (`/sales/reports`, `/finance/reports`, `/marketing/reports` — all built, all department-scoped). This workspace is the cross-department rollup those department Reports pages don't attempt.

## Vision
> **Proposed:** ADR-002's own rationale — "Dashboards should have analytics. Workspaces should have tools" — implies Analytics is one of the deliberate exceptions to the working-environment-first rule, alongside the main platform Dashboard (`/`, already built) and each department's Reports page. Analytics-the-workspace is where those pieces roll up cross-department: revenue next to pipeline next to headcount next to campaign performance, in one place, rather than requiring a user to visit five separate Reports pages.

## Philosophy
Unlike every other workspace, Analytics is not subject to ADR-002's "working environment, not dashboard" rule — it is the platform's dedicated home for exactly the widget/KPI/chart content ADR-002 deliberately moved *out of* every other workspace's main surface. This should be stated explicitly rather than left ambiguous, since it's the one workspace where the platform's own general rule doesn't apply, by that rule's own logic.

## Architecture

### Workspace Sidebar (grouped sections)
> **Proposed (not sourced):** No department action set exists for Analytics in CLAUDE.md (unlike Customers/Research/Administration, which do). Proposing from the cross-department-rollup framing above and the metrics already computed on the main Dashboard and each department's Reports page:

- **Overview** — cross-department KPI rollup (revenue, pipeline, headcount, campaign performance, operations throughput — one metric per department, sourced from each department's own Reports computation rather than duplicating logic)
- **Revenue & Finance** — deep-link into Finance's existing Revenue/Runway/Cash Flow/Reports pages, not a rebuild
- **Sales & Pipeline** — deep-link into Sales Reports
- **Marketing Performance** — deep-link into Marketing Reports
- **Workforce** — HR headcount/performance rollup (HR currently has no dedicated Reports page — a real gap this workspace would expose, not solve)
- **Custom Reports** — a Report Designer surface, already named as a New Page pattern in [03 Design Principles/interaction-patterns.md](../../03%20Design%20Principles/interaction-patterns.md) alongside Knowledge Editor/Campaign Builder/Research Workspace/Workflow Builder

### Primary Working Surface
> **Proposed (not sourced):** A cross-department Overview page — the one legitimate dashboard-of-widgets surface on the platform per the Philosophy note above — with drill-through links into each department's existing Reports page rather than re-deriving their metrics independently. "Custom Reports" would open the Report Designer New Page for building saved cross-department views.

## Principles
This is the one workspace explicitly exempted from ADR-002 by that ADR's own rationale ("Dashboards should have analytics"). Every other Non-Negotiable Principle in CLAUDE.md still applies in full (Global search first, Consistency, Confidence, etc.).

## Components
> **Proposed (not sourced):** Cross-department KPI rollup, Report Designer (New Page), drill-through links into each department's existing Reports page, saved/custom report library (mirrors Sales' Saved Views pattern, applied to whole reports rather than table filters).

## User Flows
> **Gap:** Not supplied. Needs: how a Custom Report is built and saved, and whether/how it can be shared or scheduled (email digest, etc. — out of scope without a real backend).

## Information Architecture
> **Proposed:** Reads from every other department's already-computed Reports metrics rather than maintaining parallel calculation logic — e.g., if Sales Reports computes "pipeline value," Analytics' Sales & Pipeline section should reuse that computation, not reimplement it. This keeps the platform consistent (CLAUDE.md: "Does it integrate with existing business objects?") and avoids the two numbers silently drifting apart.

## Data Model
> **Gap:** Pending Implementation Volume 2. In the current mock-data architecture, this workspace's Overview page would aggregate across each department's existing `useXStore()` hooks client-side — the same pattern Dashboard (`/`) already uses.

## Permissions
> **Gap:** Not detailed. A cross-department rollup inherently needs read access to every department's data — likely restricted to Owner/Administrator/Department Lead roles rather than every Employee, though this needs your confirmation.

## AI Capabilities
> **Gap:** No Analytics-specific AI examples were supplied in [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md). A reasonable extension, consistent with that document's existing Finance example ("Predict runway"): "Explain this quarter's revenue change," "Which department is most behind plan?"

## Automation
> **Gap:** Not detailed. Scheduled report delivery/digests would connect to Administration's proposed Workflows & Automation section, and require a real backend (out of scope for the current mock-data build).

## Integrations
> **Gap:** Not present in source material. A real Analytics workspace would likely need a BI/data-warehouse integration once Implementation Volume 2/3 exist.

## Analytics
This document's primary subject.

## Administration
> **Gap:** Not detailed. Which roles can build/see Custom Reports would be configured in Administration's proposed Roles & Permissions section.

## Security
Cross-department data access makes this workspace's permission model unusually consequential — should not launch ahead of real RBAC (same blocker already tracked for the platform-wide Security/permission audit in [ROADMAP.md](../../ROADMAP.md)).

## UX Notes
> **Gap:** No visual/structural example specific to this workspace was supplied. Given this is the platform's one deliberately dashboard-shaped workspace, its visual language should still follow [11 UX System/design-system-teardown.md](../../11%20UX%20System/design-system-teardown.md) (same charts/KPI-card components already built for the main Dashboard and department Reports pages, not a new visual system).

## Future Expansion
**Blocked pending your review of this proposal.** Once confirmed (or replaced), this becomes a normal build reusing existing computed metrics and chart components — Overview rollup, drill-through links, Report Designer New Page.

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [DECISIONS.md](../../DECISIONS.md) (ADR-002, ADR-009, ADR-011), [ROADMAP.md](../../ROADMAP.md)
