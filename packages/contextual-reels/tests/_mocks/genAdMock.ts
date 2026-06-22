/**
 * Mock for `window.GenAd`. Exposes helpers to simulate the ad waterfall
 * (video → banner → native), completion, and volume changes.
 */
import { vi, type Mock } from "vitest";

export interface GenAdInitOptions {
  container?: string | HTMLElement;
  onAdLoaded?: (provider: "video" | "banner" | "native") => void;
  onAdFailed?: (provider: "video" | "banner" | "native", err?: unknown) => void;
  onAdCompleted?: () => void;
  onVolumeChange?: (delta: number) => void;
  [key: string]: unknown;
}

export interface GenAdMockApi {
  init: Mock<(opts: GenAdInitOptions) => void>;
  destroy: Mock<() => void>;
  muteByContainer: Mock<(container: string | HTMLElement, muted: boolean) => void>;
}

let lastOptions: GenAdInitOptions | undefined;

function getApi(): GenAdMockApi {
  const w = window as unknown as { GenAd?: GenAdMockApi };
  if (!w.GenAd) {
    throw new Error("GenAd mock not installed; call installGenAdMock() first");
  }
  return w.GenAd;
}

export function installGenAdMock(): GenAdMockApi {
  lastOptions = undefined;
  const api: GenAdMockApi = {
    init: vi.fn((opts: GenAdInitOptions) => {
      lastOptions = opts;
    }),
    destroy: vi.fn(),
    muteByContainer: vi.fn(),
  };
  (window as unknown as { GenAd: GenAdMockApi }).GenAd = api;
  return api;
}

export function resetGenAdMock(): void {
  delete (window as unknown as { GenAd?: GenAdMockApi }).GenAd;
  lastOptions = undefined;
}

export function getLastGenAdInitOptions(): GenAdInitOptions | undefined {
  return lastOptions;
}

export function simulateWaterfallSuccess(provider: "video" | "banner" | "native"): void {
  getApi(); // assert installed
  lastOptions?.onAdLoaded?.(provider);
}

export function simulateWaterfallFail(provider: "video" | "banner" | "native"): void {
  getApi();
  lastOptions?.onAdFailed?.(provider, new Error(`waterfall failure: ${provider}`));
}

export function simulateAdCompleted(): void {
  getApi();
  lastOptions?.onAdCompleted?.();
}

export function simulateVolumeChange(delta: number): void {
  getApi();
  lastOptions?.onVolumeChange?.(delta);
}
