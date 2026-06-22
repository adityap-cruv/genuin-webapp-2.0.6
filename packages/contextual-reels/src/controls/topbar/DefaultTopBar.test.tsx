import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { DefaultTopBar } from "@cxr/controls/topbar/DefaultTopBar";

describe("DefaultTopBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(overrides: Partial<React.ComponentProps<typeof DefaultTopBar>> = {}) {
    act(() => {
      root.render(
        React.createElement(DefaultTopBar, {
          isFullScreen: false,
          isMuted: false,
          isPlay: true,
          onMuteClick: vi.fn(),
          onPlayClick: vi.fn(),
          onFullScreenClick: vi.fn(),
          ...overrides,
        })
      );
    });
  }

  it('renders data-testid="default-top-bar"', () => {
    render();
    expect(container.querySelector('[data-testid="default-top-bar"]')).toBeTruthy();
  });

  it("non-full: renders expand button", () => {
    render({ isFullScreen: false });
    expect(container.querySelector('[data-testid="topbar-expand"]')).toBeTruthy();
  });

  it("non-full: does not render collapse button", () => {
    render({ isFullScreen: false });
    expect(container.querySelector('[data-testid="topbar-collapse"]')).toBeNull();
  });

  it("non-full: right group contains expand button", () => {
    render({ isFullScreen: false });
    const rightGroup = container.querySelector('[data-testid="topbar-right-group"]');
    expect(rightGroup?.querySelectorAll("button").length).toBeGreaterThanOrEqual(1);
    expect(rightGroup?.querySelector('[data-testid="topbar-expand"]')).toBeTruthy();
  });

  it("non-full: left group has no buttons", () => {
    render({ isFullScreen: false });
    const leftGroup = container.querySelector('[data-testid="topbar-left-group"]');
    expect(leftGroup?.querySelectorAll("button").length).toBe(0);
  });

  it("full: renders collapse button", () => {
    render({ isFullScreen: true });
    expect(container.querySelector('[data-testid="topbar-collapse"]')).toBeTruthy();
  });

  it("full: does not render expand button", () => {
    render({ isFullScreen: true });
    expect(container.querySelector('[data-testid="topbar-expand"]')).toBeNull();
  });

  it("calls onFullScreenClick when expand clicked", () => {
    const onFullScreenClick = vi.fn();
    render({ isFullScreen: false, onFullScreenClick });
    const btn = container.querySelector('[data-testid="topbar-expand"]');
    act(() => {
      btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onFullScreenClick).toHaveBeenCalledOnce();
  });

  it("calls onFullScreenClick when collapse clicked", () => {
    const onFullScreenClick = vi.fn();
    render({ isFullScreen: true, onFullScreenClick });
    const btn = container.querySelector('[data-testid="topbar-collapse"]');
    act(() => {
      btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onFullScreenClick).toHaveBeenCalledOnce();
  });
});
