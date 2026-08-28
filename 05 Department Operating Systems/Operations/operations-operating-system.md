# Operations Operating System

## Purpose
Define the Operations workspace navigation and primary working surface.

## Vision
SOPs, procurement, vendors, inventory, and compliance live in one working environment, per [01 Vision/product-vision.md](../../01%20Vision/product-vision.md).

## Philosophy
Per ADR-002: Operations prioritizes process/compliance tooling over dashboard widgets.

## Architecture

### Workspace Sidebar (grouped sections)
Per the design-structure teardown: **SOPs, Procurement, Vendors, Inventory, Compliance, Requests, Audit Logs.**

### Primary Working Surface
SOPs (Knowledge-adjacent document library), Vendors/Inventory (tables with Universal Toolbar), Requests (workflow/queue view), Audit Logs (read-only history-style table).

## Principles
Universal Object Layout applies to Vendor, Supplier, Equipment, and Asset objects.

## Components
SOP library, Procurement workflow, Vendor directory, Inventory table, Compliance tracker, Requests queue, Audit Log viewer.

## User Flows
> **Gap:** No detailed procurement-to-payment or compliance-review flow was present in the source material.

## Information Architecture
Sidebar grouping as above; Vendor/Equipment objects cross-link via the standard Cross-Workspace Linking chain.

## Data Model
> **Gap:** Pending Implementation Volume 2.

## Permissions
Role list includes "Operations Manager" (see [09 Security/security-overview.md](../../09%20Security/security-overview.md)).

## AI Capabilities
> **Gap:** No Operations-specific AI examples were supplied. The closest analog in source material is the engineering/field-service example: "Recommend troubleshooting steps," "Find similar repair cases" (see [07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md)), which likely applies to Operations' equipment/vendor context given the medical-equipment domain noted in [CONTEXT.md](../../CONTEXT.md).

## Automation
> **Gap:** Not detailed beyond the generic Automation View component.

## Integrations
> **Gap:** Not present in source material.

## Analytics
> **Gap:** No dedicated analytics section named for Operations beyond the generic Analytics View component.

## Administration
Audit Logs functions as a compliance/administration surface.

## Security
Audit Logs is itself a security/compliance-relevant surface; see [09 Security/security-overview.md](../../09%20Security/security-overview.md).

## UX Notes
Follows the same visual language as every other workspace.

## Future Expansion
Inventory/warehouse management detail, compliance workflow detail, and vendor scorecards are candidates for future volumes.

## Related Documents
[07 Enterprise AI/global-ai-experience.md](../../07%20Enterprise%20AI/global-ai-experience.md), [09 Security/security-overview.md](../../09%20Security/security-overview.md)
