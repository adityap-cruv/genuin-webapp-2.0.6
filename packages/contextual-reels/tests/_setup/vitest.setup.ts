/**
 * Vitest global setup for the contextual-reels package.
 *
 * Phase 0: intentionally minimal — no extra test libraries are introduced.
 * Provides a hook to restore mutated `window.location` between tests and a
 * named export so other setup utilities can be appended in later phases.
 */
import { beforeEach, vi } from "vitest";

// jsdom does not implement the canvas 2D context. Components that draw to a
// <canvas> (e.g. OctoCountdownStrip) call getContext("2d") at render time and
// crash on the null return. Provide a no-op 2D-context stub so those components
// mount under test. Install only when getContext is unimplemented.
if (
  typeof HTMLCanvasElement !== "undefined" &&
  // jsdom's stub throws "Not implemented"; guard so a real impl is left intact.
  !("__cxrCanvasStubbed" in HTMLCanvasElement.prototype)
) {
  const ctx2d = {
    canvas: null as unknown,
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 0 })),
    fillText: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
  };
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    writable: true,
    value: vi.fn(() => ctx2d),
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "__cxrCanvasStubbed", {
    value: true,
  });
}

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
