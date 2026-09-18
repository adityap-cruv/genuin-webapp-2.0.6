/**
 * Tests for the CXR expand/collapse V2 adapter.
 *
 * The load-bearing detail is the test id: it FLIPS between `topbar-expand` and
 * `topbar-collapse` with fullscreen state. The E2E page object drives fullscreen
 * entirely through those two ids and detects fullscreen by the presence of
 * `topbar-collapse`, so a static id here would silently break the suite's
 * fullscreen coverage rather than fail loudly.
 */
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { received } = vi.hoisted(() => ({ received: { props: null as Record<string, unknown> | null } }));
vi.mock("@genuin/ui/player-controls", () => ({
  ExpandCollapseButton: (props: Record<string, unknown>) => {
    received.props = props;
    return React.createElement("button", { "data-testid": props.testId });
  },
}));

const { ExpandCollapseButtonV2 } = await import("@cxr/controls/buttons/atoms/ExpandCollapseButtonV2");

describe("controls/ExpandCollapseButtonV2", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    received.props = null;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(props: Record<string, unknown>): Record<string, unknown> {
    act(() => {
      // `isFullScreen` is required on the real props type; the per-case objects
      // below are built as loose records, so the cast keeps each test terse
      // without weakening the component's own signature.
      root.render(React.createElement(ExpandCollapseButtonV2, props as never));
    });
    return received.props!;
  }

  it.each([
    [false, "topbar-expand"],
    [true, "topbar-collapse"],
  ])("flips the test id with fullscreen state (isFullScreen=%s → %s)", (isFullScreen, testId) => {
    expect(render({ isFullScreen }).testId).toBe(testId);
  });

  it.each([
    [false, "Expand"],
    [true, "Collapse"],
  ])("labels itself for the ACTION, not the state (isFullScreen=%s → %s)", (isFullScreen, label) => {
    expect(render({ isFullScreen }).ariaLabel).toBe(label);
  });

  it.each([
    [false, "expand.svg"],
    [true, "shrink.svg"],
  ])("selects the matching CXR glyph (isFullScreen=%s → %s)", (isFullScreen, file) => {
    const icon = render({ isFullScreen }).icon as React.ReactElement<{ src: string; alt: string }>;
    expect(icon.props.src).toContain(file);
    expect(icon.props.src).toContain("/cxr/");
  });

  it("gives the glyph alt text matching its label", () => {
    const icon = render({ isFullScreen: true }).icon as React.ReactElement<{ alt: string }>;
    expect(icon.props.alt).toBe("Collapse");
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    (render({ isFullScreen: false, onClick }).onClick as () => void)();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("defaults size to lg and forwards an override", () => {
    expect(render({ isFullScreen: false }).size).toBe("lg");
    expect(render({ isFullScreen: false, size: "sm" }).size).toBe("sm");
  });

  it("renders the button element carrying the flipped id", () => {
    render({ isFullScreen: true });
    expect(container.querySelector('[data-testid="topbar-collapse"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="topbar-expand"]')).toBeNull();
  });
});
