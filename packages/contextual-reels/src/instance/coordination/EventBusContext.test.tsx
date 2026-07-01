// packages/contextual-reels/src/instance/coordination/EventBusContext.test.tsx
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, afterEach } from "vitest";

import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import {
  EventBusProvider,
  useEventBus,
  useOptionalEventBus,
} from "@cxr/instance/coordination/EventBusContext";

let container: HTMLDivElement;
let root: Root;

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("EventBusContext", () => {
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
        <EventBusProvider>
          <Consumer />
        </EventBusProvider>
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
        <EventBusProvider>
          <ConsumerA />
        </EventBusProvider>
      );
      rootB.render(
        <EventBusProvider>
          <ConsumerB />
        </EventBusProvider>
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
        <EventBusProvider>
          <ConsumerA />
        </EventBusProvider>
      );
      rootB.render(
        <EventBusProvider>
          <ConsumerB />
        </EventBusProvider>
      );
    });
    handleA.bus!.on("genai:videoId", handler);
    handleB.bus!.emit("genai:videoId", { videoId: "from-b" });
    expect(handler).not.toHaveBeenCalled();
    act(() => rootB.unmount());
    containerB.remove();
  });

  it("useEventBus throws when used outside an EventBusProvider", () => {
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
