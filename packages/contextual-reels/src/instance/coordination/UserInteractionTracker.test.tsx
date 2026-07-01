// packages/contextual-reels/src/instance/coordination/UserInteractionTracker.test.tsx
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, afterEach } from "vitest";

import {
  UserInteractionProvider,
  UserInteractionTracker,
  useMarkUserInteracted,
  useUserInteracted,
} from "@cxr/instance/coordination/UserInteractionTracker";

let container: HTMLDivElement;
let root: Root;

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe("UserInteractionTracker", () => {
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
        <UserInteractionProvider>
          <Consumer />
        </UserInteractionProvider>
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
        <UserInteractionProvider>
          <ConsumerA />
        </UserInteractionProvider>
      );
      rootB.render(
        <UserInteractionProvider>
          <ConsumerB />
        </UserInteractionProvider>
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
