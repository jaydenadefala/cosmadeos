# DECISIONS.md — Architecture Decision Record (ADR) Log

Every significant architectural decision is recorded here with context, options considered, final decision, rationale, and consequences.

---

## ADR-001: Specify the App Shell Before the Dashboard

**Date:** Established during Foundation Volume 1 closing review (exact original date not present in source material; recorded here at time of documentation organization, 2026-07-04).

**Context:** After completing Foundation Volume 1 (vision, philosophy, IA, navigation, design system, roles/permissions/security, platform services, object model, knowledge graph, UX principles), the natural next step appeared to be designing the Dashboard.

**Options Considered:**
1. Proceed directly to designing the Dashboard as Volume 2's starting point.
2. Insert the App Shell (the persistent frame every user lives inside — authentication experience, organization selector, workspace switcher, global navigation, sidebar behavior, command palette, notification center, AI assistant panel, user profile menu, global search experience, favorites/recents, quick-create flows) as a prerequisite before the Dashboard.

**Final Decision:** Option 2 — specify the App Shell fully before designing the Dashboard.

**Rationale:** Mirrors how mature products (Notion, Linear, Slack, Microsoft 365) are designed: the shell is the foundation every workspace inherits. Designing the Dashboard first risks building it against an unstable shell.

**Consequences:** Dashboard design work is blocked until App Shell is fully specified. See [06 Platform Core/app-shell.md](06%20Platform%20Core/app-shell.md) for current (partial — component list only) status.

**Superseded by:** None.

---

## ADR-002: Workspaces Are Working Environments, Not Dashboard Collections

**Date:** Recorded during design-structure teardown of reference application (2026-07-03 file timestamp; documented 2026-07-04).

**Context:** The existing Cosmade OS direction had department landing pages built primarily around dashboard widgets and KPI cards. A teardown of a reference enterprise HR product (Spark & Co) showed a fundamentally different pattern: the primary workspace surface is a working table/tool (e.g., an employee directory), with no graphs, statistics, or KPI cards on the main working page.

**Options Considered:**
1. Keep the dashboard-first landing pattern for every department workspace.
2. Correct to a working-environment-first pattern, with dashboards demoted to a distinct "overview" page rather than the default daily-use surface.

**Final Decision:** Option 2. "Dashboards should have analytics. Workspaces should have tools."

**Rationale:** Enterprise users spend their day executing work (reviewing employees, managing pipeline, processing invoices), not watching KPIs. A working-environment-first design reduces cognitive load and matches the "context over navigation" and "speed over decoration" UX principles.

**Consequences:** Every Department OS document ([05 Department Operating Systems](05%20Department%20Operating%20Systems)) must describe a grouped sidebar + primary working surface (table/board/pipeline/editor), not a dashboard-of-widgets, as the default landing experience. Existing dashboard-centric designs need to be revisited against this correction.

**Superseded by:** None.

---

## ADR-003: Mandatory Modal vs. Drawer vs. New-Page Interaction Rule

**Date:** Foundation Volume 1, Chapter 10 (original date not present in source; documented 2026-07-04).

**Context:** Enterprise UI needed a consistent rule for when to surface information/actions in a drawer, a modal, or a full new page, to avoid ad hoc, inconsistent choices across departments.

**Options Considered:**
1. Leave the choice to individual feature designers per screen.
2. Codify a mandatory, platform-wide rule keyed to action type (viewing/editing/reading → drawer; destructive/dangerous confirmation → modal; complex authoring → new page).

**Final Decision:** Option 2, explicitly marked "mandatory" in the source material.

**Rationale:** Consistency principle — "every object behaves similarly" — requires the same interaction surface for the same class of action across all departments.

**Consequences:** Any new feature that proposes a modal for non-destructive work, or a drawer for complex authoring, should be flagged in review. See [03 Design Principles/interaction-patterns.md](03%20Design%20Principles/interaction-patterns.md).

**Superseded by:** None.

---

## ADR-004: Workspace Switcher Lives in the Top Bar, Not the Left Sidebar

**Date:** 2026-07-04 (surfaced during Phase 1 App Shell implementation).

**Context:** `COSMADEOS.txt`'s Enterprise IA section states literally: "The left navigation becomes the permanent backbone of the platform," listing the 13 top-level workspaces (Dashboard, People & HR, Sales, Marketing, Research & Development, Operations, Finance, Documents, Knowledge Base, Training Center, Customers, Analytics, Administration) as left-nav items. Separately, `COSMADEOSDESIGNSTRUCTURE.txt` (the reference-app teardown that produced ADR-002) explicitly maps the reference app's top horizontal bar to these same Cosmade OS workspaces ("Exactly like: People, Sales, Marketing, Finance, Operations for Cosmade OS"), with the left sidebar reserved for grouped sections *within* the active workspace. This conflict was not caught during the documentation-organization pass — it only surfaced once the App Shell component was actually being built.

**Options Considered:**
1. Follow the Enterprise IA document literally: workspaces as left-nav backbone, requiring a second nested left-nav level (or a collapsed single list) for within-workspace sections.
2. Follow the teardown: workspaces as a top horizontal bar; left sidebar exclusively for within-workspace grouped sections (Workforce/Recruitment/Learning/... for HR, Leads/Companies/Contacts/... for Sales, etc.).
3. A hybrid (top bar plus a persistent icon rail).

**Final Decision:** Option 2 — top bar for workspace switching, left sidebar for within-workspace sections.

**Rationale:** This is what the reference screenshot actually shows and what ADR-002 already established as the concrete visual/structural target; it also keeps the left sidebar single-purpose and un-nested, which is simpler to implement and matches "grouped navigation, section headings" as a one-level concept per workspace rather than two competing levels of left-nav.

**Consequences:** [04 Enterprise Architecture/enterprise-information-architecture.md](04%20Enterprise%20Architecture/enterprise-information-architecture.md)'s "Global Navigation Architecture" section's literal "left navigation" wording is superseded by this ADR for implementation purposes — the document itself should be annotated to point here rather than rewritten, since it accurately transcribes what the source said at the time. `web/src/components/shell/top-nav-bar.tsx` and `web/src/lib/navigation.ts` implement this decision.

**Superseded by:** None.

## ADR-005: Authentication Provider — NextAuth.js / Auth.js

**Date:** 2026-07-04 (Phase 1 close-out).

**Context:** The App Shell's Authentication component (`06 Platform Core/app-shell.md`) was scoped but never implemented in Phase 1 pending a provider decision, since no backend/database exists yet (Implementation Volume 2 unauthored).

**Options Considered:** NextAuth.js/Auth.js (framework-native, bring-your-own user store); Clerk (hosted, built-in org/multi-tenancy UI); Supabase Auth (bundles a Postgres backend, would also partially resolve the Volume 2 data-layer gap); deferring the decision entirely.

**Final Decision:** NextAuth.js / Auth.js.

**Rationale:** Framework-native fit for Next.js App Router; no vendor lock-in on the eventual user data model, which matters since Volume 2 (Database Blueprint) hasn't been authored yet and shouldn't be pre-committed to a vendor's schema; supports credentials now and SSO (Google/Microsoft) later without a migration, which an enterprise multi-company OS will likely need.

**Consequences:** Because no real user database exists yet, authentication is implemented against a small in-memory mock user table (`web/src/lib/mock-users.ts`) via NextAuth's Credentials provider — real session cookies, real sign-in/sign-out, real protected routes, but not yet a real user store. This is flagged loudly in code comments and must be revisited once Implementation Volume 2 lands (swap the Credentials `authorize` lookup for a real database query; the session/route-protection plumbing around it does not need to change).

**Superseded by:** None.

## ADR-006: Functionality-First Implementation Standard

**Date:** 2026-07-13 (Phase 6, mid-Sales build-out).

**Context:** Phases 1–6 had produced working, verified pages (Employee Directory, Applicants, Job Listings, Team Documents, Leads, Companies, Contacts, Meetings, Playbooks) that satisfied the Universal Toolbar/Universal States/Universal Object Layout requirements already in CLAUDE.md, but several pages stopped at "correctly display and lightly interact with the data" rather than covering an entity's full working lifecycle (duplicate, restore, permanent delete, version history, comments, and department-specific actions like Convert Lead, Merge Duplicate, or Send Email). The user flagged that enterprise software exists to let someone complete an action, not just view data, and asked for a standing rule requiring every page to be evaluated against real day-to-day employee workflows, not just the Universal Toolbar/Object Layout checklist.

**Options Considered:**
1. Treat this as page-by-page feedback, applied only to pages built from this point forward.
2. Codify it as a permanent, platform-wide implementation standard in CLAUDE.md, since it changes what "complete" means for every entity and workspace, not just the next feature.

**Final Decision:** Option 2 — added as a new "Functionality-First Implementation Rules" section in CLAUDE.md: every page must answer what jobs a user needs to complete there; every entity gets its full CRUD lifecycle (Create/Read/Update/Duplicate/Archive/Restore/Delete/Permanent Delete/Export/Import/Bulk Actions/History/Audit Trail/Comments/Attachments/Permissions/Version History) unless documentation says otherwise; every list page gets the full toolbar plus Quick Preview and a Context Menu; every detail page gets a Quick Actions panel and answers who-created/who-modified/what's-related/what-history-exists; every workspace is evaluated against a representative action set (per department); empty/error states always offer a next step, never a dead end; and mockups/source screenshots define layout only, not the ceiling on functionality — build to what an experienced enterprise PM would expect, not just what's drawn.

**Rationale:** Matches the project's own stated philosophy ("enterprise software quality comes from consistency," "context over navigation") but makes explicit what was previously implicit: displaying data is not the same as letting someone do their job. Prevents future phases from re-litigating this per page.

**Consequences:**
- Going forward, every new page/entity is built against this checklist, not just the Universal Toolbar/Object Layout/States checklists already in CLAUDE.md (this rule is additive to those, not a replacement).
- **Retroactive scope — resolved 2026-07-13:** the user chose to retrofit all 9 pre-ADR-006 entities immediately, before resuming new Sales pages. Completed 2026-07-14: Companies, Contacts, Leads (+ Convert Lead), Meetings (+ Reschedule/Cancel), Playbooks (+ Version History/Share) on Sales; Applicants (+ Hire), Job Listings, Team Documents (+ Version History/Permissions stub), Employee Directory (+ Offboarding status/Print ID Card) on HR. Each gained a real detail page (or a Sheet, for Team Documents — the one case ADR-003 calls for a drawer over a page), full CRUD lifecycle, Comments, and department-appropriate actions. See ROADMAP.md Phase 6 and Phase 5 sections for full verification detail per entity.
- Two real cross-cutting bugs surfaced and were fixed during the retrofit: the `FilterTriggerButton` prop-forwarding bug (had silently broken every page's Filters button since Phase 3 — see ROADMAP.md Phase 3/6), and a permanent-delete/404 navigation race present on every entity detail page (fixed with a `deleting` guard, applied consistently across all 9 entities).
- ROADMAP.md's per-phase "Complete" markings from Phases 1–6, prior to this retrofit, should now be read as satisfied against this standard — the retrofit is done, not deferred.

**Superseded by:** None.

## ADR-007: Genuinely Public Pages Live Outside the `(app)` Route Group

**Date:** 2026-07-26 (Phase 5, HR Careers Page).

**Context:** HR's "Careers Page" nav item (`05 Department Operating Systems/HR/hr-operating-system.md`, Hire pipeline) names a real public-facing careers page a prospective candidate would visit — distinct from an internal admin view of the same data. Every existing route lives under `src/app/(app)/`, gated by that layout's `auth()` check (`src/app/(app)/layout.tsx`), which redirects unauthenticated visitors to `/login`. A careers page behind that gate would be unusable by an actual candidate.

**Options Considered:**
1. Build only the internal admin view (publish/unpublish toggle, "Copy public link") and leave the actual public destination as a documented gap.
2. Build a genuinely public page at a route outside `(app)` (e.g. `src/app/careers/page.tsx`), which the `(app)` layout never wraps since Next.js route groups don't nest sibling top-level routes under each other.

**Final Decision:** Option 2 — `src/app/careers/page.tsx`, a sibling of `src/app/(app)/`, `src/app/login/`, etc. No middleware.ts exists in this project (confirmed by searching the repo); the only gate is the `(app)` layout's own `auth()` redirect, which this route structurally never passes through.

**Rationale:** CLAUDE.md's Functionality-First standard ("mockups define layout, not completeness") calls for building what an experienced PM would actually expect — a "Careers Page" nav item that only shows an internal admin view, with no real destination for the "Copy public link" button to point at, fails that bar. Confirmed genuinely public (not just reachable without clicking through the sidebar) via production build output: `/careers` renders as a static `○` route, unlike every `ƒ` (server-rendered, auth-checked) route under `(app)`.

**Consequences:**
- Any future genuinely public surface (e.g., a status page, a public API docs page) should follow this same pattern — a route outside `(app)`, not a special-cased bypass inside it.
- The public page and the internal app share the same client-side mock-data stores (e.g., `submitApplication` in `applicants.ts`) when running in the same browser tab, but — like every other runtime mutation in this app — that state is client-only and does not survive a hard page navigation between them; this is consistent with the mock-data layer's existing, already-documented behavior everywhere else (Volume 2/Database Blueprint will resolve this for all entities at once, not just this one).
- If real authentication/authorization needs differ meaningfully between public and internal surfaces beyond route placement (rate limiting, CAPTCHA, spam prevention on the public application form), that is out of scope until a real backend exists.

**Superseded by:** None.

## ADR-008: Status Badge / Secondary-Text Color Tokens Darkened for WCAG 2.2 AA

**Date:** 2026-08-11 (Phase 10, Cross-Cutting Hardening — accessibility audit).

**Context:** `11 UX System/accessibility-performance-standards.md` sets a platform-wide WCAG 2.2 AA target. A live contrast audit (canvas-based pixel measurement of actual rendered colors — necessary because this Tailwind v4 setup computes colors via `oklch()`/`oklab()`, which can't be parsed as plain `rgb()` strings) found that every colored status badge across the platform failed 4.5:1 in light mode: `text-destructive` badges measured 4.01:1, `text-emerald-600` 3.34:1, `text-amber-600` 2.96:1, `text-sky-600` (untested but same family, same root cause). `text-destructive` also failed on plain white backgrounds (2.93:1 as originally authored, before this fix) — affecting the "Delete permanently" link/button pattern repeated in nearly every detail page's Settings tab, not just badges. Separately, the neutral/default badge pattern (`bg-muted text-muted-foreground`, used in 19 files for "Draft"/"Not Started"/"Open"/"Unassigned"-type statuses) measured 4.37:1 against its own `bg-muted` background — just under threshold, though `text-muted-foreground` passes fine (4.76:1) against plain white/card backgrounds elsewhere. Dark-mode equivalents (the `dark:text-*-400` variants and dark-mode `--destructive`) already passed comfortably (6–10:1) and needed no change.

**Options Considered:**
1. Leave as-is — a11y audit is scoped as QA polish, not a hard blocker for a mock/dev-only build.
2. Fix per-file, per-badge — add explicit contrast overrides only where visually broken.
3. Fix at the token/pattern level — darken `--destructive`'s light-mode CSS variable in `globals.css` (root cause for all `text-destructive` usage, badges and plain text alike), bulk-replace `text-{emerald,amber,sky}-600` → `-700` platform-wide (the shade that empirically passes both against plain backgrounds and against each color's own `-500/10` badge tint), and replace the literal `"bg-muted text-muted-foreground"` badge string with `"bg-muted text-foreground/70"` (a targeted fix for the one specific background pairing that failed, without darkening `text-muted-foreground` everywhere else it's already fine).

**Final Decision:** Option 3. Single-point fixes at the token/pattern level, not per-file overrides — consistent with CLAUDE.md's coding philosophy ("no speculative one-off styling... fix the design token, not every consumer"). Root-caused and applied:
- `web/src/app/globals.css`: light-mode `--destructive` oklch lightness `0.577` → `0.46` (same hue/chroma, just darker). Dark-mode `--destructive` untouched.
- Platform-wide (all `.tsx` under `src/app` and `src/components`): `text-emerald-600` → `text-emerald-700`, `text-amber-600` → `text-amber-700`, `text-sky-600` → `text-sky-700`. Dark-mode `-400` variants untouched.
- All 19 files using the literal `"bg-muted text-muted-foreground"` neutral-badge string → `"bg-muted text-foreground/70"`.

**Rationale:** These are Tailwind's own semantic-color badge convention, repeated identically across ~50 files this session (`STATUS_TONE` Record constants) — a single CSS-variable/shade fix propagates everywhere the pattern is used, current and future, rather than requiring every new page to remember a non-obvious darker shade. Verified live via the same canvas-based measurement after the fix: `text-destructive` badges 5.57:1, `text-amber-700` 4.66:1, `text-emerald-700` 4.9:1, `text-sky-700` 5.32:1, neutral badges >6:1 — all passing with real margin, not just barely clearing 4.5. Clean `tsc --noEmit`, clean lint, clean production build (all 96 routes) after the change.

**Consequences:**
- Any new `STATUS_TONE`-style badge added in future work should use the `-700` shade (or `text-destructive`/`text-foreground/70` as established here) from the start — the `-600` shade is now known to fail AA and should not be reintroduced.
- This audit was a representative sweep (shared components + a sample of page archetypes — Dashboard, List, Detail/Universal Object Layout, Kanban board, New Page — at a reduced breakpoint set), not an exhaustive check of all 96 routes × the full 14-breakpoint matrix in `responsive-testing-standards.md`. See ROADMAP.md Phase 10 for what's confirmed vs. still open.
- The Kanban board (dnd-kit) and mobile sidebar's `sr-only` icon-button labels were both spot-checked and found already correctly accessible — no changes needed there; documented as verified-good rather than re-litigated in future passes.

**Superseded by:** None.

## ADR-009: Documents and Analytics Recognized as Blocked Top-Level Workspaces

**Date:** 2026-08-15 (post-Phase 10 audit — "audit all that has been done and check what actually remains").

**Context:** A verification audit cross-referenced `web/src/lib/navigation.ts`'s 13-entry top-level workspace list against ROADMAP.md's "Remaining Departments" tracking table (Phase 9). The canonical navigation list — matching `04 Enterprise Architecture/enterprise-information-architecture.md` line 36's source-defined order (`Dashboard · People & HR · Sales · Marketing · Research & Development · Operations · Finance · Documents · Knowledge Base · Training Center · Customers · Analytics · Administration`) — includes `Documents` and `Analytics` as distinct top-level workspaces, each rendering only a `WorkspaceComingSoon` placeholder behind an optional `[[...slug]]` catch-all route (the same unbuilt-route signature as Customers, Research, and Administration). ROADMAP.md's Remaining Departments table tracked only Customers, Research & Development, and Administration as Blocked — Documents and Analytics were never listed, in Phase 9 or anywhere else in the document. An exhaustive `find`/`grep` sweep of the entire docs tree confirmed no operating-system document exists for either, at any path — the same situation as Administration, not an oversight in a folder that was simply hard to find.

This gap is distinct from two things that ARE built and should not be confused with it: (1) the per-object "Documents" and "Analytics" tabs, part of the Universal Object Layout, present on every business object; (2) HR's "Team Documents" department page. Both are real, working features. The missing pieces are the cross-cutting, company-wide **workspaces** by those names — a document repository and a BI/reporting hub spanning the whole platform — which is what `enterprise-information-architecture.md` names at the top-level nav position.

**Options Considered:**
1. Leave ROADMAP.md as-is — treat this as a minor tracking omission not worth a formal entry.
2. Add Documents and Analytics to the Remaining Departments table as Blocked, matching Administration's exact reasoning and format, and log the discovery as an ADR per CLAUDE.md's rule that any correction to standing tracking gets recorded regardless of outcome.

**Final Decision:** Option 2. Added both to ROADMAP.md's Remaining Departments table (Phase 9) as **Blocked**, citing the same rule Administration was already blocked under: CLAUDE.md's Decision-Making Framework and Rules for Proposing Architectural Changes both prohibit inventing architecture for a workspace with no source material. No implementation was attempted for either.

**Rationale:** CLAUDE.md is explicit that self-tracking documents are not exempt from the same rigor applied to the product itself — "never silently override a documented decision" and "record the outcome... regardless of outcome" apply equally to fixing the tracking document itself. Leaving two source-named, nav-wired workspaces completely absent from the one document whose job is to say what remains would let future sessions believe Phase 9 was closer to done than it is.

**Consequences:**
- The project now has **five** Blocked top-level workspaces, not three: Customers, Research & Development, Administration, Documents, Analytics. All five require the same unblocking step — source operating-system documentation supplied by the user — before any implementation work can start.
- Future audits should treat "cross-reference `navigation.ts` against the tracking table" as a standard, repeatable check — it is what surfaced this gap, and nothing about the underlying pattern (a nav entry silently existing behind a placeholder route with no tracking entry) is specific to this one instance.
- No code changes result from this ADR. Only [ROADMAP.md](ROADMAP.md)'s Remaining Departments table was edited.

**Superseded by:** None.

## ADR-010: Reduced Motion Enforced Platform-Wide at the Global CSS Layer

**Date:** 2026-08-15 (extended Phase 10 accessibility pass, continuation of the same "audit what actually remains" session as ADR-009).

**Context:** `11 UX System/accessibility-performance-standards.md` states plainly: "Every interaction must be usable with: keyboard only, screen readers, high zoom levels, reduced motion preferences, high-contrast themes (future)." A codebase-wide search found zero handling of `prefers-reduced-motion` anywhere in first-party code — every Base UI Dialog/Sheet/Popover open-close transition, hover/focus transition, and dnd-kit drag animation ignored the OS-level setting. Two third-party library styles (`tw-animate-css`'s `.shimmer`, Sonner's toast transitions) already respected it, which is what made the gap easy to miss on casual inspection — some things visibly correctly, most didn't.

**Options Considered:**
1. Leave unaddressed — treat as future QA polish, same as the initial (superseded) framing of the accessibility audit item in ROADMAP.md.
2. Add `prefers-reduced-motion` handling per-component, matching each animation individually.
3. Add one global CSS rule at the root layer (`globals.css`) collapsing all animation/transition durations under the media query, covering every current and future animated element automatically.

**Final Decision:** Option 3, consistent with ADR-008's established precedent for this exact category of fix (root-cause at the token/pattern level, not per-component overrides). Added to `web/src/app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Rationale:** A global, `!important`-enforced rule at the shared CSS layer means no future component — a new Dialog variant, a new dnd-kit board, a new page transition — can reintroduce this gap by omission the way the per-component approach already had. Verified live: the rule compiles into the served stylesheet and coexists correctly with the two pre-existing library-level reduced-motion rules (confirmed via direct `document.styleSheets` inspection in a running dev server). Clean `tsc --noEmit` after the change.

**Consequences:**
- No component-level code changes were needed or made — this is a pure CSS-layer fix.
- True screen-reader testing with an actual assistive-technology product (NVDA/VoiceOver) and high-zoom behavior remain unaudited — tracked as open items in ROADMAP.md's Accessibility audit findings, unchanged by this ADR.

**Superseded by:** None.

## ADR-011: Proposed Documentation Drafted for All Five Blocked Workspaces, Pending Review

**Date:** 2026-08-15 (same session as ADR-009/ADR-010, in direct response to the user's explicit request to unblock Customers, Research, Administration, Documents, and Analytics).

**Context:** All five workspaces were tracked as Blocked in ROADMAP.md's Remaining Departments table because CLAUDE.md's Decision-Making Framework and Rules for Proposing Architectural Changes both prohibit inventing architecture without source material. The user was asked directly how to proceed (draft proposed docs for review / wait for real source material / build now with no documentation) and chose **draft proposed docs for review**.

**Options Considered:** See the three options put to the user (draft-for-review / wait / build-now-undocumented) — not re-litigated here since the user already chose.

**Final Decision:** Drafted proposed operating-system documentation for all five, each explicitly marked as a proposal (not a decision) at the top of the file, following CLAUDE.md's own process ("propose the change, cite the existing decision, state the reason"):
- [Customers](../05%20Department%20Operating%20Systems/Customers/customers-operating-system.md) and [Research](../05%20Department%20Operating%20Systems/Research/research-operating-system.md) already had partial documents (Purpose/Vision/Cross-Workspace-Linking context existed; only the Workspace Sidebar / Primary Working Surface sections were gapped) — expanded those two specific gaps in place, grounded in CLAUDE.md's own already-decided per-department action sets (Customers: `Add Customer, Merge Customer, Create Opportunity, Create Contract, Record Meeting, Upload Documents, Assign Manager, Track Health, Renew Contract`; Research: `Create Project, Submit Idea, Approve Idea, Archive Research, Compare Competitors, Create Prototype, Assign Researchers, Record Findings, Generate Report`) rather than invented from nothing.
- [Administration](../05%20Department%20Operating%20Systems/Administration/administration-operating-system.md), [Documents](../05%20Department%20Operating%20Systems/Documents/documents-operating-system.md), and [Analytics](../05%20Department%20Operating%20Systems/Analytics/analytics-operating-system.md) had zero prior documentation — wrote full new proposed documents from scratch, following the standard template. Administration is grounded the same way (CLAUDE.md's action set: `Create User, Assign Role, Reset Password, Configure Department, Create Workflow, Create Automation, Manage Integrations, Audit Activity`, plus the existing role list in [09 Security/security-overview.md](../09%20Security/security-overview.md)). Documents and Analytics have no CLAUDE.md action set to ground against — these two lean more heavily on inference from platform-wide patterns (Knowledge Base's structure for Documents; ADR-002's dashboard/workspace split for Analytics) and are flagged as the least-grounded of the five.
- Updated [README.md](../README.md)'s Documentation Map to list all three new folders as "proposed, pending review."

**Rationale:** This keeps CLAUDE.md's documentation standard intact — nothing is silently presented as decided, every inferred section is marked `> **Proposed:**`, and each document names the specific open questions that need the user's answer before implementation (e.g., Documents' "central repository vs. per-object store" data-model question). This is meaningfully different from the "just build it" option the user didn't choose — no application code was written against any of these five workspaces in this pass.

**Consequences:**
- ROADMAP.md's Remaining Departments table status changes from "Blocked — no documentation exists" to "Blocked — proposed documentation drafted, awaiting your review" for all five.
- None of these five should be built against until the user has reviewed and confirmed/edited each proposed document — the proposals are a starting point for discussion, not a green light to implement.
- The next natural step, once the user reviews, is either (a) edits/corrections to the proposed docs, after which normal Functionality-First implementation can begin per every other built department's precedent, or (b) real source material superseding the proposals outright.

**Superseded by:** None.

## ADR-012: Fixed a Pre-Existing Crash in the Global Command Palette (Missing `<Command>` Root)

**Date:** 2026-08-15 (Phase 1 App Shell completion pass, same session as ADR-009/010/011).

**Context:** While extending the Global Command Palette with real Search/Create/Favorites/Recents (closing several Phase 1 "Partial"/"Not Started" items), live browser verification found the palette crashed immediately on every open: `Uncaught TypeError: Cannot read properties of undefined (reading 'subscribe')`. Bisection confirmed this was **not** caused by the new code — the exact same crash reproduced with the byte-for-byte original, untouched `command-palette.tsx`. Root cause traced into `web/src/components/ui/command.tsx`'s `CommandDialog`: it rendered `{children}` (the `CommandInput`/`CommandList`/`CommandGroup`/`CommandItem` tree) directly inside `DialogContent`, but never wrapped them in cmdk's own `<Command>` root component. Every `CommandPrimitive.*` sub-component reads a React context supplied only by that root (confirmed by reading cmdk's own source: `useCommandState` calls `useContext(...).subscribe`, which is `undefined` with no ancestor `<Command>`) — so the palette had no way to open successfully, in this build, regardless of what today's feature work touched.

**Options Considered:**
1. Leave as a known issue, note it in ROADMAP.md, move on — the crash predates this session's work.
2. Root-cause and fix — wrap `CommandDialog`'s `{children}` in `<Command>`, the one-line fix implied by the diagnosis.

**Final Decision:** Option 2. Fixed `web/src/components/ui/command.tsx` by wrapping the existing `{children}` in `<Command>{children}</Command>` inside `DialogContent`. No other files needed changes — every consumer (`CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`, `CommandEmpty`) already assumed a `<Command>` ancestor would exist, per the shadcn/ui convention this file otherwise follows.

**Rationale:** This blocked the entire Command Palette feature, not just today's additions — CLAUDE.md's "Global search first" (Principle 6) and the App Shell's own documented Search/Create requirements were unreachable regardless of any UI built on top. Fixing the shared component once fixes it for every current and future consumer, consistent with this project's established pattern of root-causing at the shared-component layer (see ADR-008, ADR-010).

**Consequences:**
- Live-verified post-fix: Navigate, real cross-entity Search (typed "Adekunle" → correct vendor result with category), star-toggle-to-Favorites, Recent tracking after selecting a result, and navigation on select all confirmed working end-to-end in a running dev server.
- This means ROADMAP.md's prior "Global command palette — Partial: Navigate only" status may have been optimistic even before today — it's unclear whether the palette ever successfully opened in this exact dependency combination (Next.js 16.2.10 / React 19.2.4 / cmdk 1.1.1), or whether this is a recent regression from a dependency bump. Not investigated further since the fix resolves it either way.
- No other Base UI Dialog/Sheet/Popover consumer in the codebase has this issue — this bug was specific to `command.tsx`'s bespoke wrapping of the third-party `cmdk` library, not the project's own Dialog/Sheet primitives (which don't have this root-context requirement).

**Superseded by:** None.

## ADR-013: Real Audit Trail Built for the "History" Tab, Without Fabricating Historical Data

**Date:** 2026-08-17 (continuation of the same session as ADR-009 through ADR-012).

**Context:** Auditing the Universal Object Layout's standard tab set against CLAUDE.md's own "CRUD Is Mandatory" section — which explicitly names "Activity History, Audit Trail" as required on every entity, and requires every detail page answer "Who created this? When was it created? Who modified it?" — found the "History" tab was infrastructure-only on 14 of 20 built detail pages: static `"No change history yet."` text, no data model, no way to ever answer those questions. (The other 6 pages already had real version-history data from document-versioning features and were unaffected.)

**Options Considered:**
1. Leave as-is, track it as a known gap.
2. Seed each entity with a fabricated "Created by [invented name] on [invented date]" history entry so the tab never looks empty.
3. Build a real, working audit-trail store and UI, logging entries only for genuine actions taken after the store exists — accept that pre-existing mock records have no history before this point, and say so honestly via the tab's empty state.

**Final Decision:** Option 3. Option 2 was rejected explicitly — it would have fabricated specific actors and dates for events that never happened, the same category of dishonest UI this session has consistently refused elsewhere (see the Sync Pending note in ROADMAP.md's Phase 10 Universal States audit: "fabricating one... would be dishonest UI rather than a genuine state"). Built `web/src/lib/mock-data/record-history.ts` (shared store) and `web/src/components/ui/record-history.tsx` (`RecordHistory` display component + `useLogRecordHistory` hook), then retrofitted all 14 placeholder pages to use the real component. Live logging was first wired into 5 representative pages spanning 5 departments to prove the pattern end-to-end, then (2026-08-19, same session) extended to the remaining 9 — all 14 now log real lifecycle events, not just render the component.

**Rationale:** A record's history tab showing "No history yet" for a record that genuinely has none is honest and matches CLAUDE.md's "Every Empty State Must Be Useful" rule (a clear description of what's missing, here: "Actions taken on this record... will appear here"). A record's history tab showing an invented creation event it never had would be a Confidence-principle violation (CLAUDE.md AI Philosophy/UI Philosophy: users should never wonder if something worked, which implies never showing them something that didn't happen either).

**Consequences:**
- Any newly built detail page going forward should wire `useLogRecordHistory` into its lifecycle actions from the start, the same way `EntityComments`/Comments became a standard inclusion after ADR-006's retrofit.
- Clean `tsc --noEmit` after the full change (all 14 pages); lint and production build re-confirmed after the final 9-page extension.

**Superseded by:** None.

## ADR-014: Density System Rebuilt at the Shared `Table` Component, Rolled Out Platform-Wide

**Date:** 2026-08-19 (continuation of the same session as ADR-009 through ADR-013).

**Context:** CLAUDE.md's Implementation Rules state, without qualification: "Every operational list view carries: Search, Filters, Saved Views, Sort, Group, Columns, Density, Export, Import, Refresh, Create, Bulk Actions. Never strip these from an enterprise table." `PageToolbar` (`web/src/components/ui/page-toolbar.tsx`) already had a `Density` type and an optional density control, and Phase 3 of ROADMAP.md marked the whole toolbar — Density included — "Complete." Auditing actual usage found this was materially overstated: exactly 1 of ~32 list surfaces (HR Directory) wired the control up at all, and even there it only distinguished "comfortable" from a collapsed "compact-or-dense," not three genuinely different states — the `<Table>` component itself (`web/src/components/ui/table.tsx`) had no concept of density whatsoever; row height and cell padding were hardcoded.

**Options Considered:**
1. Leave as tracked but low-priority polish.
2. Add a `density` prop to every individual `<TableCell>`/`<TableHead>` call site across ~26 list pages (hundreds of individual JSX elements).
3. Implement density once at the shared `Table`/`TableHead`/`TableCell` component level via React context, then have each list page opt in with a single `density` prop on `<Table>`.

**Final Decision:** Option 3, consistent with this session's established pattern of root-causing shared-component gaps rather than patching call sites (see ADR-008, ADR-010, ADR-012). Added a `TableDensity` context to `table.tsx` with three genuinely distinct levels (comfortable/compact/dense — row height and cell padding all differ), defaulting to "comfortable" so no page regresses without opting in. Added `CARD_GRID_DENSITY_CLASS`/`CARD_DENSITY_CLASS` to `page-toolbar.tsx` for the card-grid list pages CLAUDE.md's own density definition also names ("card spacing"). Rolled out to all 26 `<Table>`-based list pages and all 6 card-grid list pages — every list page in the platform now has a working three-state Density control.

**Rationale:** A single shared-component fix, applied once, closes the gap for every current list page and any future one automatically — the same reasoning already applied to Pagination (Phase 10) and the AI Assistant Panel/History tab (this session). Per-call-site wiring (option 2) would have meant re-doing this exercise every time a new list page is built, exactly the kind of drift this project has repeatedly found and corrected.

**Consequences:**
- A bulk rollout script (Python regex, following the same pattern as the Pagination and AI-tab retrofits) introduced a real indentation bug on first pass — it consumed the whitespace of the line immediately following its insertion point across 22 files, producing broken indentation (though syntactically valid JSX). Caught by direct file inspection (not by `tsc`/`eslint`, neither of which flag pure whitespace), and fixed with a second targeted script before commit. Logged here as the same category of "verify a bulk script's actual diff, not just its own success report" lesson already recorded for the Pagination rollout's structural-outlier failures.
- Any new list page built going forward should wire `density`/`onDensityChange` into its `PageToolbar` and pass `density` to its `<Table>` (or use `CARD_GRID_DENSITY_CLASS` for a card grid) from the start, the same way Pagination and Comments became standard inclusions after their own retrofits.
- Live-verified via direct DOM measurement (not just visual inspection): Vendors list row height 40px (comfortable) → 28px (dense), with the correct Tailwind classes confirmed applied at each level.
- Clean `tsc --noEmit`, clean lint, clean production build (76/76 routes) after the full rollout.

**Superseded by:** None.

## ADR-015: Three More Developer Preview Toolbar Items Built Where Genuinely Tractable, Rest Correctly Left Blocked

**Date:** 2026-08-19 (continuation of the same session as ADR-009 through ADR-014).

**Context:** `06 Platform Core/developer-preview-toolbar.md` specifies eleven toolbar components; ROADMAP.md tracked Screen Switcher, Language Switcher, Permission Overlay, Grid Overlay, Component Inspector, Sample Data Switcher, and Notification Generator all together as "not yet — need target screens/data." That framing was too coarse: some of these seven items genuinely need a system that doesn't exist yet (i18n for Language, RBAC for Permission Overlay, a component-metadata layer for Component Inspector, alternate-dataset generation for Sample Data), but three do not — they were simply unbuilt, not blocked.

**Options Considered:**
1. Leave all seven grouped as "not yet — need target screens/data," unchanged.
2. Individually assess each of the seven against what it actually depends on, and build whichever ones have no real blocker.

**Final Decision:** Option 2. Built the three found to be genuinely tractable:
- **Screen Switcher** — reuses `workspaceSidebars` (`web/src/lib/navigation.ts`), the exact same data structure the real production sidebar already renders from. No new data invented; the switcher just surfaces what already exists.
- **Grid Overlay** — a pure CSS overlay (8px grid + 12-column layout guides), `pointer-events-none`, no dependency on anything else.
- **Notification Generator** — extends the real Notification Center store (`web/src/lib/mock-data/notifications.ts`, built earlier this session per the App Shell work) with a `generateTestNotification(kind)` function and the doc's exact seven named kinds (Success/Error/Warning/Information/Approval Request/Mention/Reminder). Generated notifications land in the same store real notifications use — there's no separate "fake" channel to maintain.

Left correctly blocked, with the specific missing system named for each: Language Switcher (i18n), Permission Overlay (RBAC — same blocker as the standing Security/permission audit item), Component Inspector (a component-metadata system), Sample Data Switcher (alternate-dataset generation at the scale the doc specifies — Small/Medium/Enterprise/Healthcare/Manufacturing/Empty/Stress-Test company presets).

**Rationale:** Grouping tractable and genuinely-blocked items together made the toolbar look more blocked than it was, and risked the tractable ones being skipped indefinitely under the umbrella of "needs infrastructure." Assessing each item against CLAUDE.md's own standard (does building it require inventing new architecture, or does it just require using what's already decided/built?) is the same discipline already applied to the five blocked workspaces (ADR-011) and the Security/RBAC audit.

**Consequences:**
- Found and fixed a real, pre-existing bug in the same pass: the Screen Switcher's `Select` displayed the raw href instead of the screen's label — the same Base UI `Select.Value` limitation already logged and fixed once during Phase 3 (`advanced-filter.tsx`). Fixed with the identical established pattern (a render-function passed as `SelectValue`'s children) rather than a one-off workaround.
- Live-verified end-to-end: selecting "Audit Logs" in Screen navigated to `/operations/audit-logs`; generating an "Approval Request" test notification appeared correctly in the real Notification Center popover.
- Clean `tsc --noEmit`, clean lint, clean production build (76/76 routes) after the change.

**Superseded by:** None.

## ADR-016: Saved Views and Column Visibility Rolled Out Platform-Wide, Same Pattern as Density

**Date:** 2026-08-19 (same session as ADR-014/ADR-015, continuing the same audit line).

**Context:** CLAUDE.md's Implementation Rules state, in one sentence: "Every operational list view carries: Search, Filters, Saved Views, Sort, Group, Columns, Density, Export, Import, Refresh, Create, Bulk Actions." ADR-014 fixed Density; the same audit found "Saved Views" and "Columns" — named in that identical sentence — had the identical problem. `PageToolbar` already exposed `savedViewsControl` and `columns`/`onColumnToggle` prop slots, but not one production list page wired them up; only the internal `/dev/list-toolbar-demo` harness did.

**Options Considered:**
1. Leave as tracked, lower-priority polish, same as Density's status before ADR-014.
2. Build the missing store/hook once at the shared layer and roll out to every real list page, matching ADR-014's approach exactly.

**Final Decision:** Option 2. Built `web/src/lib/mock-data/saved-views.ts` (a generic per-`pageKey` named-snapshot store — Apply/Save/Delete, the snapshot shape is whatever each page defines), `web/src/components/ui/saved-views-menu.tsx` (`SavedViewsMenu`, plugs into `PageToolbar`'s existing `savedViewsControl` slot), and `web/src/lib/use-column-visibility.ts` (`useColumnVisibility`, tracks hidden columns and exposes `isVisible(id)` for conditional `<TableHead>`/`<TableCell>` rendering — the other half of `PageToolbar`'s pre-existing `columns` prop). Rolled out Saved Views to 33 of 36 real list surfaces and Column Visibility to all 26 genuine `<Table>`-based pages among them. The 6 card-grid list pages and the one Calendar-based page (Content Calendar) get Saved Views only, since "Columns" has no meaning for a card grid or a calendar month view. The 3 pages left out entirely (Departmental Training, Progress, Reports × 3, Budget Planning) are the same small fixed-size computed-rollup pages already excluded from Pagination in an earlier phase, for the identical reason: no `PageToolbar` search/filter state exists on them to snapshot in the first place.

**Rationale:** Same as ADR-014 — fix once at the shared layer rather than per-page, so it can't silently regress on the next new list page. Given each page's snapshot shape (which state variables it has) and column list genuinely differ per page — unlike Density, which was a single mechanical two-line insertion everywhere — every page in this rollout was hand-edited rather than scripted, deliberately avoiding the class of bulk-script bug logged in ADR-014's Consequences.

**Consequences:**
- Found and fixed a real, pre-existing, build-breaking bug while doing this: `web/src/app/(app)/operations/vendors/page.tsx` called a `renderVendorRow(vendor)` helper (inside the Group-By rendering branch added in an earlier, uncommitted pass) that was never actually defined — an orphaned function reference. `tsc --noEmit` caught it immediately once run; a purely visual/manual check would not have. Reconstructed the function from the original inline row markup and wired it correctly with the new column-visibility conditionals.
- Any new list page built going forward should wire `SavedViewsMenu` (via `savedViewsControl`) and, if it renders a real `<Table>`, `useColumnVisibility` from the start — the same "becomes a standard inclusion after its own retrofit" pattern already established for Pagination, Comments, and Density.
- Clean `tsc --noEmit`, clean lint, clean production build after the full rollout.

**Superseded by:** None.

## Decisions Pending / Not Yet Made

The following are flagged as needing a decision once relevant source material or stakeholder input is available — not decided in the supplied source material:

- Full RBAC / permission matrix detail (referenced as established in earlier Foundation chapters, not supplied).
- Data model / schema decisions (deferred to Implementation Volume 2 — Database Blueprint, not yet authored).
- Backend service boundary decisions (deferred to Implementation Volume 3, not yet authored).
- Frontend framework/state-management decisions (deferred to Implementation Volume 4, not yet authored).
