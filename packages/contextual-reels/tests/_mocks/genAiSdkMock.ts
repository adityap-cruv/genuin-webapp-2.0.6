/**
 * Mock for `window.GenAISDK`. Provides a tiny dispatcher for the namespaced
 * `genai:*` window events that the SDK is expected to surface.
 */
import { vi, type Mock } from "vitest";

export interface GenAiSdkMockApi {
  init: Mock;
}

export function installGenAiSdkMock(): GenAiSdkMockApi {
  const api: GenAiSdkMockApi = { init: vi.fn() };
  (window as unknown as { GenAISDK: GenAiSdkMockApi }).GenAISDK = api;
  return api;
}

export function resetGenAiSdkMock(): void {
  delete (window as unknown as { GenAISDK?: GenAiSdkMockApi }).GenAISDK;
}

export type GenAiEventName =
  | "genai:dataFetching"
  | "genai:dataReceived"
  | "genai:chatClosed"
  | "genai:onFill"
  | "genai:onNoFill"
  | "genai:videoId";

export function dispatchGenAi(name: GenAiEventName, detail: Record<string, unknown> = {}): void {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
