# SKILLS.md — Reusable Process Library

A playbook of proven workflows for recurring work on Cosmade OS. Add a new skill here once a workflow has been used successfully and is worth repeating exactly.

---

## Skill: Organizing Raw Architecture Conversation into Enterprise Documentation

**Purpose:** Convert an unstructured design conversation (chat log, brainstorm, mixed recommendations) into a structured, enterprise-grade documentation repository without losing or inventing content.

**When to use it:** Any time new raw source material (a conversation export, a new design session, a pasted transcript) needs to be merged into this repository.

**Inputs:** Raw conversation text/files; the existing documentation repository; [DECISIONS.md](DECISIONS.md) and [MEMORY.md](MEMORY.md) for prior context.

**Outputs:** Updated/new documents under the correct numbered folder; updated cross-references; updated [MEMORY.md](MEMORY.md) and [DECISIONS.md](DECISIONS.md) if new durable decisions appear; an explicit gap list for anything referenced-but-missing.

**Step-by-step process:**
1. Identify where formal documentation begins vs. brainstorming filler ("Continue," "Go ahead," "I agree" are not documentation; the response that follows them is).
2. Extract architecture, philosophy, rationale, recommendations, and future-work notes — including recommendations at the end of sections, which often become future chapters.
3. Map each extracted block to the correct numbered folder using the existing taxonomy in [README.md](README.md). Do not invent a new folder without flagging it.
4. Check for conflicts against existing documents. If found, stop and ask the user — do not resolve unilaterally.
5. Write/update documents using the standard template (Title → Purpose → Vision → Philosophy → Architecture → Principles → Components → User Flows → Information Architecture → Data Model → Permissions → AI Capabilities → Automation → Integrations → Analytics → Administration → Security → UX Notes → Future Expansion) where the document is a major volume; use a lighter format for atomic reference notes and link them to their parent volume.
6. Mark anything referenced but not supplied as `> **Gap:**` rather than fabricating it.
7. Update cross-references bidirectionally (if Doc A links to Doc B, Doc B's "related documents" should mention Doc A).
8. Log any new durable decision in [DECISIONS.md](DECISIONS.md); update [MEMORY.md](MEMORY.md) if it changes standing behavior/preference.

**Quality checklist:**
- No information from the source was dropped or shortened for convenience.
- No content was invented to fill a gap.
- Every document follows the shared template or explicitly says why it doesn't.
- Cross-references resolve both directions.
- Terminology is consistent across all touched documents (e.g., "workspace" used consistently, not mixed with "module").

**Common mistakes:**
- Treating conversational filler as documentation, or treating real recommendations as filler and dropping them.
- Filling a missing chapter with plausible-sounding invented content instead of flagging the gap.
- Producing one giant document instead of focused, cross-referenced ones.

**Related documents:** [README.md](README.md), [CLAUDE.md](CLAUDE.md), [CONTEXT.md](CONTEXT.md).

---

## Skill: Writing a New Department Operating System Document

**Purpose:** Produce a complete Department OS document (e.g., HR, Sales, Finance) consistent with the rest of [05 Department Operating Systems](05%20Department%20Operating%20Systems).

**When to use it:** A new department is added, or an existing department's documentation needs to be completed beyond its current navigation-example stub.

**Inputs:** Any existing navigation/workflow examples for the department; the Universal Object Model and Page Anatomy ([04 Enterprise Architecture](04%20Enterprise%20Architecture)); the design-system teardown ([11 UX System/design-system-teardown.md](11%20UX%20System/design-system-teardown.md)).

**Outputs:** One markdown file under `05 Department Operating Systems/<Department>/`.

**Step-by-step process:**
1. Confirm the department's grouped sidebar sections (e.g., HR: Onboarding, Documents, Hire) from existing source material; if none exist yet, mark as a gap rather than inventing them.
2. Apply the full document template.
3. Under Architecture/Components, describe the sidebar section groupings and the primary working surface (table/pipeline/editor) per the "workspaces are working environments" principle — never default to a dashboard-first description.
4. Under Data Model/Permissions/Security, either cite the shared platform model (roles, universal object layout) or mark as pending Volume 2/earlier chapters.
5. Cross-link to [04 Enterprise Architecture](04%20Enterprise%20Architecture), [11 UX System](11%20UX%20System), and any sibling department docs with shared objects (e.g., Sales ↔ Finance via Invoices).

**Quality checklist:**
- Sidebar grouping matches the pattern style (uppercase section labels, not clickable; items with icon + text).
- Main working surface described is a table/board/editor, not a KPI dashboard, unless the department doc explicitly designates a page as an overview/dashboard page.
- All template sections present, gaps marked explicitly.

**Common mistakes:**
- Describing the department landing page as a dashboard of widgets (rejected pattern — see [MEMORY.md](MEMORY.md)).
- Inventing department-specific tab names instead of using the Universal Object Layout tab set.

**Related documents:** [04 Enterprise Architecture/enterprise-information-architecture.md](04%20Enterprise%20Architecture/enterprise-information-architecture.md), [11 UX System/design-system-teardown.md](11%20UX%20System/design-system-teardown.md).

---

## Skill: Performing an Architecture Review Before a New Volume

**Purpose:** Validate that a new Implementation Series volume (e.g., Volume 2: Database Blueprint) is ready to be authored without contradicting existing decisions.

**When to use it:** Before starting any Volume 2–5 work, or before adding a new top-level workspace/department.

**Inputs:** [DECISIONS.md](DECISIONS.md), [MEMORY.md](MEMORY.md), [04 Enterprise Architecture](04%20Enterprise%20Architecture).

**Outputs:** A short review note confirming readiness or listing blockers, appended to [13 Roadmaps](13%20Roadmaps).

**Step-by-step process:**
1. Confirm the prior volume in sequence is complete (per [CLAUDE.md](CLAUDE.md) phase-based execution rules).
2. Check the new volume's scope against the Universal Object Model and existing navigation/IA decisions for contradictions.
3. Run the new scope through the Decision-Making Framework (10 questions) in [CLAUDE.md](CLAUDE.md).
4. Document any blocker as a gap; do not proceed past a blocker by inventing the missing prerequisite.

**Quality checklist:** All 10 decision-framework questions answered; no unresolved contradiction with existing ADRs.

**Common mistakes:** Starting Volume 3 (Backend) concerns while Volume 2 (Database Blueprint) is still unauthored.

**Related documents:** [13 Roadmaps/future-implementation-volumes.md](13%20Roadmaps/future-implementation-volumes.md).
