import type { RefObject } from "react";
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { useFullscreenClasses } from "@cxr/feed/hooks/useFullscreenClasses";

interface ShimProps {
  isFullScreen: boolean;
  overlayRef: RefObject<HTMLElement | null>;
}

function HookShim(props: ShimProps): null {
  useFullscreenClasses({
    isFullScreen: props.isFullScreen,
    overlayRef: props.overlayRef,
  });
  return null;
}

describe("useFullscreenClasses", () => {
  let container: HTMLDivElement;
  let root: Root;
  let overlayEl: HTMLDivElement;
  let overlayRef: RefObject<HTMLElement | null>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    overlayEl = document.createElement("div");
    overlayEl.id = "test-overlay";
    document.body.appendChild(overlayEl);

    overlayRef = { current: overlayEl };
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
    document.body.removeChild(overlayEl);
  });

  function render(isFullScreen: boolean, ref: RefObject<HTMLElement | null> = overlayRef) {
    act(() => {
      root.render(React.createElement(HookShim, { isFullScreen, overlayRef: ref }));
    });
  }

  it('adds "expand" to overlay when isFullScreen=true', () => {
    render(true);
    expect(overlayEl.classList.contains("expand")).toBe(true);
  });

  it('removes "expand" from overlay when isFullScreen=false', () => {
    render(true);
    render(false);
    expect(overlayEl.classList.contains("expand")).toBe(false);
  });

  it('does not add "expand" to body when isFullScreen=true', () => {
    render(true);
    expect(document.body.classList.contains("expand")).toBe(false);
  });

  it("does not throw when overlayRef.current is null", () => {
    const nullRef: RefObject<HTMLElement | null> = { current: null };
    expect(() => render(true, nullRef)).not.toThrow();
    expect(document.body.classList.contains("expand")).toBe(false);
  });
});
