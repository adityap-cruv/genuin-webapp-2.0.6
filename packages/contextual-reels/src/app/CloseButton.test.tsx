/**
 * Tests for `src/app/CloseButton.tsx`.
 *
 * CloseButton is now a pure presentational button — it always renders and wires
 * its `onClick`. (The former iframe-visibility guard moved up to the caller,
 * `FeedTree`'s `NativeFeedShim`, which decides whether to mount it at all.)
 * Rendered with raw React + react-dom per cluster conventions.
 */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CloseButton } from "@cxr/app/CloseButton";

describe("CloseButton", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders a labelled, clickable close button", () => {
    const onClick = vi.fn();
    act(() => {
      root.render(createElement(CloseButton, { onClick }));
    });

    const button = container.querySelector<HTMLButtonElement>('[data-testid="cxr-close"]');
    expect(button).toBeTruthy();
    expect(button?.getAttribute("aria-label")).toBe("Close");

    act(() => {
      button?.click();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
