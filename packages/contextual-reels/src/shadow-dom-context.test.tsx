/**
 * Tests for `src/shadow-dom-context.tsx`.
 *
 * Covers the provider render path and the useShadowDom accessor in both the
 * provided and unprovided (null fallback) cases. Rendered with raw React +
 * react-dom per cluster conventions.
 */
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ShadowDomConfig } from "@cxr/shadow-dom-config";
import { ShadowDomProvider, useShadowDom } from "@cxr/shadow-dom-context";

interface Capture {
  value: ShadowDomConfig | null;
  read: boolean;
}

// ShadowDomProvider returns ReactNode (not JSX.Element), which breaks
// createElement's component-overload inference; alias it to a plain FC type so
// children can be passed positionally (no react/no-children-prop lint error).
const Provider = ShadowDomProvider as (props: {
  config: ShadowDomConfig | null;
  children?: ReactNode;
}) => ReactNode;

let capture: Capture;

function Consumer(): null {
  capture.value = useShadowDom();
  capture.read = true;
  return null;
}

function makeConfig(): ShadowDomConfig {
  const host = document.createElement("div");
  const shadowRoot = host.attachShadow({ mode: "open" });
  const mountTarget = document.createElement("div");
  shadowRoot.appendChild(mountTarget);
  return {
    enabled: true,
    hostElement: host,
    shadowRoot,
    mountTarget,
    shadowHostId: "host-1",
  };
}

describe("shadow-dom-context", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    capture = { value: null, read: false };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("delivers the supplied config to consumers via the provider", () => {
    const config = makeConfig();
    act(() => {
      root.render(createElement(Provider, { config }, createElement(Consumer)));
    });

    expect(capture.read).toBe(true);
    expect(capture.value).toBe(config);
  });

  it("delivers null when the provider is mounted in direct (non-shadow) mode", () => {
    act(() => {
      root.render(createElement(Provider, { config: null }, createElement(Consumer)));
    });

    expect(capture.read).toBe(true);
    expect(capture.value).toBeNull();
  });

  it("returns null (does not throw) when no provider is present", () => {
    act(() => {
      root.render(createElement(Consumer));
    });

    expect(capture.read).toBe(true);
    expect(capture.value).toBeNull();
  });

  it("renders provider children into the tree", () => {
    act(() => {
      root.render(
        createElement(Provider, { config: null }, createElement("span", { "data-testid": "child" }, "hi"))
      );
    });

    expect(container.querySelector('[data-testid="child"]')?.textContent).toBe("hi");
  });
});
