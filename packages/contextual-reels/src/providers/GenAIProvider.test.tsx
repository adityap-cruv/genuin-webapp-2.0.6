/**
 * Tests for `GenAIProvider`, `useGenAI`, and `useOctoSplit`.
 *
 * Uses React.createRoot + a handle pattern (no @testing-library/react).
 * Dispatches custom events via the DOM to simulate GenAI SDK window events and
 * asserts they are re-emitted onto the per-instance `CxrEventBus`.
 */
import React, { act, type ReactNode, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type * as ConfigModule from "@cxr/config";
import { isGenAiAllowed } from "@cxr/config";
import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { EventBusProvider, useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { GenAIProvider, useGenAI, useOctoSplit, type OctoSplit } from "@cxr/providers/GenAIProvider";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../config", async (importOriginal) => {
  const original = await importOriginal<typeof ConfigModule>();
  return {
    ...original,
    isGenAiAllowed: vi.fn(() => true),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ContextHandle {
  isAllowed: boolean;
  octoFraction: number;
  setOctoFraction: (fraction: number) => void;
}

function Consumer({ handle }: { handle: ContextHandle }): ReactElement {
  const ctx = useGenAI();
  handle.isAllowed = ctx.isAllowed;
  handle.octoFraction = ctx.octoFraction;
  handle.setOctoFraction = ctx.setOctoFraction;
  return <span />;
}

/** Records every bus emission for the given event onto `received`. */
function BusListener({ event, received }: { event: "genai:onFill" | "genai:onNoFill"; received: string[] }): ReactElement {
  const bus = useEventBus();
  bus.on(event, () => received.push(event));
  return <span />;
}

/** Captures the bus instance so tests can subscribe directly. */
function BusCapture({ onBus }: { onBus: (bus: CxrEventBus) => void }): ReactElement {
  onBus(useEventBus());
  return <span />;
}

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<EventBusProvider>{ui}</EventBusProvider>);
  });
  return { root, container };
}

function unmount(root: Root, container: HTMLDivElement): void {
  act(() => root.unmount());
  container.remove();
}

function dispatch(eventName: string): void {
  window.dispatchEvent(new CustomEvent(eventName));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("providers/GenAIProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isGenAiAllowed as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children", () => {
    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <span>hello</span>
      </GenAIProvider>
    );
    expect(container.textContent).toContain("hello");
    unmount(root, container);
  });

  it("reflects isAllowed=true from isGenAiAllowed", () => {
    const handle = {} as ContextHandle;

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <Consumer handle={handle} />
      </GenAIProvider>
    );

    expect(handle.isAllowed).toBe(true);
    unmount(root, container);
  });

  it("reflects isAllowed=false from isGenAiAllowed", () => {
    (isGenAiAllowed as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const handle = {} as ContextHandle;

    const { root, container } = mount(
      <GenAIProvider tagId="tag-xyz">
        <Consumer handle={handle} />
      </GenAIProvider>
    );

    expect(handle.isAllowed).toBe(false);
    unmount(root, container);
  });

  it("initial octoFraction is 0", () => {
    const handle = {} as ContextHandle;

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <Consumer handle={handle} />
      </GenAIProvider>
    );

    expect(handle.octoFraction).toBe(0);
    unmount(root, container);
  });

  it("setOctoFraction updates octoFraction", () => {
    const handle = {} as ContextHandle;

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <Consumer handle={handle} />
      </GenAIProvider>
    );

    act(() => handle.setOctoFraction(0.5));
    expect(handle.octoFraction).toBe(0.5);
    unmount(root, container);
  });

  it("setOctoFraction clamps to [0, 1]", () => {
    const handle = {} as ContextHandle;

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <Consumer handle={handle} />
      </GenAIProvider>
    );

    act(() => handle.setOctoFraction(1.5));
    expect(handle.octoFraction).toBe(1);

    act(() => handle.setOctoFraction(-0.5));
    expect(handle.octoFraction).toBe(0);
    unmount(root, container);
  });

  it("re-emits window genai:onFill onto the per-instance bus", () => {
    const received: string[] = [];

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <BusListener event="genai:onFill" received={received} />
      </GenAIProvider>
    );

    act(() => dispatch("genai:onFill"));
    expect(received).toEqual(["genai:onFill"]);
    unmount(root, container);
  });

  it("re-emits window genai:onNoFill onto the per-instance bus", () => {
    const received: string[] = [];

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <BusListener event="genai:onNoFill" received={received} />
      </GenAIProvider>
    );

    act(() => dispatch("genai:onNoFill"));
    expect(received).toEqual(["genai:onNoFill"]);
    unmount(root, container);
  });

  it("cleans up window event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <span />
      </GenAIProvider>
    );

    unmount(root, container);

    expect(removeEventListenerSpy).toHaveBeenCalledWith("genai:onFill", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("genai:onNoFill", expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it("stops re-emitting onto the bus after unmount", () => {
    const received: string[] = [];
    let bus!: CxrEventBus;

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <BusCapture onBus={(b) => (bus = b)} />
      </GenAIProvider>
    );

    bus.on("genai:onFill", () => received.push("genai:onFill"));
    unmount(root, container);

    act(() => dispatch("genai:onFill"));
    expect(received).toEqual([]);
  });

  it("useGenAI throws when used outside GenAIProvider", () => {
    function Outsider(): ReactElement {
      useGenAI();
      return <span />;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() =>
      act(() => {
        root.render(<Outsider />);
      })
    ).toThrow(/GenAIProvider/);

    errSpy.mockRestore();
    container.remove();
  });
});

describe("providers/useOctoSplit", () => {
  function SplitConsumer({ isActive, handle }: { isActive: boolean; handle: { split: OctoSplit } }): ReactElement {
    handle.split = useOctoSplit(isActive);
    return <span />;
  }

  it("degrades to no split outside a provider (does not throw)", () => {
    const handle = {} as { split: OctoSplit };
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<SplitConsumer isActive handle={handle} />);
    });

    expect(handle.split).toEqual({ octoFraction: 0, splitActive: false, playerShare: 1, octoAxis: "y" });
    act(() => root.unmount());
    container.remove();
  });

  it("active reel with a non-zero fraction reports a split and a shrunk player", () => {
    const ctx = {} as ContextHandle;
    const split = {} as { split: OctoSplit };

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <Consumer handle={ctx} />
        <SplitConsumer isActive handle={split} />
      </GenAIProvider>
    );

    act(() => ctx.setOctoFraction(0.4));

    expect(split.split).toEqual({
      octoFraction: 0.4,
      splitActive: true,
      playerShare: 0.6,
      octoAxis: "y",
    });
    unmount(root, container);
  });

  it("inactive reel never splits even when the shared fraction is non-zero", () => {
    const ctx = {} as ContextHandle;
    const split = {} as { split: OctoSplit };

    const { root, container } = mount(
      <GenAIProvider tagId="tag-1">
        <Consumer handle={ctx} />
        <SplitConsumer isActive={false} handle={split} />
      </GenAIProvider>
    );

    act(() => ctx.setOctoFraction(0.4));

    expect(split.split).toEqual({
      octoFraction: 0.4,
      splitActive: false,
      playerShare: 1,
      octoAxis: "y",
    });
    unmount(root, container);
  });

  it("defaults octoAxis to 'y' (vertical shrink)", () => {
    const handle: { split?: OctoSplit } = {};
    function Probe(): ReactElement {
      handle.split = useOctoSplit(true);
      return React.createElement("div");
    }

    const { root, container } = mount(
      <GenAIProvider tagId="t">
        <Probe />
      </GenAIProvider>
    );

    expect(handle.split?.octoAxis).toBe("y");
    unmount(root, container);
  });

  it("exposes setOctoAxis through useGenAI and reflects it in useOctoSplit", () => {
    const handle: { split?: OctoSplit; setAxis?: (a: "x" | "y") => void } = {};
    function Probe(): ReactElement {
      const { setOctoAxis } = useGenAI();
      handle.split = useOctoSplit(true);
      handle.setAxis = setOctoAxis;
      return React.createElement("div");
    }

    const { root, container } = mount(
      <GenAIProvider tagId="t">
        <Probe />
      </GenAIProvider>
    );

    act(() => handle.setAxis?.("x"));
    expect(handle.split?.octoAxis).toBe("x");
    unmount(root, container);
  });
});
