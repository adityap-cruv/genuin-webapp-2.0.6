import { afterEach, describe, expect, it, vi } from "vitest";

import { dispatchGenAi, installGenAiSdkMock, resetGenAiSdkMock } from "./genAiSdkMock";

describe("genAiSdkMock", () => {
  afterEach(() => {
    resetGenAiSdkMock();
  });

  it("installs window.GenAISDK with an init mock", () => {
    installGenAiSdkMock();
    const w = window as unknown as { GenAISDK: { init: unknown } };
    expect(typeof w.GenAISDK.init).toBe("function");
  });

  it("dispatchGenAi emits a CustomEvent on window with the provided detail", () => {
    installGenAiSdkMock();
    const handler = vi.fn();
    window.addEventListener("genai:videoId", handler as EventListener);
    dispatchGenAi("genai:videoId", { videoId: "v1" });
    window.removeEventListener("genai:videoId", handler as EventListener);
    expect(handler).toHaveBeenCalledTimes(1);
    const evt = handler.mock.calls[0]?.[0] as CustomEvent<{ videoId: string }>;
    expect(evt.detail).toEqual({ videoId: "v1" });
  });
});
