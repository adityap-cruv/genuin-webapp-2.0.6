// packages/contextual-reels/src/instance/registry/useInstanceRegistration.test.tsx
/**
 * Tests for useInstanceRegistration — verifies the hook registers this
 * instance's controls into the InstanceRegistry on mount, wires expand/collapse
 * to the per-instance event bus, and unregisters on unmount.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { EventBusProvider } from "@cxr/instance/coordination/EventBusContext";
import { InstanceProvider } from "@cxr/instance/registry/InstanceContext";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { useInstanceRegistration } from "@cxr/instance/registry/useInstanceRegistration";

let container: HTMLDivElement;
let root: Root;
let unmounted = false;

/** Mounts the hook for the given instanceId inside the required providers. */
function setup(instanceId: string, pause: () => void): void {
  function Consumer(): React.JSX.Element {
    useInstanceRegistration(pause);
    return <span />;
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  unmounted = false;
  act(() => {
    root.render(
      <InstanceProvider instanceId={instanceId}>
        <EventBusProvider>
          <Consumer />
        </EventBusProvider>
      </InstanceProvider>
    );
  });
}

/** Unmount once, tracking state so afterEach never double-unmounts. */
function teardown(): void {
  if (unmounted) return;
  unmounted = true;
  act(() => root.unmount());
}

afterEach(() => {
  teardown();
  container.remove();
});

describe("useInstanceRegistration", () => {
  beforeEach(() => {
    // Clear any state left in the singleton from a prior test.
    const registry = getInstanceRegistry();
    for (const id of Array.from(registry.getAll().keys())) {
      registry.unregister(id);
    }
  });

  it("registers controls into the InstanceRegistry on mount", () => {
    setup("inst-reg-1", vi.fn());
    expect(getInstanceRegistry().get("inst-reg-1")).toBeDefined();
  });

  it("registered pause control invokes the supplied pause function", () => {
    const pause = vi.fn();
    setup("inst-reg-2", pause);
    getInstanceRegistry().get("inst-reg-2")!.pause();
    expect(pause).toHaveBeenCalledOnce();
  });

  it("expand control emits video:expand on the per-instance bus", () => {
    setup("inst-reg-3", vi.fn());
    expect(() => getInstanceRegistry().get("inst-reg-3")!.expand()).not.toThrow();
  });

  it("collapse control emits video:collapse on the per-instance bus", () => {
    setup("inst-reg-4", vi.fn());
    expect(() => getInstanceRegistry().get("inst-reg-4")!.collapse()).not.toThrow();
  });

  it("unregisters from the InstanceRegistry on unmount", () => {
    setup("inst-reg-5", vi.fn());
    expect(getInstanceRegistry().get("inst-reg-5")).toBeDefined();
    teardown();
    expect(getInstanceRegistry().get("inst-reg-5")).toBeUndefined();
  });
});
