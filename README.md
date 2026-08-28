# Cosmade OS — Documentation Repository

This repository is the enterprise-grade documentation set for **Cosmade OS**, organized from the architecture and design decisions established to date. It is structured to read like the internal documentation of a mature software organization (Stripe, Atlassian, Linear, Notion, Palantir, ServiceNow, AWS/Google Cloud conventions).

> **Status note:** The source material processed into this repository (`COSMADEOS.txt`, `COSMADEOSDESIGNSTRUCTURE.txt`, reference screenshot) covers a specific slice of the overall Cosmade OS architecture: Chapter 10 of Volume 1 (Foundation), the Implementation Series Volume 1 (Enterprise Information Architecture), a Developer Preview Toolbar specification, and a UX teardown of a reference application. It does **not** include Foundation Chapters 1–9, the individual Department OS "books" (HR/Sales/Finance/etc. as full volumes), or Implementation Volumes 2–5 (Database Blueprint, Backend Architecture, Frontend Engineering Spec, Master Execution Roadmap) — these are referenced as already decided or as planned future work, but their detailed content was not present in the supplied files. Every document below marks its gaps explicitly rather than inventing content. See [00 Executive Summary/00-executive-summary.md](00%20Executive%20Summary/00-executive-summary.md) for the full gap inventory.

## Foundational Files (Repository Root)

| File | Purpose |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Operating manual for any Claude session working on this project. Read first. |
| [AGENTS.md](AGENTS.md) | Onboarding manual for any AI agent or contributor joining the project. |
| [CONTEXT.md](CONTEXT.md) | Long-term nuance, history, domain knowledge, and rationale that doesn't belong in specs. |
| [MEMORY.md](MEMORY.md) | Continuously evolving log of durable project knowledge, decisions, and preferences. |
| [SKILLS.md](SKILLS.md) | Reusable process library / playbook for recurring work. |
| [DECISIONS.md](DECISIONS.md) | Architecture Decision Record (ADR) log. |

## Documentation Map

| Folder | Contents |
|---|---|
| [/00 Executive Summary](00%20Executive%20Summary) | Project state, coverage map, gap inventory |
| [/01 Vision](01%20Vision) | Product vision |
| [/02 Product Philosophy](02%20Product%20Philosophy) | Core philosophy governing all product decisions |
| [/03 Design Principles](03%20Design%20Principles) | UX principles, page anatomy, interaction pattern rules |
| [/04 Enterprise Architecture](04%20Enterprise%20Architecture) | Implementation Series Volume 1 — Enterprise Information Architecture |
| [/05 Department Operating Systems](05%20Department%20Operating%20Systems) | HR, Sales, Marketing, Finance, Operations, Customers, Knowledge, Training, Research, Administration (proposed, pending review), Documents (proposed, pending review), Analytics (proposed, pending review) |
| [/06 Platform Core](06%20Platform%20Core) | App Shell, Command Palette, Developer Preview Toolbar |
| [/07 Enterprise AI](07%20Enterprise%20AI) | Global AI experience and interaction standards |
| [/08 Data Platform](08%20Data%20Platform) | Data model, knowledge graph (gap — pending Volume 2) |
| [/09 Security](09%20Security) | Roles, permissions, security posture (partial — pending earlier chapters) |
| [/10 Integrations](10%20Integrations) | Third-party and cross-system integrations (gap) |
| [/11 UX System](11%20UX%20System) | Design system teardown, responsive/accessibility/performance standards, quality checklist |
| [/12 Implementation](12%20Implementation) | Implementation Series status and volume index |
| [/13 Roadmaps](13%20Roadmaps) | Planned volumes, sequencing decisions |
| [/14 Future Ideas](14%20Future%20Ideas) | Product evolution strategy, standing future-decision principles |

## Documentation Standard

Every substantive document in this repository follows the same structural template so any reader can navigate any document the same way:

`Title → Purpose → Vision → Philosophy → Architecture → Principles → Components → User Flows → Information Architecture → Data Model (where applicable) → Permissions → AI Capabilities → Automation → Integrations → Analytics → Administration → Security → UX Notes → Future Expansion`

Lightweight reference notes (e.g., a single interaction rule) use a shorter format and roll up into a parent document that carries the full template — this is called out explicitly where it applies.

## How to Use This Repository

- Treat every architectural decision recorded here as **source of truth** unless explicitly superseded (see [DECISIONS.md](DECISIONS.md)).
- Gaps are marked `> **Gap:**` inline. Do not fill them with invented detail — flag them for new source material instead.
- Cross-references use relative markdown links. Follow them to related volumes before proposing changes.
