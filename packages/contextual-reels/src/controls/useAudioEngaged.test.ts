/**
 * Tests for useAudioEngaged — the audio-scoped "has the user acted on sound yet?"
 * latch that drives the mute-icon enticement.
 *
 * Behaviours under test:
 *  - silent start (initialVolume 0): not engaged until a `mute:unmuted` fires
 *  - audible start (initialVolume > 0): engaged from the first render, no bus needed
 *  - locallyEngaged override flips the result synchronously
 *  - seeds from the bus latch (`hasFired`) so a slide mounting after an earlier
 *    engagement starts engaged (no enticement flash)
 *  - one-directional: stays engaged after the event
 *  - degrades to `false` (silent start) when rendered without an event bus
 */
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useAudioEngaged } from "@cxr/controls/useAudioEngaged";
import { CxrEventBus } from "@cxr/instance/coordination/CxrEventBus";

// Strategy + bus are injected via mocks so each test controls initialVolume and
// whether a bus is present.
let mockInitialVolume = 0;
let mockBus: CxrEventBus | undefined;

vi.mock("../strategies/StrategyProvider", () => ({
  useStrategy: () => ({ initialVolume: mockInitialVolume }),
}));
vi.mock("../instance/coordination/EventBusContext", () => ({
  useOptionalEventBus: () => mockBus,
}));

describe("useAudioEngaged", () => {
  let container: HTMLDivElement;
  let root: Root;
  let result: { engaged: boolean };

  beforeEach(() => {
    mockInitialVolume = 0;
    mockBus = new CxrEventBus();
    result = { engaged: false };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render(locallyEngaged?: boolean) {
    function Consumer() {
      result.engaged = useAudioEngaged(locallyEngaged);
      return null;
    }
    act(() => {
      root.render(createElement(Consumer));
    });
  }

  it("silent start: not engaged until a mute:unmuted event fires", () => {
    render();
    expect(result.engaged).toBe(false);

    act(() => {
      mockBus!.emit("mute:unmuted", {});
    });
    expect(result.engaged).toBe(true);
  });

  it("audible start (initialVolume > 0): engaged from the first render", () => {
    mockInitialVolume = 0.2;
    render();
    expect(result.engaged).toBe(true);
  });

  it("audible start needs no bus", () => {
    mockInitialVolume = 0.2;
    mockBus = undefined;
    render();
    expect(result.engaged).toBe(true);
  });

  it("locallyEngaged override flips the result synchronously", () => {
    render(true);
    expect(result.engaged).toBe(true);
  });

  it("seeds engaged from the bus latch when mute:unmuted already fired before mount", () => {
    mockBus!.emit("mute:unmuted", {});
    render();
    expect(result.engaged).toBe(true);
  });

  it("latch is one-directional: stays engaged after the event", () => {
    render();
    act(() => {
      mockBus!.emit("mute:unmuted", {});
    });
    expect(result.engaged).toBe(true);
    // A re-render does not reset it.
    render();
    expect(result.engaged).toBe(true);
  });

  it("silent start without a bus degrades to not engaged", () => {
    mockBus = undefined;
    render();
    expect(result.engaged).toBe(false);
  });
});
