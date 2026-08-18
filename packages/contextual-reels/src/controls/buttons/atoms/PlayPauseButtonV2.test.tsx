/**
 * Tests for the CXR play/pause V2 adapter.
 *
 * The component is thin, but every prop it forwards is a decision the shared
 * `@genuin/ui` button cannot make for itself: which CXR asset to use, what the
 * accessible name is, and — the non-obvious one — that the animated "Tap to
 * play" pill must never show while the video is already playing.
 *
 * `@genuin/ui/player-controls` is mocked to a recording stub so these assert the
 * adapter's contract rather than the shared button's rendering.
 */
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { received } = vi.hoisted(() => ({ received: { props: null as Record<string, unknown> | null } }));
vi.mock("@genuin/ui/player-controls", () => ({
  PlayPauseButton: (props: Record<string, unknown>) => {
    received.props = props;
    return React.createElement("button", { "data-testid": props["data-testid"] });
  },
}));

const { PlayPauseButtonV2 } = await import("@cxr/controls/buttons/atoms/PlayPauseButtonV2");

describe("controls/PlayPauseButtonV2", () => {
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

  function render(props: Record<string, unknown> = {}): Record<string, unknown> {
    act(() => {
      root.render(React.createElement(PlayPauseButtonV2, props));
    });
    return received.props!;
  }

  it("keeps the legacy test id so selectors survive the V2 swap", () => {
    expect(render()["data-testid"]).toBe("play-pause-btn");
  });

  it("defaults to paused", () => {
    expect(render().isPlaying).toBe(false);
  });

  it("forwards play state", () => {
    expect(render({ isPlay: true }).isPlaying).toBe(true);
  });

  it.each([
    [true, "Pause"],
    [false, "Play"],
  ])("labels itself for the ACTION, not the state (isPlay=%s → %s)", (isPlay, label) => {
    expect(render({ isPlay })["aria-label"]).toBe(label);
  });

  it("invokes onClick through the shared button's onToggle", () => {
    const onClick = vi.fn();
    const props = render({ onClick });
    (props.onToggle as () => void)();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not throw when toggled without an onClick", () => {
    const props = render();
    expect(() => (props.onToggle as () => void)()).not.toThrow();
  });

  // The pill invites a first play. Showing it over an already-playing video is
  // the regression this guards.
  it("never shows the animated text while playing", () => {
    expect(render({ isPlay: true, shouldAnimate: true }).showAnimatedText).toBe(false);
  });

  it("shows the animated text while paused and animation is allowed", () => {
    expect(render({ isPlay: false, shouldAnimate: true }).showAnimatedText).toBe(true);
  });

  it("suppresses the animated text when animation is disabled (narrow rails)", () => {
    expect(render({ isPlay: false, shouldAnimate: false }).showAnimatedText).toBe(false);
  });

  it("defaults size to lg and forwards an override", () => {
    expect(render().size).toBe("lg");
    expect(render({ size: "sm" }).size).toBe("sm");
  });

  it("forwards suppressText, defaulting to false", () => {
    expect(render().suppressText).toBe(false);
    expect(render({ suppressText: true }).suppressText).toBe(true);
  });

  it("supplies both CXR glyphs with non-empty alt text", () => {
    const props = render();
    for (const key of ["playIcon", "pauseIcon"]) {
      const icon = props[key] as React.ReactElement<{ src: string; alt: string }>;
      expect(icon.props.src).toContain("/cxr/");
      expect(icon.props.alt).toBeTruthy();
    }
  });
});
