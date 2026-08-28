# CONTEXT.md — Long-Term Project Context

This file captures nuance, history, and domain knowledge that doesn't belong in formal specifications. It should be read alongside [CLAUDE.md](CLAUDE.md) (operating rules) and [MEMORY.md](MEMORY.md) (durable decisions log).

## Product History

Cosmade OS's documentation was developed conversationally over an extended architecture design process ("many days," per the project owner). The process moved from brainstorming → Foundation volume (product vision, philosophy, organizational model, IA, navigation blueprint, global layout, design system, roles/permissions/security, platform services, canonical object model, knowledge graph, UX principles) → Implementation Series (Volume 1: Enterprise IA onward).

> **Gap:** The full Foundation volume (Chapters 1–9) and any dedicated Department OS "books" (HR OS, Sales OS, Finance OS, Customer OS, etc.) referenced as prior work were **not** included in the source material supplied for this documentation pass (`COSMADEOS.txt` begins mid-document at Chapter 10). Only Chapter 10 (UX/interaction standards), the Implementation Series Volume 1 (Enterprise IA), a Developer Preview Toolbar spec, and a UX teardown of a reference product were available. This documentation repository is built strictly from that material; it references the missing chapters where the source itself references them, but does not reconstruct their content.

## Why Cosmade OS Exists

The architecture recap in the source material (the "Architectural Review" closing Volume 1) establishes that Cosmade OS's premise is a **single unified operating system** replacing department-siloed tools — modeled interaction-wise (not visually) after Notion (knowledge organization), Linear (speed/navigation), Rippling (operational workflows), HubSpot (CRM/commercial execution), Confluence (documentation), Superhuman (keyboard-first productivity), and Palantir Foundry (connected operational intelligence).

## Business Goals

Inferred from the architecture's own quality bar ("Enterprise Quality Checklist," "Product Evolution Strategy"): ship enterprise-grade, permission-aware, auditable, accessible software that scales without needing to be redesigned as the organization grows ("will it still make sense when the platform is ten times larger?").

## Long-Term Roadmap

See [13 Roadmaps/future-implementation-volumes.md](13%20Roadmaps/future-implementation-volumes.md) for the full Implementation Series plan (Volumes 2–5: Database Blueprint, Backend/Microservice Architecture, Frontend Engineering Spec, Master Execution Roadmap).

## Domain Knowledge — Healthcare / Medical Equipment Context

The reference example used throughout the source material for AI panel behavior includes an **engineering/repair context**: "Recommend troubleshooting steps," "Find similar repair cases," and location examples like "My Lagos Hospitals" (a saved view example). This strongly implies Cosmade OS's primary customer base includes **medical equipment sales, installation, and field service** — customers are hospitals, products are installed equipment, and the Customer object's relationship chain is explicitly: Customer → Products → Installations → Engineers → Contracts → Invoices → Payments → Training → Support → Knowledge → Research → Marketing Campaigns → AI Insights.

> **Gap:** No dedicated healthcare/medical-equipment domain volume was present in the source material (e.g., regulatory context, device compliance, service-level definitions). This should be treated as a priority area for a future Department OS volume (Customers, and potentially a dedicated Field Service / Equipment volume) — see [05 Department Operating Systems/Customers/customers-operating-system.md](05%20Department%20Operating%20Systems/Customers/customers-operating-system.md).

## Competitive Positioning

Explicitly *not* positioned as a visual clone of any single competitor. The product borrows **interaction patterns and productivity principles** from Notion, Linear, Rippling, HubSpot, Confluence, Superhuman, and Palantir Foundry, while its own visual identity is closer to the calmer, table-first, low-saturation style of the Spark & Co reference screenshot analyzed in [11 UX System/design-system-teardown.md](11%20UX%20System/design-system-teardown.md).

## Important Architectural Decisions

See [DECISIONS.md](DECISIONS.md) for the formal ADR log. Key standing decisions from this source pass:

- Build the **App Shell** before the Dashboard (ADR-001).
- Workspaces are working environments, not dashboard collections — this is a corrective decision against Cosmade OS's earlier, more dashboard-heavy direction (ADR-002).

## Assumptions

- The "Architectural Review" recap (vision, org model, IA, nav blueprint, global layout, design system, roles/permissions/security, platform services, object model, knowledge graph, UX principles) is assumed to have been genuinely decided in earlier, unsupplied conversation — this documentation treats those topics as "established but not yet re-documented here," not as undecided.
- The reference screenshot (Spark & Co) is assumed to be a **structural and interaction reference only**, not a branding or visual-identity target — per the source material's own instruction ("not by copying their visual styles, but by adopting their interaction patterns").

## Constraints

- Documentation must never simplify, shorten, or remove previously decided functionality (standing instruction from the project owner, encoded in [CLAUDE.md](CLAUDE.md)).
- No architectural invention to fill gaps — gaps are surfaced, not guessed.

## Future Ambitions

See [14 Future Ideas](14%20Future%20Ideas) for the Product Evolution Strategy and the standing Product Principles for Every Future Decision, both of which are explicitly framed in the source material as guidance for chapters/features not yet written.
