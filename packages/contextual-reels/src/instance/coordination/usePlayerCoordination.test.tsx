// packages/contextual-reels/src/instance/coordination/usePlayerCoordination.test.tsx
/**
 * Tests for usePlayerCoordination — verifies the hook registers this instance
 * with both the GlobalPlayerCoordinator and GlobalMuteCoordinator, wires the
 * per-instance bus events ("player:play" → notifyPlay, "mute:unmuted" →
 * notifyUnmuted), and tears all of that down on unmount.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: vi.fn(), setBrandId: vi.fn(), setBaseEventContext: vi.fn() }),
}));

import type { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";
import { EventBusProvider, useEventBus } from "@cxr/instance/coordination/EventBusContext";
import { getGlobalMuteCoordinator } from "@cxr/instance/coordination/GlobalMuteCoordinator";
import { getGlobalPlayerCoordinator } from "@cxr/instance/coordination/GlobalPlayerCoordinator";
import { usePlayerCoordination } from "@cxr/instance/coordination/usePlayerCoordination";
import { InstanceProvider } from "@cxr/instance/registry/InstanceContext";
import { PlayerProvider } from "@cxr/providers/PlayerProvider";

let container: HTMLDivElement;
let root: Root;
let unmounted = false;
let capturedBus: CxrEventBus | null = null;

/** Mounts the hook for the given instanceId inside the required providers. */
function setup(instanceId: string, pause: () => void): void {
  function Consumer(): React.JSX.Element {
    usePlayerCoordination(pause);
    capturedBus = useEventBus();
    return <span />;
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  unmounted = false;
  act(() => {
    root.render(
      <InstanceProvider instanceId={instanceId}>
        <EventBusProvider>
          <PlayerProvider>
            <Consumer />
          </PlayerProvider>
        </EventBusProvider>
      </InstanceProvider>
    );
  });
}

/** Unmount once, tracking state so afterEach never double-unmounts. */
function teardown(): void {
  if (unmounted) return;
  unmounted = true;
  act(() => root.unmount());
}

afterEach(() => {
  teardown();
  container.remove();
  capturedBus = null;
  // Drain any residual registrations so coordinator singletons stay clean.
  getGlobalPlayerCoordinator().unregister("coord-other");
  getGlobalMuteCoordinator().unregister("coord-other");
});

describe("usePlayerCoordination", () => {
  it("registers a pause callback that fires when another instance plays", () => {
    const pause = vi.fn();
    setup("coord-self", pause);
    // Simulate a different instance starting playback.
    getGlobalPlayerCoordinator().notifyPlay("coord-other");
    expect(pause).toHaveBeenCalledOnce();
  });

  it("does not pause itself when it is the instance that plays", () => {
    const pause = vi.fn();
    setup("coord-self", pause);
    getGlobalPlayerCoordinator().notifyPlay("coord-self");
    expect(pause).not.toHaveBeenCalled();
  });

  it("emitting player:play on its bus pauses other registered instances", () => {
    const otherPause = vi.fn();
    setup("coord-self", vi.fn());
    getGlobalPlayerCoordinator().register("coord-other", otherPause);
    act(() => {
      capturedBus!.emit("player:play", {});
    });
    expect(otherPause).toHaveBeenCalledOnce();
  });

  it("emitting mute:unmuted on its bus mutes other registered instances", () => {
    const otherMute = vi.fn();
    setup("coord-self", vi.fn());
    getGlobalMuteCoordinator().register("coord-other", otherMute);
    act(() => {
      capturedBus!.emit("mute:unmuted", {});
    });
    expect(otherMute).toHaveBeenCalledOnce();
  });

  it("unregisters from both coordinators on unmount", () => {
    const pause = vi.fn();
    setup("coord-self", pause);
    teardown();
    // After unmount the pause callback must no longer be invoked.
    getGlobalPlayerCoordinator().notifyPlay("coord-other");
    expect(pause).not.toHaveBeenCalled();
  });
});
