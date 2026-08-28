# Interaction Patterns

> Reference note — rolls up into [02 Product Philosophy/product-philosophy.md](../02%20Product%20Philosophy/product-philosophy.md). This document is the canonical source for ADR-003 in [DECISIONS.md](../DECISIONS.md).

## Modal vs. Drawer vs. New Page Rule (Mandatory)

This rule is mandatory, not a style choice.

**Use Drawer** for: viewing information, editing simple records, reading documents, comments, preview, history, relationships, timeline. Most interactions should use drawers.

**Use Modal** for: confirmation, delete, archive, approval, reject, publish, password, authentication. Dangerous actions only.

**Use New Page** for: complex work — Knowledge Editor, Campaign Builder, Research Workspace, Workflow Builder, Report Designer, Document Editor. Never force complex work into a modal.

## Multi-Step Wizard Pattern

Long workflows use guided steps. Example — Employee Onboarding: Personal Details → Employment → Documents → Benefits → Equipment → Training → Review → Complete.

Every wizard supports: Save Draft, Back, Forward, Exit, Resume Later, Progress Indicator, Validation.

## Universal Toolbar

Every operational page has a toolbar containing: Search, Filters, Saved Views, Sort, Group, Columns, Density, Export, Import, Refresh, Create, Bulk Actions. Never remove these capabilities from an enterprise table.

## Bulk Actions

Should exist everywhere lists exist: Assign, Delete, Archive, Export, Approve, Reject, Share, Move, Tag, Change Owner, Generate Report, Run AI.

## Filtering Standards

Every list supports: Quick Filter, Advanced Filter, Saved Filter, Department Filter, Date Filter, Owner Filter, Status Filter, Tag Filter, Branch Filter. Search + Filters always work together.

## Saved Views

Every user can save personalized views (e.g., "My Lagos Hospitals," "My Pending Approvals," "Quarterly Marketing Campaigns," "My Team"). Views are private by default but may be shared.

## Keyboard Navigation

Every major workflow supports shortcuts: `Ctrl/⌘+K` global search, `N` create new, `/` focus search, `Esc` close drawer, `Ctrl+S` save, arrow keys navigate tables, `Shift+Click` multi-select, `Tab` next field. Power users should operate without touching the mouse whenever practical.

## Drag & Drop

Supported in: Knowledge Base, Documents, Kanban, Workflow Builder, Training Builder, Dashboards, Media Library, Campaign Builder. Not every screen should support drag-and-drop — only where it improves productivity.

## Undo Philosophy

Whenever safe, never delete immediately. Instead: Archive → Undo → Delete Permanently. Support undo for: Assignment, Move, Tag, Upload, Delete, Status Change. This reduces user anxiety.

## Related Documents
[03 Design Principles/universal-page-anatomy.md](universal-page-anatomy.md), [11 UX System/enterprise-quality-checklist.md](../11%20UX%20System/enterprise-quality-checklist.md), [DECISIONS.md](../DECISIONS.md) (ADR-003)
