# AGENTS.md — Onboarding Manual for Cosmade OS Contributors

This is the onboarding manual for every AI agent or human contributor joining the Cosmade OS project. Read [CLAUDE.md](CLAUDE.md) first for operating rules; this file covers culture, standards, and role responsibilities.

## Mission

Build a single enterprise operating system where every department — HR, Sales, Marketing, Finance, Operations, Customers, Knowledge, Training, Research — feels like one product, not a suite of bolted-together tools. Employees should never need to relearn how the platform works when moving between departments.

## Company Culture (as encoded in the architecture)

- **Calm, professional, predictable, purpose-built.** The product should feel like software people use eight hours a day without fatigue — closer to how the Spark & Co reference application feels ([11 UX System/design-system-teardown.md](11%20UX%20System/design-system-teardown.md)) than a flashy consumer app.
- **Work over decoration.** Workspaces exist to get work done (tables, pipelines, editors); dashboards are a separate, secondary concern.
- **No surprises.** Every state (loading, error, offline, empty, permission-denied) is designed, not left to default framework behavior.

## Engineering Principles

- Universal Object Model: every new business object gets the same tab structure (Overview, Activity, Relationships, Documents, Knowledge, Tasks, Timeline, Analytics, AI, History, Settings) — do not design a bespoke layout.
- Workspace-based, not module-based: a new department is a full workspace (dashboard + objects + analytics + documents + AI assistant + automation + settings), not an isolated screen.
- Search-first: anything a user might look for must be indexed and reachable via global search (`Ctrl/⌘+K`).
- Undo over delete: destructive actions default to Archive → Undo → Delete Permanently where safe.

## Design Philosophy

- Follow Universal Page Anatomy exactly ([03 Design Principles/universal-page-anatomy.md](03%20Design%20Principles/universal-page-anatomy.md)).
- Follow the Modal/Drawer/New-Page decision rule exactly — it is mandatory, not a preference ([03 Design Principles/interaction-patterns.md](03%20Design%20Principles/interaction-patterns.md)).
- Match the reference visual language: generous white space, medium density, monochrome outline icons, soft lavender active states (not saturated blue/heavy shadows), clear typographic hierarchy (title → section → table header → primary text → secondary text → labels → metadata).

## Quality Standards

No feature is complete until it passes the [Enterprise Quality Checklist](11%20UX%20System/enterprise-quality-checklist.md) across UX, Design, Accessibility, Performance, Security, Reliability, and Intelligence.

## Documentation Standards

Every document follows the template defined in [README.md](README.md). No giant single documents. Cross-reference liberally. Never lose information when refactoring documentation — merge and clarify, don't delete.

## Code Review Checklist

- Does this object/page/workflow match the Universal Object Layout and Page Anatomy?
- Is every primary action top-right; are secondary actions in a dropdown (never scattered)?
- Is the correct interaction surface used (drawer vs. modal vs. new page) per the mandatory rule?
- Does the list view carry the full Universal Toolbar (search, filters, saved views, sort, group, columns, density, export, import, refresh, create, bulk actions)?
- Are all Universal States implemented (empty, loading, skeleton, partial, offline, sync pending, permission denied, error, archived, deleted, read-only, maintenance)?
- Is the feature permission-aware with audit logging, and does it respect export permissions?
- Is it keyboard-navigable and screen-reader friendly, with logical, visible focus order?
- Has it been tested across the full responsive breakpoint set ([11 UX System/responsive-testing-standards.md](11%20UX%20System/responsive-testing-standards.md))?
- Is AI participation (if any) clearly labeled and non-blocking?

## Security Principles

- Every feature is permission-aware and audit-logged by default.
- Role-based visibility: hidden UI should be genuinely permission-gated, not just visually hidden (the Developer Preview Toolbar's Permission Overlay exists specifically to make hidden-vs-restricted states visible during QA — [06 Platform Core/developer-preview-toolbar.md](06%20Platform%20Core/developer-preview-toolbar.md)).
- Export actions respect the same permission model as viewing.

> **Gap:** Full RBAC model, detailed permission matrix, and authentication architecture were established in earlier Foundation chapters not present in the supplied source material. See [09 Security/security-overview.md](09%20Security/security-overview.md) for what is known (the role list from the Developer Preview Toolbar) versus what is pending.

## UX Expectations

- Reduce cognitive load over adding visual richness. The test for every screen: "How can we help the employee complete meaningful work with the least friction?" — not "how can we display more charts."
- Progressive disclosure: default to most-important-first; hide advanced/expert configuration until requested.
- Errors are human-readable and actionable ("We couldn't publish the campaign because approval is still pending," not "Error 500"), always offering Retry / View Details / Contact Support / Report Issue.

## Collaboration Workflow

1. Check [MEMORY.md](MEMORY.md) and [DECISIONS.md](DECISIONS.md) before starting new work on a department or platform area.
2. Draft against the existing structure; do not introduce a parallel pattern without flagging it.
3. Cross-link new documents into the relevant existing volume(s).
4. Surface gaps rather than filling them with assumption.

## Communication Style

Direct, structured, enterprise-documentation register. No hype language. State what is decided as decided, what is proposed as proposed, and what is missing as missing.

## Definition of Done

A feature, document, or workflow is "done" only when:
- It matches the Universal Object Model / Page Anatomy where applicable.
- It passes every applicable section of the [Enterprise Quality Checklist](11%20UX%20System/enterprise-quality-checklist.md).
- It is cross-referenced from and to related documentation.
- Any new durable decision behind it is logged in [DECISIONS.md](DECISIONS.md).

## Escalation Rules

- Any change that would simplify, shorten, or remove previously decided architecture must be flagged to the user explicitly before proceeding — never silently "clean up" scope.
- Any conflict between new source material and existing documentation must be raised as a question, not resolved unilaterally.
- Any request that touches a Volume 2–5 concern (database schema, backend service boundaries, frontend framework choice, execution roadmap) before that volume has been authored should be flagged as out-of-sequence — see [13 Roadmaps/future-implementation-volumes.md](13%20Roadmaps/future-implementation-volumes.md).

## Specialized Role Responsibilities

**Architect** — Owns the Universal Object Model, Enterprise IA, and cross-workspace linking model. Reviews any new department or object type against [04 Enterprise Architecture](04%20Enterprise%20Architecture) before it's approved.

**Designer** — Owns Design Principles and the UX System teardown fidelity. Ensures every new screen matches Universal Page Anatomy, the Modal/Drawer/New-Page rule, and the reference visual language.

**Backend Engineer** — Owns data model, permissions enforcement, automation, and integration contracts once Volume 2/3 exist. Until then, flags any backend decision made ad hoc so it can be captured for the future Database Blueprint / Backend Architecture volumes.

**Frontend Engineer** — Implements Universal Page Anatomy, Universal Toolbar, Universal States, and responsive breakpoints exactly as specified; builds the Developer Preview Toolbar as internal tooling, dev-mode only.

**QA** — Runs the Enterprise Quality Checklist and full responsive breakpoint matrix against every feature; uses the Developer Preview Toolbar's Role Switcher, Permission Overlay, and Sample Data Switcher to test permission and data-state coverage without manual setup.

**Documentation Engineer** — Maintains this repository: standardizes terminology, removes duplication, keeps cross-references bidirectional, updates [MEMORY.md](MEMORY.md) and [DECISIONS.md](DECISIONS.md) as new decisions land, flags gaps instead of inventing content.

**Product Manager** — Owns [13 Roadmaps](13%20Roadmaps) and [14 Future Ideas](14%20Future%20Ideas); runs every new feature proposal through the Decision-Making Framework in [CLAUDE.md](CLAUDE.md) before it enters scope.
