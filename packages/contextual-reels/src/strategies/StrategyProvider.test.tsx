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
import { describe, it, expect } from "vitest";

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
