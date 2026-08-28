# Training Operating System (Training Center)

## Purpose
Define the Training Center workspace navigation and primary working surface.

## Vision
Learning paths, courses, assessments, certifications, and departmental training are organized like a corporate LMS, per [01 Vision/product-vision.md](../../01%20Vision/product-vision.md).

## Philosophy
Per ADR-002: Training Center prioritizes course/curriculum tooling and progress tracking over dashboard widgets.

## Architecture

### Workspace Sidebar (grouped sections)
Per the design-structure teardown: organized like a corporate LMS with sections for **learning paths, courses, assessments, certifications, progress, and departmental training.**

### Primary Working Surface
Course catalog / learning-path builder as the primary table/board surface; assessments and certifications as tracked records following the Universal Object Layout.

## Principles
Universal Object Layout applies to the Training Course object; every other object's Universal Object Layout includes a `Tasks`/`Timeline` linkage relevant to training completion tracking.

## Components
Learning path builder, course catalog, assessment engine, certification tracker, progress dashboard (department- or employee-scoped), departmental training assignment.

## User Flows
> **Gap:** No detailed enrollment/completion/certification flow supplied.

## Information Architecture
Training links to Employee (HR) via completion records, and to Customer via the Cross-Workspace Linking chain ("Training" appears explicitly as a link node between Engineers and Support in the Customer chain) — see [04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md).

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
> **Gap:** Not detailed beyond the general platform role list.

## AI Capabilities
> **Gap:** No Training-specific AI examples were supplied.

## Automation
> **Gap:** Not detailed.

## Integrations
> **Gap:** Not present in source material.

## Analytics
`Progress` functions as an explicit analytics-adjacent sidebar section.

## Administration
> **Gap:** Not detailed.

## Security
> **Gap:** See [09 Security/security-overview.md](../../09%20Security/security-overview.md).

## UX Notes
Follows the same visual language as every other workspace.

## Future Expansion
Course authoring tools, certification expiry tracking, and customer-facing training portals (given the medical-equipment/field-service domain context in [CONTEXT.md](../../CONTEXT.md)) are candidates for future volumes.

## Related Documents
[04 Enterprise Architecture/enterprise-information-architecture.md](../../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [05 Department Operating Systems/Customers/customers-operating-system.md](../Customers/customers-operating-system.md)
