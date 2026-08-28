# Responsive Testing Standards

> Reference note — mandatory for the project. Complements [06 Platform Core/developer-preview-toolbar.md](../06%20Platform%20Core/developer-preview-toolbar.md) (Viewport Simulator).

## Required Breakpoint Matrix

Every page must be tested at: `1920px+ · 1600 · 1440 · 1366 · 1280 · 1024 · 820 · 768 · 540 · 430 · 390 · 375 · 360 · 320px`.

## Acceptance Criteria at Every Breakpoint

- No horizontal scrolling.
- No clipped content.
- No overflowing text.
- No overlapping components.
- Tables adapt (collapse, horizontal scroll with sticky columns, or card layout as appropriate).
- Sidebars become drawers on smaller screens.
- Headers remain usable.
- Buttons remain reachable.
- All forms remain accessible.
- Dialogs fit within the viewport.

## Related Platform Standards

Matches the Responsive Information Architecture defined in [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md): three-column desktop layout (1440px+), collapsible-sidebar tablet layout, bottom-nav mobile layout.

## Related Documents
[06 Platform Core/developer-preview-toolbar.md](../06%20Platform%20Core/developer-preview-toolbar.md), [04 Enterprise Architecture/enterprise-information-architecture.md](../04%20Enterprise%20Architecture/enterprise-information-architecture.md), [11 UX System/enterprise-quality-checklist.md](enterprise-quality-checklist.md)
