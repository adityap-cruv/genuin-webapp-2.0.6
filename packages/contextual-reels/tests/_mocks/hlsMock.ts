/**
 * Mock for `hls.js`. Capturable: `startLoad`, `stopLoad`, `currentLevel` setter,
 * `destroy`, and the `MANIFEST_PARSED` event delivered synchronously via
 * `triggerManifestParsed`.
 */
import { vi, type Mock } from "vitest";

export interface HlsInstanceMock {
  startLoad: Mock;
  stopLoad: Mock;
  destroy: Mock;
  loadSource: Mock;
  attachMedia: Mock;
  detachMedia: Mock;
  recoverMediaError: Mock;
  on: Mock;
  off: Mock;
  currentLevel: number;
  __listeners: Map<string, Array<(...args: unknown[]) => void>>;
}

export const HlsEvents = {
  MANIFEST_PARSED: "hlsManifestParsed",
  ERROR: "hlsError",
} as const;

/** Mirrors hls.js `ErrorTypes` — the values the ERROR handler switches on. */
export const HlsErrorTypes = {
  NETWORK_ERROR: "networkError",
  MEDIA_ERROR: "mediaError",
  KEY_SYSTEM_ERROR: "keySystemError",
  MUX_ERROR: "muxError",
  OTHER_ERROR: "otherError",
} as const;

export function createHlsInstanceMock(): HlsInstanceMock {
  const listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  const inst: HlsInstanceMock = {
    startLoad: vi.fn(),
    stopLoad: vi.fn(),
    destroy: vi.fn(),
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    detachMedia: vi.fn(),
    recoverMediaError: vi.fn(),
    on: vi.fn((evt: string, cb: (...args: unknown[]) => void) => {
      const list = listeners.get(evt) ?? [];
      list.push(cb);
      listeners.set(evt, list);
    }) as Mock,
    off: vi.fn((evt: string, cb: (...args: unknown[]) => void) => {
      const list = listeners.get(evt);
      if (!list) return;
      const i = list.indexOf(cb);
      if (i >= 0) list.splice(i, 1);
    }) as Mock,
    currentLevel: -1,
    __listeners: listeners,
  };
  return inst;
}

export function triggerManifestParsed(inst: HlsInstanceMock, levels: unknown[]): void {
  const list = inst.__listeners.get(HlsEvents.MANIFEST_PARSED) ?? [];
  for (const cb of list) {
    cb(HlsEvents.MANIFEST_PARSED, { levels });
  }
}

/** Fire the ERROR event with the given error data to all registered listeners. */
export function triggerError(inst: HlsInstanceMock, data: { fatal?: boolean; type?: string }): void {
  const list = inst.__listeners.get(HlsEvents.ERROR) ?? [];
  for (const cb of list) {
    cb(HlsEvents.ERROR, data);
  }
}

export function hlsMockFactory(): {
  default: unknown;
  Events: typeof HlsEvents;
  ErrorTypes: typeof HlsErrorTypes;
} {
  class Hls {
    public static isSupported(): boolean {
      return true;
    }
    public static Events = HlsEvents;
    public static ErrorTypes = HlsErrorTypes;
    public startLoad: HlsInstanceMock["startLoad"];
    public stopLoad: HlsInstanceMock["stopLoad"];
    public destroy: HlsInstanceMock["destroy"];
    public loadSource: HlsInstanceMock["loadSource"];
    public attachMedia: HlsInstanceMock["attachMedia"];
    public detachMedia: HlsInstanceMock["detachMedia"];
    public recoverMediaError: HlsInstanceMock["recoverMediaError"];
    public on: HlsInstanceMock["on"];
    public off: HlsInstanceMock["off"];
    public currentLevel: number;
    public __listeners: HlsInstanceMock["__listeners"];

    constructor() {
      const m = createHlsInstanceMock();
      this.startLoad = m.startLoad;
      this.stopLoad = m.stopLoad;
      this.destroy = m.destroy;
      this.loadSource = m.loadSource;
      this.attachMedia = m.attachMedia;
      this.detachMedia = m.detachMedia;
      this.recoverMediaError = m.recoverMediaError;
      this.on = m.on;
      this.off = m.off;
      this.currentLevel = m.currentLevel;
      this.__listeners = m.__listeners;
    }
  }
  return { default: Hls, Events: HlsEvents, ErrorTypes: HlsErrorTypes };
}
