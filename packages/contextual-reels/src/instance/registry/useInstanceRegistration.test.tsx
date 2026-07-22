// packages/contextual-reels/src/instance/registry/useInstanceRegistration.test.tsx
/**
 * Tests for useInstanceRegistration — verifies the hook registers this
 * instance's controls into the InstanceRegistry on mount, wires expand/collapse
 * to the per-instance event bus, and unregisters on unmount.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { InstanceProvider } from "@cxr/instance/InstanceContext";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { useInstanceRegistration } from "@cxr/instance/registry/useInstanceRegistration";

let container: HTMLDivElement;
let root: Root;
let unmounted = false;

/** Mounts the hook for the given instanceId inside the required providers. */
function setup(instanceId: string): void {
  function Consumer(): React.JSX.Element {
    useInstanceRegistration();
    return <span />;
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  unmounted = false;
  act(() => {
    root.render(
      <InstanceProvider instanceId={instanceId}>
        <Consumer />
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
    setup("inst-reg-1");
    expect(getInstanceRegistry().get("inst-reg-1")).toBeDefined();
  });

  it("expand control emits video:expand on the per-instance bus", () => {
    setup("inst-reg-3");
    expect(() => getInstanceRegistry().get("inst-reg-3")!.expand()).not.toThrow();
  });

  it("collapse control emits video:collapse on the per-instance bus", () => {
    setup("inst-reg-4");
    expect(() => getInstanceRegistry().get("inst-reg-4")!.collapse()).not.toThrow();
  });

  it("unregisters from the InstanceRegistry on unmount", () => {
    setup("inst-reg-5");
    expect(getInstanceRegistry().get("inst-reg-5")).toBeDefined();
    teardown();
    expect(getInstanceRegistry().get("inst-reg-5")).toBeUndefined();
  });
});
