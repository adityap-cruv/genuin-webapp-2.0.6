/**
 * Vitest global setup for the contextual-reels package.
 *
 * Phase 0: intentionally minimal — no extra test libraries are introduced.
 * Provides a hook to restore mutated `window.location` between tests and a
 * named export so other setup utilities can be appended in later phases.
 */
import { beforeEach } from "vitest";

const originalLocationDescriptor =
  typeof window !== "undefined" ? Object.getOwnPropertyDescriptor(window, "location") : undefined;

beforeEach(() => {
  if (typeof window === "undefined" || !originalLocationDescriptor) {
    return;
  }
  const currentDescriptor = Object.getOwnPropertyDescriptor(window, "location");
  if (currentDescriptor && currentDescriptor.value !== originalLocationDescriptor.value) {
    Object.defineProperty(window, "location", originalLocationDescriptor);
  }
});

/**
 * No-op export so this file is treated as a module and can be imported by other
 * helpers without triggering "ambient script" semantics.
 */
export const __cxrTestSetupLoaded = true;
