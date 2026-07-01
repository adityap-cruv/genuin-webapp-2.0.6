/**
 * Tests for MuteUnmuteButtonV2 — the CXR V2 mute adapter that feeds
 * PlayerProvider state into the shared MuteButtonView, converting the view's
 * 0–100 slider scale to the provider's 0–1 unit scale.
 *
 * Covers: icon/aria by muted state, the toggle handler, the hover volume slider's
 * `handleVolumeChange` (all three setVolume/setMuted branches), and the
 * coarse-pointer (mobile) gate that hides the slider.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@cxr/config", () => ({ assetLink: "https://test.cdn/" }));

const playerState = vi.hoisted(() => ({
  volume: 0.5,
  setVolume: vi.fn(),
  setMuted: vi.fn(),
}));
vi.mock("@cxr/providers/PlayerProvider", () => ({
  usePlayer: () => playerState,
}));

import { MuteUnmuteButtonV2 } from "@cxr/controls/buttons/atoms/MuteUnmuteButtonV2";

/**
 * Drives a controlled range input the way React expects: write through the
 * native value setter (so React's value tracker sees the change) then dispatch
 * a bubbling `input` event, which is what React's onChange listens for.
 */
function setRangeValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("MuteUnmuteButtonV2", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    playerState.volume = 0.5;
    playerState.setVolume.mockClear();
    playerState.setMuted.mockClear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
    vi.unstubAllGlobals();
  });

  it("renders the mute icon and Unmute aria-label when muted", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={true} onClick={() => undefined} />);
    });
    const pill = container.querySelector('[data-testid="mute-btn"]')!;
    expect(pill.getAttribute("aria-label")).toBe("Unmute");
    expect(container.querySelector('[data-testid="mute-btn"] img')!.getAttribute("src")).toContain("mute.svg");
  });

  it("renders the unmute icon and Mute aria-label when unmuted", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={false} onClick={() => undefined} />);
    });
    const pill = container.querySelector('[data-testid="mute-btn"]')!;
    expect(pill.getAttribute("aria-label")).toBe("Mute");
    expect(container.querySelector('[data-testid="mute-btn"] img')!.getAttribute("src")).toContain("unmute.svg");
  });

  it("fires onClick when the pill is tapped", () => {
    const onClick = vi.fn();
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={false} onClick={onClick} />);
    });
    act(() => {
      (container.querySelector('[data-testid="mute-btn"]') as HTMLElement).click();
    });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a safe no-op when tapped with no onClick handler", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={false} />);
    });
    expect(() => {
      act(() => {
        (container.querySelector('[data-testid="mute-btn"]') as HTMLElement).click();
      });
    }).not.toThrow();
  });

  it("applies the animated-border class only while muted", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={true} animatedBorder onClick={() => undefined} />);
    });
    expect(container.querySelector('[data-testid="mute-btn"]')!.className).toContain("cxr-animated-border");
  });

  it("omits the animated-border class when unmuted even with animatedBorder set", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={false} animatedBorder onClick={() => undefined} />);
    });
    expect(container.querySelector('[data-testid="mute-btn"]')!.className).not.toContain("cxr-animated-border");
  });

  // handleVolumeChange: dragging the slider to a non-zero value while muted
  // converts 0–100 → 0–1, sets the volume, and clears mute.
  it("slider change to a non-zero value sets unit volume and unmutes", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={true} onClick={() => undefined} />);
    });
    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    act(() => {
      setRangeValue(input, "80");
    });
    expect(playerState.setVolume).toHaveBeenCalledWith(0.8);
    expect(playerState.setMuted).toHaveBeenCalledWith(false);
  });

  // handleVolumeChange: dragging to 0 mutes the player.
  it("slider change to zero mutes the player", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={false} onClick={() => undefined} />);
    });
    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    act(() => {
      setRangeValue(input, "0");
    });
    expect(playerState.setVolume).toHaveBeenCalledWith(0);
    expect(playerState.setMuted).toHaveBeenCalledWith(true);
  });

  // handleVolumeChange: a non-zero change while already unmuted sets volume but
  // does NOT toggle mute (neither the unmute nor the mute-at-zero branch fires).
  it("slider change to a non-zero value while unmuted only sets volume", () => {
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={false} onClick={() => undefined} />);
    });
    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    act(() => {
      setRangeValue(input, "30");
    });
    expect(playerState.setVolume).toHaveBeenCalledWith(0.3);
    expect(playerState.setMuted).not.toHaveBeenCalled();
  });

  // isCoarsePointer: on a touch (coarse-pointer) device the hover volume slider
  // is gated off entirely — the range input is not rendered.
  it("hides the volume slider on a coarse-pointer (touch) device", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("coarse"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));
    act(() => {
      root.render(<MuteUnmuteButtonV2 isMuted={false} onClick={() => undefined} />);
    });
    expect(container.querySelector('input[type="range"]')).toBeNull();
  });
});
