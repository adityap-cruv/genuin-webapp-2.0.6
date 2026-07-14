/**
 * Tests for `StrategyProvider` and `useStrategy`.
 *
 * Drives the real cascade (resolveStrategies + strategyConfig) rather than
 * mocking predicates: the provider resolves strategies directly now.
 *
 * Uses React.createRoot + a handle pattern (no @testing-library/react).
 */
import React, { act, type ReactNode, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, it, expect } from "vitest";

import { StrategyProvider, useStrategy } from "@cxr/strategies/StrategyProvider";
import { DEFAULT_STRATEGIES, type Strategies } from "@cxr/strategies/strategies";

// A tag migrated into TAG_STRATEGIES with adBreak + gateOnUnmute on.
const AD_BREAK_TAG = "6a391232d73aa25887ac2af3";
const UNKNOWN_TAG = "aaaabbbbccccdddd11112222";

function Consumer({ handle }: { handle: { value: Strategies } }): ReactElement {
  handle.value = useStrategy();
  return <span />;
}

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { root, container };
}

function unmount(root: Root, container: HTMLDivElement): void {
  act(() => root.unmount());
  container.remove();
}

describe("strategies/StrategyProvider", () => {
  it("resolves decisions from the cascade for a configured tag", () => {
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId={AD_BREAK_TAG}>
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    expect(handle.value.adBreakEnabled).toBe(true);
    expect(handle.value.gateOnUnmute).toBe(true);
    expect(handle.value.genAiEnabled).toBe(false);
    unmount(root, container);
  });

  it("returns all-off defaults for an unconfigured tag", () => {
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId={UNKNOWN_TAG}>
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    expect(handle.value).toEqual(DEFAULT_STRATEGIES);
    unmount(root, container);
  });

  it("resolves brand-level decisions when brandId is passed", () => {
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId={UNKNOWN_TAG} brandId={3252}>
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    expect(handle.value.compactBackgroundColor).toBe("#EC298C");
    unmount(root, container);
  });

  it("falls back to all-off defaults without a provider", () => {
    const handle = {} as { value: Strategies };
    const { root, container } = mount(<Consumer handle={handle} />);

    expect(handle.value).toEqual(DEFAULT_STRATEGIES);
    unmount(root, container);
  });
});

describe("strategies/StrategyProvider GIV override", () => {
  afterEach(() => {
    delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  });

  it("overrides initialVolume from the GIV loader param", () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "&GIV=0.7";
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId={UNKNOWN_TAG}>
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    // Overrides the DEFAULT_STRATEGIES initialVolume (0) for an unconfigured tag.
    expect(handle.value.initialVolume).toBe(0.7);
    unmount(root, container);
  });

  it("wins over a tag's configured initialVolume", () => {
    // AD_BREAK_TAG has no initialVolume entry, so use the dev slot that does.
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "&GIV=0.9";
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId="697c46aa9f432b1a2055e803">
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    // Tag config sets initialVolume: 0.2; the param wins.
    expect(handle.value.initialVolume).toBe(0.9);
    unmount(root, container);
  });

  it("ignores an invalid GIV and keeps the resolved value", () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "&GIV=2";
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId="697c46aa9f432b1a2055e803">
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    expect(handle.value.initialVolume).toBe(0.2);
    unmount(root, container);
  });

  it("falls back to the data-giv prop when no GIV script param is set", () => {
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId={UNKNOWN_TAG} dataGiv="0.4">
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    expect(handle.value.initialVolume).toBe(0.4);
    unmount(root, container);
  });

  it("prefers the GIV script param over the data-giv prop", () => {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "&GIV=0.8";
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId={UNKNOWN_TAG} dataGiv="0.2">
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    expect(handle.value.initialVolume).toBe(0.8);
    unmount(root, container);
  });

  it("ignores an invalid data-giv prop and keeps the resolved value", () => {
    const handle = {} as { value: Strategies };
    const { root, container } = mount(
      <StrategyProvider tagId="697c46aa9f432b1a2055e803" dataGiv="loud">
        <Consumer handle={handle} />
      </StrategyProvider>
    );

    expect(handle.value.initialVolume).toBe(0.2);
    unmount(root, container);
  });
});
