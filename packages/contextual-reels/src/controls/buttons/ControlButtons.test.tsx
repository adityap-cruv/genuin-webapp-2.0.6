/**
 * Tests for the legacy ControlButtons module — the compact horizontal control
 * bar (`CompactControlBarOld`) used by AdControlLayer variant="old", plus the
 * `ghostStyle` shell helper.
 *
 * Renders the bar across both isPlay/isMuted states so the icon-source ternaries
 * in the internal Play/Mute/Watch atoms are exercised, and drives the click
 * handlers (mute toggles with the inverted state, play fires the callback).
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@cxr/config", () => ({ assetLink: "https://test.cdn/" }));

import { CompactControlBarOld, ghostStyle } from "@cxr/controls/buttons/ControlButtons";

describe("CompactControlBarOld", () => {
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

  function render(props: Partial<React.ComponentProps<typeof CompactControlBarOld>> = {}) {
    act(() => {
      root.render(
        React.createElement(CompactControlBarOld, {
          isPlay: false,
          isMuted: false,
          onPlayClick: vi.fn(),
          onMuteClick: vi.fn(),
          ...props,
        })
      );
    });
  }

  it("renders the bar with watch, mute and play buttons", () => {
    render();
    expect(container.querySelector('[data-testid="compact-control-bar"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="watch-btn"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="mute-btn"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="play-pause-btn"]')).toBeTruthy();
  });

  it("shows play/unmute icons when paused and unmuted", () => {
    render({ isPlay: false, isMuted: false });
    const muteImg = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
    const playImg = container.querySelector('[data-testid="play-pause-btn"] img') as HTMLImageElement;
    const watchImg = container.querySelector('[data-testid="watch-btn"] img') as HTMLImageElement;
    expect(muteImg.getAttribute("src")).toContain("unmute.svg");
    expect(playImg.getAttribute("src")).toContain("play.svg");
    expect(watchImg.getAttribute("src")).toContain("play.svg");
  });

  it("shows pause/mute icons when playing and muted", () => {
    render({ isPlay: true, isMuted: true });
    const muteImg = container.querySelector('[data-testid="mute-btn"] img') as HTMLImageElement;
    const playImg = container.querySelector('[data-testid="play-pause-btn"] img') as HTMLImageElement;
    const watchImg = container.querySelector('[data-testid="watch-btn"] img') as HTMLImageElement;
    expect(muteImg.getAttribute("src")).toContain("mute.svg");
    expect(playImg.getAttribute("src")).toContain("pause.svg");
    expect(watchImg.getAttribute("src")).toContain("pause.svg");
  });

  it("applies the animated-border class on the mute button only while muted", () => {
    render({ isMuted: true });
    expect(container.querySelector('[data-testid="mute-btn"]')!.className).toContain("cxr-animated-border");
  });

  it("omits the animated-border class when unmuted", () => {
    render({ isMuted: false });
    expect(container.querySelector('[data-testid="mute-btn"]')!.className).not.toContain("cxr-animated-border");
  });

  it("mute click toggles with the inverted muted state", () => {
    const onMuteClick = vi.fn();
    render({ isMuted: false, onMuteClick });
    act(() => {
      (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
    });
    expect(onMuteClick).toHaveBeenCalledWith(true);
  });

  it("mute click while muted toggles to unmuted", () => {
    const onMuteClick = vi.fn();
    render({ isMuted: true, onMuteClick });
    act(() => {
      (container.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement).click();
    });
    expect(onMuteClick).toHaveBeenCalledWith(false);
  });

  it("watch and play buttons fire onPlayClick", () => {
    const onPlayClick = vi.fn();
    render({ onPlayClick });
    act(() => {
      (container.querySelector('[data-testid="watch-btn"]') as HTMLButtonElement).click();
      (container.querySelector('[data-testid="play-pause-btn"]') as HTMLButtonElement).click();
    });
    expect(onPlayClick).toHaveBeenCalledTimes(2);
  });
});

describe("ghostStyle", () => {
  it("returns a frosted-glass shell sized to the given dimension with default padding", () => {
    const style = ghostStyle("32px");
    expect(style).toMatchObject({
      width: "32px",
      height: "32px",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(10px)",
    });
    expect(style.background).toContain("#00000066");
  });

  it("honours a custom padding override", () => {
    expect(ghostStyle("40px", "8px").padding).toBe("8px");
  });
});
