"use client";

/**
 * Grid Overlay — Developer Preview Toolbar spec (06 Platform Core/
 * developer-preview-toolbar.md): "Displays 8px spacing grid, layout
 * columns, responsive breakpoints, safe areas. Useful for designers."
 * Purely visual, `pointer-events-none`, dev-mode gated by its only caller
 * (DeveloperPreviewToolbar already guards on NODE_ENV, and this only
 * renders when the toolbar's own toggle is on).
 */
export function GridOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[999]"
      style={{
        backgroundImage:
          "linear-gradient(to right, color-mix(in oklab, var(--color-destructive) 35%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-destructive) 35%, transparent) 1px, transparent 1px)",
        backgroundSize: "8px 8px",
      }}
    >
      {/* Layout column guides — 12-column grid, matches the platform's max content width. */}
      <div className="mx-auto flex h-full max-w-7xl gap-4 px-4 sm:px-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-primary/5 h-full flex-1 border-x border-primary/10" />
        ))}
      </div>
    </div>
  );
}
