# CLAUDE.md — Operating Manual for Cosmade OS

Read this file before doing any work on Cosmade OS. It governs how any Claude session — documentation, design, or engineering — should think, decide, and act on this project.

## Project Vision

Cosmade OS is a unified enterprise operating system: every department (HR, Sales, Marketing, Finance, Operations, Customers, Knowledge, Training, Research) lives inside one consistent platform, with one navigation language, one object model, and one AI experience. See [01 Vision/product-vision.md](01%20Vision/product-vision.md).

## Product Philosophy

Enterprise software quality comes from **consistency**, not feature count. Every click, transition, search, form, table, and approval should behave predictably across every department. See [02 Product Philosophy/product-philosophy.md](02%20Product%20Philosophy/product-philosophy.md).

## Non-Negotiable Principles

1. **Speed over decoration** — animations and chrome never delay work.
2. **Context over navigation** — related information (contracts, invoices, meetings, timeline, tasks) lives together; never force five pages for one task.
3. **Progressive disclosure** — show most important → important → advanced → expert; never overwhelm.
4. **Consistency** — every object (Employee, Company, Invoice, Campaign, Knowledge Article, Vendor, Customer...) uses the same interaction language.
5. **Confidence** — every interaction reassures the user (`Saving… / Saved.`, `Approved.`); users never wonder if something worked.
6. **Global search first** — search (`Ctrl+K` / `⌘K`) is always faster than navigation; everything is searchable.
7. **Workspaces are working environments, not dashboards** — the main content area executes work (tables, editors, pipelines); dashboards are overview pages, not the default landing experience for daily work. This is a hard correction against Cosmade OS's earlier dashboard-heavy tendency (see [11 UX System/design-system-teardown.md](11%20UX%20System/design-system-teardown.md)).
8. **Never break existing workflows** — new modules must integrate with existing navigation and object models; deprecated features get defined migration periods, not silent removal.

Full detail: [03 Design Principles](03%20Design%20Principles), [04 Enterprise Architecture/enterprise-information-architecture.md](04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Documentation Standards

- Every substantive document follows the template in [README.md](README.md) ("Documentation Standard" section).
- Never produce one giant document — one focused document per topic, cross-referenced.
- Never simplify, shorten, or remove architecture already decided. Expand and clarify instead.
- Mark gaps explicitly (`> **Gap:**`) rather than inventing detail to fill them.
- When new source material arrives, merge intelligently; if it conflicts with existing documentation, **ask the user** — do not silently overwrite. Log the resolution in [DECISIONS.md](DECISIONS.md).

## Coding Philosophy

- Trust internal code and framework guarantees; validate only at system boundaries.
- No speculative abstractions, feature flags, or backwards-compatibility shims for hypothetical futures — build for what's decided.
- Every object/entity in the product (Customer, Employee, Invoice, Campaign, etc.) implements the **Universal Object Layout** ([04 Enterprise Architecture](04%20Enterprise%20Architecture)) — do not invent a one-off layout for a new object type.

## UI Philosophy

- Universal Page Anatomy is fixed: Top Navigation → Workspace Sidebar → Breadcrumbs → Page Header → Context Toolbar → Primary Content → Related Information → Activity Timeline → Footer Actions. See [03 Design Principles/universal-page-anatomy.md](03%20Design%20Principles/universal-page-anatomy.md).
- Modal vs. Drawer vs. New Page is a **mandatory rule**, not a style choice: drawers for viewing/editing/reading, modals only for destructive/dangerous confirmation, new pages for complex authoring work. See [03 Design Principles/interaction-patterns.md](03%20Design%20Principles/interaction-patterns.md).
- Reference the Spark & Co teardown ([11 UX System/design-system-teardown.md](11%20UX%20System/design-system-teardown.md)) as the concrete visual/structural target: generous white space, subtle active states (soft lavender, not saturated blue), monochrome outline icons, medium information density, tables over dashboard cards for working pages.

## AI Philosophy

- AI is never a hidden chat window — it is a contextual panel present in every workspace, aware of current page, user, permissions, related records, documents, knowledge graph, and active workflows.
- AI actions are always labeled and never execute silently; users remain in control (suggestions, summaries, recommendations, insights, drafts, predictions — not autonomous unlabeled changes).
- See [07 Enterprise AI](07%20Enterprise%20AI).

## Architecture Principles

- **Workspace-based navigation**, not isolated modules — every workspace owns its dashboards, objects, analytics, documents, AI assistant, automation, and settings.
- **Universal object model** — every business object exposes the same tab set: Overview, Activity, Relationships, Documents, Knowledge, Tasks, Timeline, Analytics, AI Assistant, History, Settings.
- Maximum navigation depth is **four levels** (Workspace → Section → Object → Details); breadcrumbs always visible.
- Full detail: [04 Enterprise Architecture/enterprise-information-architecture.md](04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Decision-Making Framework

Before implementing any new feature, ask (from the source material's own "Product Principles for Every Future Decision," [14 Future Ideas/future-decision-principles.md](14%20Future%20Ideas/future-decision-principles.md)):

1. Does this reduce or increase cognitive load?
2. Does it strengthen the organization's knowledge?
3. Does it integrate with existing business objects?
4. Does it respect permissions and security?
5. Can it be discovered through search?
6. Can it participate in automation?
7. Is it auditable?
8. Is it accessible?
9. Does it work responsively?
10. Will it still make sense when the platform is ten times larger?

**If the answer to any question is "no," redesign before implementation.**

## Response Style

- Concise, direct, enterprise-documentation tone — no marketing language.
- State architecture as fact where it's decided; state gaps as gaps.
- Use the same section template across documents so any reader can navigate cold.

## Implementation Rules

- No feature ships until it passes the [Enterprise Quality Checklist](11%20UX%20System/enterprise-quality-checklist.md) (UX, Design, Accessibility, Performance, Security, Reliability, Intelligence).
- Every operational list view carries: Search, Filters, Saved Views, Sort, Group, Columns, Density, Export, Import, Refresh, Create, Bulk Actions. Never strip these from an enterprise table.
- Every screen defines all Universal States (Empty, Loading, Skeleton, Partial, Offline, Sync Pending, Permission Denied, Error, Archived, Deleted, Read Only, Maintenance).
- Responsive testing is mandatory across the full breakpoint set in [11 UX System/responsive-testing-standards.md](11%20UX%20System/responsive-testing-standards.md) (1920px down to 320px).

## Functionality-First Implementation Rules

Cosmade OS is an operating system, not a UI showcase. Every page must let users perform real work. A page that only displays information is incomplete unless read-only is an explicit, deliberate design decision.

Before marking any page complete, answer:

1. What is the primary purpose of this page?
2. What jobs does the user need to complete here?
3. What primary actions should be possible?
4. What secondary actions should be available?
5. What bulk actions are needed?
6. What shortcuts improve productivity?

**If these questions cannot be answered, the page is incomplete.**

### CRUD Is Mandatory

Unless documentation explicitly states otherwise, every entity supports its full lifecycle: Create, Read, Update, Duplicate (where applicable), Archive, Restore, Delete (soft delete preferred), Permanent Delete (Owner/Admin only), Export, Import, Bulk Actions, Activity History, Audit Trail, Comments, Attachments, Permissions, Version History (documents/knowledge).

### Every List Page Must Support

Search, Advanced Filters, Sorting, Grouping, Column Visibility, Pagination or Infinite Scroll, Saved Views, Bulk Selection, Bulk Actions, Export, Import, Refresh, Keyboard Shortcuts, Context Menu, Quick Preview, Open Detail View.

### Every Entity Must Have

List View, Detail View, Create Modal/Page, Edit Modal/Page, Delete Confirmation, History, Timeline, Comments, Attachments, Related Records, Activity Log, Permissions.

### Every Detail Page Must Answer

Who created this? When was it created? Who modified it? What is related to it? What actions can I perform? What documents belong to it? What history exists? What approvals exist? What automation is connected?

### Every Workspace Must Be Action-Oriented

Do not build static dashboards — each workspace must let employees complete work. Representative (not exhaustive — expand per department's own operating-system document) action sets:

- **Sales**: Add Lead, Import Leads, Convert Lead, Assign Owner, Schedule Meeting, Send Email, Create Proposal, Mark Won, Mark Lost, Archive, Merge Duplicate.
- **Marketing**: Create Campaign, Upload Creative, Create Content, Schedule Posts, Assign Designer, Approve Campaign, Duplicate Campaign, Pause Campaign, Archive Campaign, Generate Report.
- **Finance**: Create Expense, Approve Expense, Reject Expense, Upload Receipt, Generate Invoice, Record Payment, Categorize Transaction, Approve Budget, Forecast Revenue, Export Financial Statement.
- **People & HR**: Add Employee, Invite Employee, Upload Contract, Assign Department, Assign Manager, Assign Benefits, Start Onboarding, Start Offboarding, Promote, Transfer, Suspend, Terminate, Generate Letter, Print ID Card.
- **Research**: Create Project, Submit Idea, Approve Idea, Archive Research, Compare Competitors, Create Prototype, Assign Researchers, Record Findings, Generate Report.
- **Operations**: Create SOP, Submit Procurement, Approve Procurement, Create Vendor, Receive Inventory, Approve Request, Assign Task, Escalate Issue, Generate Audit Report.
- **Knowledge Base**: Create Article, Edit Article, Move Article, Archive Article, Restore, Comment, Review, Approve, Version History, Share, Bookmark, Favorite.
- **Training**: Create Course, Upload Lesson, Assign Training, Issue Certificate, Create Quiz, Review Assessment, Track Progress, Retake Assessment, Download Certificate.
- **Customers**: Add Customer, Merge Customer, Create Opportunity, Create Contract, Record Meeting, Upload Documents, Assign Manager, Track Health, Renew Contract.
- **Administration**: Create User, Assign Role, Reset Password, Configure Department, Create Workflow, Create Automation, Manage Integrations, Audit Activity.

### Every Table Needs an Action Bar

New, Import, Export, Bulk Actions, Filters, Search, Saved Views, Refresh, Columns, Settings.

### Every Detail Page Needs an Action Panel

Top-right: Edit, Duplicate, Archive, Delete, Print, Export PDF, Share, Assign, More Actions.

### Every Empty State Must Be Useful

Never show a bare "No data." State what's missing in plain language, then offer a primary action ("Add Contact"), a secondary action ("Import Contacts"), and a help link ("Learn how Contacts work").

### Every Error State Must Recover

Never stop at an error message. Always offer Retry, Report, View Logs (Admin), and a Support link.

### Every Workflow Needs Shortcuts

Detail pages surface a Quick Actions panel for the next likely action — e.g. viewing a Company surfaces New Contact, Schedule Meeting, Create Proposal, Add Note, Upload Contract, Assign Sales Rep, Create Opportunity.

### Every Module Must Be Connected

Nothing exists in isolation. Example: Customer ↔ Meetings ↔ Sales ↔ Invoices ↔ Documents ↔ Knowledge ↔ Marketing Campaigns ↔ Support Tickets ↔ Analytics. Evaluate every new object for what it should link to; never build it as a standalone table.

### Before Implementing Any Page, Ask

What is the user trying to accomplish? What is the fastest way to accomplish it? Can this action be completed without leaving the page? Can multiple actions be completed simultaneously? Can power users complete this using shortcuts?

### The 80% Rule

If a page feels like a static table or static dashboard while building it, stop — it is missing functionality. Keep adding features until the page feels like software employees could genuinely use every day.

### Mockups Define Layout, Not Completeness

Never implement only what is explicitly shown in a UI mockup or source screenshot — mockups define layout and visual hierarchy, not complete functionality. Expand every screen into a production-grade enterprise workspace by identifying the actions, workflows, permissions, integrations, states, and edge cases an experienced product manager or enterprise user would expect. If a feature would be reasonably expected, implement it — unless it conflicts with existing documentation or an already-recorded architectural decision, in which case follow "Rules for Proposing Architectural Changes" below rather than silently adding or silently skipping it.

Logged as [DECISIONS.md](DECISIONS.md) ADR-006.

## Naming Conventions

- Department-level nav items are business functions, not page names (`Sales`, not `Sales Dashboard List`).
- Object tab names are standardized platform-wide: `Overview, Activity, Relationships, Documents, Knowledge, Tasks, Timeline, Analytics, AI, History, Settings` — do not rename per department.
- Documentation folders use the numbered convention `NN Folder Name` exactly as defined in [README.md](README.md); do not introduce parallel taxonomies.

## Folder Conventions

Follow the 15-folder structure in [README.md](README.md) (`/00` through `/14`). New documents go into the existing matching folder; propose a new top-level folder to the user before creating one.

## Development Workflow

1. Confirm which volume/department a request touches.
2. Check [DECISIONS.md](DECISIONS.md) and [MEMORY.md](MEMORY.md) for prior rulings before proposing new architecture.
3. Draft against the standard document template.
4. Cross-reference related documents both directions (update the referenced doc's "related" list too).
5. Log any new durable decision in [DECISIONS.md](DECISIONS.md) and, if it changes standing behavior, in [MEMORY.md](MEMORY.md).

## Phase-Based Execution Rules

Implementation follows the Implementation Series sequence: Volume 1 (Enterprise IA — done, [04 Enterprise Architecture](04%20Enterprise%20Architecture)) → Volume 2 (Database Blueprint) → Volume 3 (Backend/Microservices) → Volume 4 (Frontend Engineering Spec) → Volume 5 (Master Execution Roadmap). See [13 Roadmaps/future-implementation-volumes.md](13%20Roadmaps/future-implementation-volumes.md). Do not skip ahead to a later volume's concerns (e.g., backend service boundaries) while a prior volume is still open, per the source material's own sequencing recommendation (build the App Shell before the Dashboard, [06 Platform Core/app-shell.md](06%20Platform%20Core/app-shell.md)).

## Rules for Proposing Architectural Changes

- Never silently override a documented decision. Propose the change, cite the existing decision (from [DECISIONS.md](DECISIONS.md)), and state the reason.
- If a change would simplify, shorten, or remove existing functionality, flag it explicitly as a **reduction** and get explicit user confirmation — this is the one category of edit this project treats as high-risk by default.
- Record the outcome (adopted / rejected / deferred) in [DECISIONS.md](DECISIONS.md) regardless of outcome.
