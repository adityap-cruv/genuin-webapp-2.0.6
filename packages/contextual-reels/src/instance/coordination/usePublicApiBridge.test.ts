/**
 * Tests for usePublicApiBridge — verifies bus events are bridged to
 * window.cxr._emit when the public API is installed, and that the hook is a
 * silent no-op when window.cxr (or _emit) is absent.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { usePublicApiBridge } from "@cxr/instance/coordination/usePublicApiBridge";
import type { CxrPublicApiInternal } from "@cxr/publicApi";

// A controllable bus: handlers are stored so tests can fire events directly.
const busHandlers = new Map<string, Set<() => void>>();
const busOn = vi.fn((event: string, handler: () => void) => {
  if (!busHandlers.has(event)) busHandlers.set(event, new Set());
  busHandlers.get(event)!.add(handler);
  return () => busHandlers.get(event)?.delete(handler);
});
function fireBus(event: string): void {
  busHandlers.get(event)?.forEach((h) => h());
}
const testBus = { on: busOn, emit: vi.fn() } as unknown as CxrEventBus;

let container: HTMLDivElement;
let root: Root;

function setup(instanceId: string): void {
  function Harness(): React.JSX.Element {
    usePublicApiBridge(instanceId, testBus);
    return React.createElement("span");
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(React.createElement(Harness));
  });
}

describe("usePublicApiBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    busHandlers.clear();
    delete (window as Window & { cxr?: unknown }).cxr;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete (window as Window & { cxr?: unknown }).cxr;
  });

  it("bridges bus events to window.cxr._emit when the public API is present", () => {
    const emit = vi.fn();
    // The bridge only reads `_emit`; stub just that field (cast through unknown
    // since the real window.cxr is the full CxrPublicApi surface).
    (window as Window & { cxr?: CxrPublicApiInternal }).cxr = { _emit: emit } as unknown as CxrPublicApiInternal;

    setup("test-instance");

    act(() => fireBus("player:play"));
    act(() => fireBus("player:pause"));
    act(() => fireBus("fullscreen:enter"));
    act(() => fireBus("fullscreen:exit"));
    act(() => fireBus("ad:fill"));
    act(() => fireBus("ad:nofill"));
    act(() => fireBus("ad:removed"));

    expect(emit).toHaveBeenCalledWith("test-instance", "play");
    expect(emit).toHaveBeenCalledWith("test-instance", "pause");
    expect(emit).toHaveBeenCalledWith("test-instance", "fullscreen:enter");
    expect(emit).toHaveBeenCalledWith("test-instance", "fullscreen:exit");
    expect(emit).toHaveBeenCalledWith("test-instance", "ad:fill");
    expect(emit).toHaveBeenCalledWith("test-instance", "ad:nofill");
    expect(emit).toHaveBeenCalledWith("test-instance", "ad:removed");
  });

  it("is a no-op when window.cxr is absent", () => {
    setup("test-instance");
    expect(() => act(() => fireBus("player:play"))).not.toThrow();
    // No subscriptions should have been registered on the bus.
    expect(busOn).not.toHaveBeenCalled();
  });
});
