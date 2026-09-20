// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, it, expect, vi } from "vitest";

import { useFloatingVideoAudioGuard } from "@genuin/components/lib/floating-video/use-floating-video-audio-guard";
import { FeedContextProvider, useFeedContext } from "@genuin/components/templates/feed/context";
const state = vi.hoisted(() => ({ embed: null as unknown }));
vi.mock("@genuin/components/context/analytics", () => ({ useAnalytics: () => ({ track: vi.fn(), EventName: {} }) }));
vi.mock("@genuin/components/context/embed/context", () => ({ useSafeEmbedContext: () => state.embed }));
vi.mock("@genuin/components/hooks/use-devide-detect-media-query", () => ({
  useDeviceDetectMediaQuery: () => ({ isMobile: false }),
}));
vi.mock("@genuin/components/lib/floating-video/events", () => ({
  onFloatingVideoPromote: () => () => {},
  onFloatingVideoClear: () => () => {},
}));
vi.mock("@genuin/components/lib/floating-video/session-store", () => ({
  getFloatingVideoSession: () => ({}),
  hasPendingFloatingVideoRestore: () => false,
}));
let feed: ReturnType<typeof useFeedContext>;
function Probe() {
  feed = useFeedContext();
  useFloatingVideoAudioGuard();
  return null;
}
let root: ReturnType<typeof createRoot>, container: HTMLElement, host: HTMLElement, video: HTMLVideoElement;
let paused: boolean;
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.embed = null;
  paused = false;
  host = document.createElement("div");
  host.dataset.genuinFloatingVideo = "true";
  video = document.createElement("video");
  host.append(video);
  document.body.append(host);
  Object.defineProperty(video, "paused", { get: () => paused });
  vi.spyOn(video, "pause").mockImplementation(() => {
    paused = true;
  });
  vi.spyOn(video, "play").mockImplementation(() => {
    paused = false;
    return Promise.resolve();
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const mount = () =>
  act(async () =>
    root.render(
      <FeedContextProvider disableNativeFullscreenApi>
        <Probe />
      </FeedContextProvider>
    )
  );
it("hides and pauses PiP on expand, then restores the same video on minimize", async () => {
  await mount();
  await act(async () => feed.openExpandView());
  expect(host.style.display).toBe("none");
  expect(video.muted).toBe(true);
  expect(video.pause).toHaveBeenCalledOnce();
  expect(host.dataset.genuinFloatingVideo).toBe("true");
  await act(async () => feed.closeExpandView());
  expect(host.style.display).toBe("");
  expect(video.muted).toBe(false);
  expect(video.play).toHaveBeenCalledOnce();
});
it("does not start a PiP that the user had paused", async () => {
  paused = true;
  await mount();
  await act(async () => feed.openExpandView());
  await act(async () => feed.closeExpandView());
  expect(video.play).not.toHaveBeenCalled();
});
it("never hides the SDK expand view itself", async () => {
  state.embed = { embedData: { embed_id: "embed" } };
  await mount();
  await act(async () => feed.openExpandView());
  expect(host.style.display).toBe("");
});
it("does not revive a cleared floating session", async () => {
  await mount();
  await act(async () => feed.openExpandView());
  host.removeAttribute("data-genuin-floating-video");
  await act(async () => feed.closeExpandView());
  expect(video.play).not.toHaveBeenCalled();
});
it("allows the full-view player to play and prevents hidden PiP autoplay", async () => {
  await mount();
  await act(async () => feed.openExpandView());
  const foreground = document.createElement("video");
  document.body.append(foreground);
  const pauseForeground = vi.spyOn(foreground, "pause").mockImplementation(() => {});
  foreground.dispatchEvent(new Event("play"));
  expect(pauseForeground).not.toHaveBeenCalled();
  vi.mocked(video.pause).mockClear();
  video.dispatchEvent(new Event("play"));
  expect(video.pause).toHaveBeenCalled();
  expect(pauseForeground).not.toHaveBeenCalled();
  foreground.remove();
});

it("mutes and pauses the SDK video inside its shadow root", async () => {
  const shadow = host.attachShadow({ mode: "open" });
  shadow.append(video);
  await mount();
  await act(async () => feed.openExpandView());
  expect(video.muted).toBe(true);
  expect(paused).toBe(true);
  // Non-composed events never reach the document-level audio guard.
  video.muted = false;
  video.dispatchEvent(new Event("volumechange"));
  expect(video.muted).toBe(true);
  paused = false;
  video.dispatchEvent(new Event("play"));
  expect(paused).toBe(true);
  await act(async () => feed.closeExpandView());
  expect(video.muted).toBe(false);
  expect(video.play).toHaveBeenCalledOnce();
});

it("preserves a PiP that was already muted when full view closes", async () => {
  video.muted = true;
  await mount();
  await act(async () => feed.openExpandView());
  await act(async () => feed.closeExpandView());
  expect(video.muted).toBe(true);
});
