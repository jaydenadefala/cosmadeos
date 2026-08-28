# Documents Operating System

> **PROPOSED DOCUMENT — pending your review, not sourced.** No source material exists for the Documents workspace at all. It is named only once in the entire supplied source material — as an entry in the canonical top-level navigation list in [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md) line 36 — with zero further detail anywhere. Everything below is inferred from platform-wide patterns already decided elsewhere (Knowledge Base's structure, the per-object Documents tab, HR's Team Documents page). Nothing here should be treated as source of truth until reviewed. Drafted 2026-08-15 in response to an explicit request to unblock this workspace via proposed documentation.

## Purpose
Define the Documents workspace — a company-wide document repository, distinct from two things that are already built and should not be confused with it: (1) the per-object `Documents` tab (Universal Object Layout, present on every business object — a Company's contracts, an Employee's files, etc.), and (2) HR's Team Documents page (`/hr/documents`, HR-department-scoped). This workspace is for files that span departments or belong to no single object — company-wide policies, legal filings, shared templates, cross-department contracts.

## Vision
> **Proposed:** Every document any object links to (via its Documents tab) should also be reachable from one central, searchable repository — the same relationship Knowledge Base already has with every object's `Knowledge` tab (see [05 Department Operating Systems/Knowledge/knowledge-operating-system.md](../Knowledge/knowledge-operating-system.md)). Documents is to files what Knowledge Base is to articles.

## Philosophy
Per ADR-002, this workspace's main area should be a working environment (a document library/browser), not a dashboard — consistent with every other built department, and directly mirroring Knowledge Base's own philosophy statement.

## Architecture

### Workspace Sidebar (grouped sections)
> **Proposed (not sourced):** No department action set exists for Documents in CLAUDE.md (unlike Customers/Research/Administration, which do). Proposing from the Knowledge Base precedent and CLAUDE.md's general CRUD/lifecycle requirements:

- **All Documents** — the primary repository table/grid, every uploaded file platform-wide (permission-filtered)
- **Shared with Me** — documents explicitly shared with the current user, mirrors the Share action already built for Knowledge Articles/Playbooks
- **Company Policies** — company-wide policy documents (distinct from HR's employee-facing Handbook/Policies, which stay HR-scoped)
- **Contracts & Legal** — cross-department contracts not owned by a single Customer/Vendor record
- **Templates** — shared document templates (distinct from Knowledge Base's Templates section, which is content templates, not file templates — this distinction needs your confirmation, it may turn out these should simply be the same section)
- **Recently Viewed** — mirrors the platform-wide Favorites & recents pattern named in [06 Platform Core/app-shell.md](../../06%20Platform%20Core/app-shell.md)

> This sidebar has real overlap risk with Knowledge Base's Templates section and HR's Policies/Handbook — flagging explicitly rather than silently resolving it. Needs your decision on where the boundary sits before building.

### Primary Working Surface
> **Proposed (not sourced):** A document library — grid or table view (user-toggleable, given the platform's existing card-grid-vs-table precedent split between e.g. Knowledge Articles' cards and Vendors' table) with folder/collection browsing, full-text search, and drag-and-drop upload (the same drag-and-drop pattern already built for Marketing's Creative Library).

## Principles
Universal Object Layout does not apply directly — Documents is a repository of files, not a business object with its own detail-page tab set. Its closest analog is the Knowledge Article object (a content record with version history and permissions), applied to raw files instead of authored articles.

## Components
> **Proposed (not sourced):** Document library (grid/table toggle), folder/collection browser, upload flow (drag-and-drop, mirrors Creative Library), version history and permissions (already-built primitives — reuse the same version-history/permissions/comments pattern used for Team Documents, Playbooks, and Knowledge Articles rather than building new ones).

## User Flows
> **Gap:** Not supplied. Needs: upload flow, folder/collection organization flow, sharing flow, and a defined boundary against the per-object Documents tab (does uploading here let you also attach the same file to a Customer/Vendor record, or are they entirely separate stores?).

## Information Architecture
> **Proposed:** Should be the aggregation point every object's `Documents` tab reads from and writes to — the same cross-cutting-hub relationship Knowledge Base has via the `Knowledge` tab (see [05 Department Operating Systems/Knowledge/knowledge-operating-system.md](../Knowledge/knowledge-operating-system.md) Information Architecture section). This is the single most important open question for this workspace: is per-object "Documents" a *view into* this central repository, or a *separate* store? CLAUDE.md's "Every Module Must Be Connected" principle argues for the former, but this needs your confirmation before implementation, since it affects the data model.

## Data Model
> **Gap:** Pending Implementation Volume 2. See the Information Architecture question above — resolving "central store vs. per-object store" is a data-model decision, not just a UI one.

## Permissions
> **Gap:** Not detailed. Document-level sharing/permissions would follow the same pattern already built for Knowledge Articles and Playbooks (owner, shared-with list, view/edit distinction).

## AI Capabilities
> **Gap:** No Documents-specific AI examples were supplied in [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md). A reasonable extension, consistent with that document's existing Finance/Customer examples: "Summarize this document," "Find similar documents," "Extract key terms from this contract."

## Automation
> **Gap:** Not detailed. Document-triggered automation (e.g., "notify Finance when a contract is uploaded") would connect to Administration's proposed Workflows & Automation section.

## Integrations
> **Gap:** Not present in source material. A real Documents workspace would likely need cloud-storage integration (Google Drive/SharePoint/S3) once Implementation Volume 2/3 exist — out of scope for a mock, client-only build.

## Analytics
> **Gap:** Not detailed. Would likely surface storage usage, most-viewed documents, and stale/expiring-contract alerts.

## Administration
> **Gap:** Not detailed. Storage quotas and retention policy would be configured here or in the Administration workspace's Departments section — needs your decision.

## Security
Same permission model as every other object once RBAC exists (see [09 Security/security-overview.md](../../09%20Security/security-overview.md)); contracts/legal documents in particular would warrant the platform's most restrictive default visibility.

## UX Notes
> **Gap:** No visual/structural example specific to this workspace was supplied; should follow the shared platform visual language by default, same as every other built department.

## Future Expansion
**Blocked pending your review of this proposal**, and specifically pending your answer to the "central repository vs. per-object store" question above — that answer changes the data model, not just the UI, so it should be resolved before any build work begins.

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [05 Department Operating Systems/Knowledge/knowledge-operating-system.md](../Knowledge/knowledge-operating-system.md), [ROADMAP.md](../../ROADMAP.md), [DECISIONS.md](../../DECISIONS.md) (ADR-009, ADR-011)
