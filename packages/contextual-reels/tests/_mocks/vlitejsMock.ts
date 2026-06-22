/**
 * Vitest mock factory + helpers for the `vlitejs` module.
 *
 * Usage:
 *   import { vlitejsMockFactory, flushVliteOnReady } from '../_mocks/vlitejsMock';
 *   vi.mock('vlitejs', () => vlitejsMockFactory());
 */
import { vi, type Mock } from "vitest";

export interface PlayerHandleMock {
  play: Mock;
  pause: Mock;
  mute: Mock;
  unMute: Mock;
  seekTo: Mock;
  destroy: Mock;
  on: Mock;
  off: Mock;
  isMuted: Mock<() => boolean>;
  getCurrentTime: Mock<() => number>;
  getDuration: Mock<() => number>;
}

export interface VlitejsInstanceMock {
  player: PlayerHandleMock;
  __onReady?: (player: PlayerHandleMock) => void;
}

export function createPlayerHandleMock(): PlayerHandleMock {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    mute: vi.fn(),
    unMute: vi.fn(),
    seekTo: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    isMuted: vi.fn(() => false),
    getCurrentTime: vi.fn(() => 0),
    getDuration: vi.fn(() => 0),
  };
}

/**
 * Synchronously invoke the `onReady` callback registered against an instance,
 * mirroring the real Vlitejs lifecycle in tests.
 */
export function flushVliteOnReady(instance: VlitejsInstanceMock): void {
  instance.__onReady?.(instance.player);
}

/**
 * Module factory to feed to `vi.mock('vlitejs', () => vlitejsMockFactory())`.
 */
export function vlitejsMockFactory(): { default: unknown } {
  class Vlitejs {
    public player: PlayerHandleMock;
    public __onReady?: (player: PlayerHandleMock) => void;

    constructor(_selector: string | Element, opts?: { onReady?: (player: PlayerHandleMock) => void }) {
      this.player = createPlayerHandleMock();
      this.__onReady = opts?.onReady;
    }
  }
  return { default: Vlitejs };
}
