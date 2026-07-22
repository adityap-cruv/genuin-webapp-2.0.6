// packages/contextual-reels/src/instance/InstanceContext.test.tsx
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, afterEach } from "vitest";

import {
  InstanceProvider,
  UserInteractionTracker,
  useEventBus,
  useInstanceId,
  useMarkUserInteracted,
  useOptionalEventBus,
  useUserInteracted,
} from "@cxr/instance/InstanceContext";
import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

let container: HTMLDivElement;
let root: Root;

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("InstanceContext — instanceId", () => {
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

describe("InstanceContext — event bus", () => {
  it("provides a CxrEventBus instance", () => {
    const handle: { bus: CxrEventBus | null } = { bus: null };
    function Consumer(): React.JSX.Element {
      handle.bus = useEventBus();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <InstanceProvider instanceId="inst-bus">
          <Consumer />
        </InstanceProvider>
      );
    });
    expect(handle.bus).not.toBeNull();
    expect(typeof handle.bus!.on).toBe("function");
    expect(typeof handle.bus!.emit).toBe("function");
  });

  it("two providers yield independent bus instances", () => {
    const handleA: { bus: CxrEventBus | null } = { bus: null };
    const handleB: { bus: CxrEventBus | null } = { bus: null };
    function ConsumerA(): React.JSX.Element {
      handleA.bus = useEventBus();
      return <span />;
    }
    function ConsumerB(): React.JSX.Element {
      handleB.bus = useEventBus();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    const containerB = document.createElement("div");
    document.body.appendChild(containerB);
    root = createRoot(container);
    const rootB = createRoot(containerB);
    act(() => {
      root.render(
        <InstanceProvider instanceId="inst-a">
          <ConsumerA />
        </InstanceProvider>
      );
      rootB.render(
        <InstanceProvider instanceId="inst-b">
          <ConsumerB />
        </InstanceProvider>
      );
    });
    expect(handleA.bus).not.toBe(handleB.bus);
    act(() => rootB.unmount());
    containerB.remove();
  });

  it("emitted events from one bus are not received by a listener on another bus", () => {
    const handler = vi.fn();
    const handleA: { bus: CxrEventBus | null } = { bus: null };
    const handleB: { bus: CxrEventBus | null } = { bus: null };
    function ConsumerA(): React.JSX.Element {
      handleA.bus = useEventBus();
      return <span />;
    }
    function ConsumerB(): React.JSX.Element {
      handleB.bus = useEventBus();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    const containerB = document.createElement("div");
    document.body.appendChild(containerB);
    root = createRoot(container);
    const rootB = createRoot(containerB);
    act(() => {
      root.render(
        <InstanceProvider instanceId="inst-a">
          <ConsumerA />
        </InstanceProvider>
      );
      rootB.render(
        <InstanceProvider instanceId="inst-b">
          <ConsumerB />
        </InstanceProvider>
      );
    });
    handleA.bus!.on("genai:videoId", handler);
    handleB.bus!.emit("genai:videoId", { videoId: "from-b" });
    expect(handler).not.toHaveBeenCalled();
    act(() => rootB.unmount());
    containerB.remove();
  });

  it("useEventBus throws when used outside an InstanceProvider", () => {
    let errorCaught = false;
    function BadConsumer(): React.JSX.Element {
      try {
        useEventBus();
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

  it("useOptionalEventBus returns undefined outside a provider", () => {
    const handle: { bus: CxrEventBus | undefined } = { bus: undefined };
    function Consumer(): React.JSX.Element {
      handle.bus = useOptionalEventBus();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<Consumer />);
    });
    expect(handle.bus).toBeUndefined();
  });
});

describe("InstanceContext — user interaction tracker", () => {
  it("starts false and flips to true on mark within the same instance", () => {
    const handle: { interacted: boolean; mark: (() => void) | null } = {
      interacted: false,
      mark: null,
    };
    function Consumer(): React.JSX.Element {
      handle.interacted = useUserInteracted();
      handle.mark = useMarkUserInteracted();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <InstanceProvider instanceId="inst-ui">
          <Consumer />
        </InstanceProvider>
      );
    });
    expect(handle.interacted).toBe(false);
    act(() => handle.mark!());
    expect(handle.interacted).toBe(true);
  });

  it("does not leak interaction across instances (per-instance isolation)", () => {
    const handleA: { interacted: boolean; mark: (() => void) | null } = {
      interacted: false,
      mark: null,
    };
    const handleB: { interacted: boolean } = { interacted: false };
    function ConsumerA(): React.JSX.Element {
      handleA.interacted = useUserInteracted();
      handleA.mark = useMarkUserInteracted();
      return <span />;
    }
    function ConsumerB(): React.JSX.Element {
      handleB.interacted = useUserInteracted();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    const containerB = document.createElement("div");
    document.body.appendChild(containerB);
    root = createRoot(container);
    const rootB = createRoot(containerB);
    act(() => {
      root.render(
        <InstanceProvider instanceId="inst-a">
          <ConsumerA />
        </InstanceProvider>
      );
      rootB.render(
        <InstanceProvider instanceId="inst-b">
          <ConsumerB />
        </InstanceProvider>
      );
    });

    // Interact with instance A only.
    act(() => handleA.mark!());

    expect(handleA.interacted).toBe(true);
    // Instance B must remain untouched — the regression this guards against.
    expect(handleB.interacted).toBe(false);

    act(() => rootB.unmount());
    containerB.remove();
  });

  it("mark is idempotent — a second mark notifies no subscriber again", () => {
    const tracker = new UserInteractionTracker();
    const notify = vi.fn();
    tracker.subscribe(notify);
    tracker.mark();
    expect(tracker.hasInteracted()).toBe(true);
    expect(notify).toHaveBeenCalledOnce();
    // Second mark hits the early-return guard and must not notify again.
    tracker.mark();
    expect(notify).toHaveBeenCalledOnce();
  });

  it("subscribe returns an unsubscribe that removes the subscriber", () => {
    const tracker = new UserInteractionTracker();
    const notify = vi.fn();
    const unsubscribe = tracker.subscribe(notify);
    unsubscribe();
    tracker.mark();
    expect(notify).not.toHaveBeenCalled();
  });

  it("useUserInteracted reports false outside a provider (degrades safely)", () => {
    const handle = { interacted: true };
    function Consumer(): React.JSX.Element {
      handle.interacted = useUserInteracted();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<Consumer />);
    });
    expect(handle.interacted).toBe(false);
  });

  it("useMarkUserInteracted is a safe no-op outside a provider", () => {
    const handle: { mark: (() => void) | null } = { mark: null };
    function Consumer(): React.JSX.Element {
      handle.mark = useMarkUserInteracted();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<Consumer />);
    });
    expect(() => handle.mark!()).not.toThrow();
  });
});

describe("InstanceContext — merged identity", () => {
  it("instanceId, event bus, and user-interaction tracker are all available from one provider", () => {
    const handle: { instanceId: string; hasBus: boolean; interacted: boolean } = {
      instanceId: "",
      hasBus: false,
      interacted: true,
    };
    function Consumer(): React.JSX.Element {
      handle.instanceId = useInstanceId();
      handle.hasBus = typeof useEventBus().emit === "function";
      handle.interacted = useUserInteracted();
      return <span />;
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <InstanceProvider instanceId="inst-merged">
          <Consumer />
        </InstanceProvider>
      );
    });
    expect(handle.instanceId).toBe("inst-merged");
    expect(handle.hasBus).toBe(true);
    expect(handle.interacted).toBe(false);
  });
});
