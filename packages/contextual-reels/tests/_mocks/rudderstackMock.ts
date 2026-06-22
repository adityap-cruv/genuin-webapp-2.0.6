/**
 * Mock for `window.rudderanalytics`. Captures `track` calls and resolves
 * `ready` synchronously so analytics-dependent code paths run deterministically.
 */
import { vi, type Mock } from "vitest";

export interface RudderstackMockApi {
  track: Mock;
  load: Mock;
  ready: Mock<(cb: () => void) => void>;
}

export function installRudderstackMock(): RudderstackMockApi {
  const api: RudderstackMockApi = {
    track: vi.fn(),
    load: vi.fn(),
    ready: vi.fn((cb: () => void) => cb()),
  };
  (window as unknown as { rudderanalytics: RudderstackMockApi }).rudderanalytics = api;
  return api;
}

export function resetRudderstackMock(): void {
  delete (window as unknown as { rudderanalytics?: RudderstackMockApi }).rudderanalytics;
}
