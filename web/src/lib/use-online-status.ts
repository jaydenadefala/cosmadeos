"use client";

import * as React from "react";

/**
 * Real, live `navigator.onLine` detection with `online`/`offline` event
 * listeners — genuinely reactive to the browser's actual connectivity
 * state, not a mocked flag. Feeds `SyncStatusBanner` (Universal States:
 * Offline) in `AppShell`. `useSyncExternalStore` avoids the SSR/CSR
 * hydration mismatch a plain `useState(navigator.onLine)` would hit, since
 * `navigator` doesn't exist during server rendering.
 */
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  // Assume online during server render; the real value resolves on mount.
  return true;
}

export function useOnlineStatus(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
