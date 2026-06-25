/**
 * Tests for CompactControlBar — data-driven row visibility.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { CompactControlBar, type CompactControlBarProps } from "@cxr/controls/CompactControlBar";

describe("CompactControlBar", () => {
  let container: HTMLDivElement;
  let root: Root;

  const baseProps: CompactControlBarProps = {
    size: "md",
    isMuted: true,
    onMuteClick: vi.fn(),
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(props: Partial<CompactControlBarProps>): void {
    act(() => {
      root.render(React.createElement(CompactControlBar, { ...baseProps, ...props }));
    });
  }

  const query = (testId: string) => container.querySelector(`[data-testid="${testId}"]`);

  it("renders the icon cluster and Watch row with no optional data", () => {
    render({});
    expect(query("compact-control-bar")).toBeTruthy();
    expect(query("compact-bar-top-row")).toBeTruthy();
    expect(query("compact-bar-actions")).toBeTruthy();
    expect(query("compact-bar-identity-image")).toBeNull();
    expect(query("compact-bar-identity-name")).toBeNull();
    expect(query("compact-bar-description")).toBeNull();
  });

  it("renders identity image and name when provided", () => {
    render({ identity: { imageUrl: "https://example.com/a.png", name: "on3" } });
    expect(query("compact-bar-identity-image")).toBeTruthy();
    expect(query("compact-bar-identity-name")?.textContent).toBe("on3");
  });

  it("renders name without image (and vice versa) based on data", () => {
    render({ identity: { name: "on3" } });
    expect(query("compact-bar-identity-image")).toBeNull();
    expect(query("compact-bar-identity-name")).toBeTruthy();

    render({ identity: { imageUrl: "https://example.com/a.png" } });
    expect(query("compact-bar-identity-image")).toBeTruthy();
    expect(query("compact-bar-identity-name")).toBeNull();
  });

  it("renders the description row only when description is set", () => {
    render({ description: "Andy & Ari share the best traditions" });
    expect(query("compact-bar-description")?.textContent).toContain("Andy & Ari");

    render({ description: undefined });
    expect(query("compact-bar-description")).toBeNull();
  });

  it("renders the Linkout in md when CTA data is complete", () => {
    render({ cta: { url: "https://example.com", caption: "Shop Now" } });
    const link = container.querySelector('a[href="https://example.com"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain("Shop Now");
  });

  it("does not render the Linkout when CTA data is incomplete", () => {
    render({ cta: { url: "https://example.com", caption: "" } });
    expect(container.querySelector('a[href="https://example.com"]')).toBeNull();
  });

  it("does not render the Linkout in sm even with complete CTA data", () => {
    render({ size: "sm", cta: { url: "https://example.com", caption: "Shop Now" } });
    expect(container.querySelector('a[href="https://example.com"]')).toBeNull();
  });

  it("renders no actions row in video sm (showWatchInSm omitted)", () => {
    render({ size: "sm", description: "A scrolling caption" });
    expect(query("compact-bar-actions")).toBeNull();
    // Video sm keeps its ticker.
    expect(query("compact-bar-description")).toBeTruthy();
  });

  it("renders a Watch-only actions row in ad sm (showWatchInSm) and drops the ticker", () => {
    render({ size: "sm", showWatchInSm: true, description: "Rendered by genAd, not shown here" });
    expect(query("compact-bar-actions")).toBeTruthy();
    expect(container.querySelector('[data-testid="watch-btn"]')).toBeTruthy();
    // genAd owns the description in ad sm, so CXR suppresses its ticker.
    expect(query("compact-bar-description")).toBeNull();
  });
});
