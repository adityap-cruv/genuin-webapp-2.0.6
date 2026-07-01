/**
 * Tests for `src/app/CloseButton.tsx`.
 *
 * Covers both branches of the iframe guard: hidden inside an iframe, rendered
 * otherwise. Rendered with raw React + react-dom per cluster conventions.
 */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CloseButton } from "@cxr/app/CloseButton";
import { isIframe } from "@cxr/config";

vi.mock("@cxr/config", () => ({
  isIframe: vi.fn(() => false),
}));

const mockIsIframe = isIframe as ReturnType<typeof vi.fn>;

describe("CloseButton", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsIframe.mockReturnValue(false);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders a clickable close button when not inside an iframe", () => {
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

  it("renders nothing when inside an iframe", () => {
    mockIsIframe.mockReturnValue(true);
    act(() => {
      root.render(createElement(CloseButton, { onClick: vi.fn() }));
    });

    expect(container.querySelector('[data-testid="cxr-close"]')).toBeNull();
    expect(container.children).toHaveLength(0);
  });
});
