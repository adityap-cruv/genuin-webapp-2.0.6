/**
 * Tests for PlayerProvider — written FIRST per TDD mandate.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { setBaseEventContextMock, useTagDetailsMock } = vi.hoisted(() => ({
  setBaseEventContextMock: vi.fn(),
  useTagDetailsMock: vi.fn(() => ({ tagId: undefined as string | undefined, brandId: undefined as number | undefined })),
}));
vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: vi.fn(), setBrandId: vi.fn(), setBaseEventContext: setBaseEventContextMock }),
}));
// StrategyProvider reads tagId/brandId from useTagDetails() (context), not a
// prop. Mock it so the real StrategyProvider resolves the configured tag.
vi.mock("@cxr/providers/TagDetailsProvider", () => ({
  useTagDetails: () => useTagDetailsMock(),
}));

import { InstanceProvider, useEventBus } from "@cxr/instance/InstanceContext";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { DEFAULT_UNMUTE_VOLUME, PlayerProvider, usePlayer } from "@cxr/providers/PlayerProvider";
import { StrategyProvider } from "@cxr/strategies/StrategyProvider";

interface Captured {
  isMuted: boolean;
  isPlaying: boolean;
  isAdBreakActive: boolean;
  volume: number;
  setMuted: (v: boolean, source?: "user" | "system") => void;
  setPlaying: (v: boolean) => void;
  setAdBreakActive: (active: boolean) => void;
  setVolume: (v: number) => void;
  notifyAutoplayBlocked: () => void;
}

let captured: Captured = {
  isMuted: false,
  isPlaying: false,
  isAdBreakActive: false,
  volume: 100,
  setMuted: () => {},
  setPlaying: () => {},
  setAdBreakActive: () => {},
  setVolume: () => {},
  notifyAutoplayBlocked: () => {},
};

function Consumer(): null {
  const ctx = usePlayer();
  captured = ctx;
  return null;
}

let capturedBus: ReturnType<typeof useEventBus> | null = null;

function BusConsumer(): null {
  capturedBus = useEventBus();
  return null;
}

describe("PlayerProvider", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    setBaseEventContextMock.mockClear();
    useTagDetailsMock.mockReturnValue({ tagId: undefined, brandId: undefined });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render() {
    act(() => {
      root.render(
        React.createElement(
          InstanceProvider,
          { instanceId: "test-instance" },
          React.createElement(PlayerProvider, null, React.createElement(Consumer), React.createElement(BusConsumer))
        )
      );
    });
  }

  it("reports the initial volume + mute state to analytics on mount", () => {
    render();
    expect(setBaseEventContextMock).toHaveBeenCalledWith({ volume: 0, is_muted: true });
  });

  it("re-reports player state to analytics when the user unmutes", () => {
    render();
    setBaseEventContextMock.mockClear();
    act(() => {
      captured.setMuted(false);
    });
    expect(setBaseEventContextMock).toHaveBeenCalledWith({ volume: DEFAULT_UNMUTE_VOLUME, is_muted: false });
  });

  it("provides isMuted=true initially (default muted)", () => {
    render();
    expect(captured.isMuted).toBe(true);
  });

  it("provides isPlaying=false initially (autoplay paused for now)", () => {
    render();
    expect(captured.isPlaying).toBe(false);
  });

  it("setMuted updates isMuted", () => {
    render();
    act(() => {
      captured.setMuted(false);
    });
    expect(captured.isMuted).toBe(false);
  });

  it("setMuted(false) leaves an already-audible volume unchanged (does not reset to DEFAULT_UNMUTE_VOLUME)", () => {
    render();
    act(() => {
      captured.setVolume(0.8);
    });
    act(() => {
      captured.setMuted(false);
    });
    expect(captured.volume).toBe(0.8);
  });

  it("setPlaying updates isPlaying", () => {
    render();
    act(() => {
      captured.setPlaying(true);
    });
    expect(captured.isPlaying).toBe(true);
  });

  it("provides volume=0 initially (unmuted but silent) with no strategy provider", () => {
    render();
    expect(captured.volume).toBe(0);
  });

  it("seeds initial volume from the active tag's strategy", () => {
    // Tag 6a2fefd87ce338c3a5afc605 is configured with initialVolume: 0.2.
    // StrategyProvider reads the tagId from useTagDetails(), so drive it there.
    useTagDetailsMock.mockReturnValue({ tagId: "6a2fefd87ce338c3a5afc605", brandId: undefined });
    const tree = React.createElement(
      InstanceProvider,
      { instanceId: "test-instance" },
      React.createElement(
        StrategyProvider,
        null,
        React.createElement(PlayerProvider, null, React.createElement(Consumer))
      )
    );
    act(() => {
      root.render(tree);
    });
    expect(captured.volume).toBe(0.2);
  });

  it("restores a manual unmute to the tag's initialVolume (GIV override)", () => {
    // GIV drives initialVolume everywhere, incl. the level a later
    // unmute restores to — 0.6 here, distinct from DEFAULT_UNMUTE_VOLUME (0.2).
    useTagDetailsMock.mockReturnValue({ tagId: "aaaabbbbccccdddd11112222", brandId: undefined });
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = "&GIV=0.6";
    const tree = React.createElement(
      InstanceProvider,
      { instanceId: "test-instance" },
      React.createElement(
        StrategyProvider,
        null,
        React.createElement(PlayerProvider, null, React.createElement(Consumer))
      )
    );
    act(() => {
      root.render(tree);
    });
    // Starts audible at the override level.
    expect(captured.volume).toBe(0.6);
    // Mute to silence, then unmute — restores to the override level, not 0.2.
    act(() => captured.setMuted(true));
    expect(captured.volume).toBe(0);
    act(() => captured.setMuted(false));
    expect(captured.volume).toBe(0.6);
    delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  });

  it("setVolume updates volume", () => {
    render();
    act(() => {
      captured.setVolume(40);
    });
    expect(captured.volume).toBe(40);
  });

  it("usePlayer throws outside PlayerProvider", () => {
    let errorCaught = false;
    function BadConsumer(): null {
      try {
        usePlayer();
      } catch {
        errorCaught = true;
      }
      return null;
    }
    act(() => {
      root.render(React.createElement(BadConsumer));
    });
    expect(errorCaught).toBe(true);
  });

  it("emits player:pause on mount when isPlaying defaults to false", () => {
    const emitSpy = vi.spyOn(CxrEventBus.prototype, "emit");
    render();
    expect(emitSpy).toHaveBeenCalledWith("player:pause", {});
    emitSpy.mockRestore();
  });

  it("emits player:play when setPlaying(true) is called", () => {
    const emitSpy = vi.spyOn(CxrEventBus.prototype, "emit");
    render();
    emitSpy.mockClear();
    act(() => {
      captured.setPlaying(true);
    });
    expect(emitSpy).toHaveBeenCalledWith("player:play", {});
    emitSpy.mockRestore();
  });

  it("emits player:play when setPlaying(true) is called after pause", () => {
    const emitSpy = vi.spyOn(CxrEventBus.prototype, "emit");
    render();
    act(() => {
      captured.setPlaying(false);
    });
    emitSpy.mockClear();
    act(() => {
      captured.setPlaying(true);
    });
    expect(emitSpy).toHaveBeenCalledWith("player:play", {});
    emitSpy.mockRestore();
  });

  it("emits mute:unmuted bus event when setMuted(false) is called", () => {
    render();
    const emitSpy = vi.spyOn(CxrEventBus.prototype, "emit");
    act(() => {
      captured.setMuted(false);
    });
    expect(emitSpy).toHaveBeenCalledWith("mute:unmuted", {});
    emitSpy.mockRestore();
  });

  it("unmutes when fullscreen:enter fires on the bus", () => {
    render();
    expect(captured.isMuted).toBe(true);
    act(() => {
      capturedBus!.emit("fullscreen:enter", {});
    });
    expect(captured.isMuted).toBe(false);
  });

  it("notifyAutoplayBlocked drops volume to 0 (single source of truth)", () => {
    render();
    act(() => {
      captured.setMuted(false);
    });
    expect(captured.isMuted).toBe(false);
    act(() => {
      captured.notifyAutoplayBlocked();
    });
    expect(captured.volume).toBe(0);
    expect(captured.isMuted).toBe(true);
  });

  it("notifyAutoplayBlocked mutes even after fullscreen:enter (no special-casing)", () => {
    render();
    act(() => {
      capturedBus!.emit("fullscreen:enter", {});
    });
    expect(captured.isMuted).toBe(false);
    act(() => {
      captured.notifyAutoplayBlocked();
    });
    expect(captured.volume).toBe(0);
    expect(captured.isMuted).toBe(true);
  });

  describe("isAdBreakActive", () => {
    it("defaults to false", () => {
      render();
      expect(captured.isAdBreakActive).toBe(false);
    });

    it("setAdBreakActive(true) flips the flag to true", () => {
      render();
      act(() => {
        captured.setAdBreakActive(true);
      });
      expect(captured.isAdBreakActive).toBe(true);
    });

    it("setAdBreakActive(false) resets the flag to false", () => {
      render();
      act(() => {
        captured.setAdBreakActive(true);
      });
      act(() => {
        captured.setAdBreakActive(false);
      });
      expect(captured.isAdBreakActive).toBe(false);
    });
  });
});
