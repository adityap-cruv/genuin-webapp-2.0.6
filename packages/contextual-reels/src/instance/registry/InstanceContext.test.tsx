// packages/contextual-reels/src/instance/registry/InstanceContext.test.tsx
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, afterEach } from "vitest";

import { InstanceProvider, useInstanceId } from "@cxr/instance/registry/InstanceContext";

let container: HTMLDivElement;
let root: Root;

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function setup(instanceId: string, handle: { value: string }): void {
  container = document.createElement("div");
  document.body.appendChild(container);
  function Consumer(): React.JSX.Element {
    handle.value = useInstanceId();
    return <span />;
  }
  root = createRoot(container);
  act(() => {
    root.render(
      <InstanceProvider instanceId={instanceId}>
        <Consumer />
      </InstanceProvider>
    );
  });
}

describe("InstanceContext", () => {
  it("exposes the provided instanceId via useInstanceId", () => {
    const handle = { value: "" };
    setup("inst-abc", handle);
    expect(handle.value).toBe("inst-abc");
  });

  it("two providers with different IDs expose independent values", () => {
    const handleA = { value: "" };
    const handleB = { value: "" };
    setup("inst-1", handleA);
    const containerB = document.createElement("div");
    document.body.appendChild(containerB);
    function ConsumerB(): React.JSX.Element {
      handleB.value = useInstanceId();
      return <span />;
    }
    const rootB = createRoot(containerB);
    act(() => {
      rootB.render(
        <InstanceProvider instanceId="inst-2">
          <ConsumerB />
        </InstanceProvider>
      );
    });
    expect(handleA.value).toBe("inst-1");
    expect(handleB.value).toBe("inst-2");
    act(() => rootB.unmount());
    containerB.remove();
  });

  it("useInstanceId throws when used outside an InstanceProvider", () => {
    let errorCaught = false;
    function BadConsumer(): React.JSX.Element {
      try {
        useInstanceId();
      } catch {
        errorCaught = true;
      }
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<BadConsumer />);
    });
    expect(errorCaught).toBe(true);
  });
});
