// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { FeedViewOverlayProvider } from "../feed-view/feed-view-overlay";
import { getActiveExpandViewSourceId, getExpandViewSourceId } from "../feed-view/presentation";

import { clearFloatingVideo } from "./events";
import { beginFloatingVideoPresentation } from "./floating-video-presenter";
import { consumePendingFloatingVideoRestore } from "./session-store";

const state = vi.hoisted(() => ({
  session: null as null | {
    sessionId: string;
    sourceDomId: string;
    sourcePathname?: string;
    sourcePlacementId?: string;
    sourceArticleSlug?: string;
  },
}));
vi.mock("@genuin/ui/player-controls", () => ({ NavArrowButton: () => null }));
vi.mock("./session-store", () => ({
  getFloatingVideoSession: () => state.session,
  consumePendingFloatingVideoRestore: vi.fn(),
}));
vi.mock("./events", () => ({
  announceFloatingVideoPresented: vi.fn(),
  clearFloatingVideo: vi.fn(),
  onFloatingVideoClear: () => () => {},
}));

function mountHost(sourceId: string, shadow = false) {
  const host = document.createElement("div");
  host.setAttribute(shadow ? "data-genuin-overlay-host" : "data-genuin-light-portal-host", "true");
  host.dataset.portalKey = "expand-view";
  const portal = document.createElement("div");
  portal.dataset.genuinRootPortal = "true";
  portal.dataset.portalKey = "expand-view";
  portal.dataset.genuinSourceDomId = sourceId;
  (shadow ? host.attachShadow({ mode: "open" }) : host).append(portal);
  document.body.append(host);
  return host;
}

let root: ReturnType<typeof createRoot> | undefined;
beforeEach(() => {
  state.session = null;
  vi.clearAllMocks();
  vi.mocked(consumePendingFloatingVideoRestore).mockReset().mockReturnValue(null);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true }))
  );
  window.history.replaceState(null, "", "/home");
});
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
  document.getElementById("gen-floating-video-style")?.remove();
  vi.unstubAllGlobals();
});

it("selects the article's foreground video instead of its older Home player", () => {
  mountHost("home");
  const child = mountHost("article-video");
  expect(getActiveExpandViewSourceId()).toBe("article-video");
  child.remove();
  expect(getActiveExpandViewSourceId()).toBe("home");
});

it("resolves SDK ownership inside shadow hosts too", () => {
  mountHost("home", true);
  const child = mountHost("article-video", true);
  expect(getExpandViewSourceId(child)).toBe("article-video");
  expect(getActiveExpandViewSourceId()).toBe("article-video");
});

it("does not treat an existing floating card as the foreground player", () => {
  mountHost("article-video");
  mountHost("old-pip").dataset.genuinFloatingVideo = "true";
  expect(getActiveExpandViewSourceId()).toBe("article-video");
});

it("does not let a hidden retained article own a new navigation", () => {
  mountHost("home").dataset.genuinArticleContextSuspended = "true";
  mountHost("article-pip").dataset.genuinFloatingVideo = "true";
  expect(getActiveExpandViewSourceId()).toBeUndefined();
});

it("does not turn the parent overlay into the child's floating card", () => {
  const parent = mountHost("home");
  state.session = { sessionId: "session", sourceDomId: "article-video" };
  expect(beginFloatingVideoPresentation(parent)).toBe(false);
  expect(parent.hasAttribute("data-genuin-floating-video")).toBe(false);
});

it("frames only the matching child and preserves adopted SDK ownership", () => {
  const host = mountHost("retained-article-video");
  state.session = { sessionId: "session", sourceDomId: "retained-article-video" };
  expect(beginFloatingVideoPresentation(host)).toBe(true);
  expect(host.dataset.genuinFloatingVideo).toBe("true");
});

it("does not create a floating card without a navigation session", () => {
  expect(beginFloatingVideoPresentation(mountHost("home"))).toBe(false);
});

it.each(["ended", "error"])("keeps PiP open when a video emits %s", (eventType) => {
  const host = mountHost("article-video");
  state.session = { sessionId: "session", sourceDomId: "article-video" };
  beginFloatingVideoPresentation(host);
  const active = document.createElement("video");
  const preloaded = document.createElement("video");
  host.append(active, preloaded);
  active.dispatchEvent(new Event(eventType));
  preloaded.dispatchEvent(new Event(eventType));
  expect(clearFloatingVideo).not.toHaveBeenCalled();
  expect(host.dataset.genuinFloatingVideo).toBe("true");
});

function prepareRestore() {
  const session = {
    sessionId: "session",
    sourceDomId: "retained-article-video",
    sourcePlacementId: "article-carousel",
    sourcePathname: "/home",
  };
  state.session = session;
  const retained = mountHost(session.sourceDomId);
  retained.dataset.genuinFloatingVideo = "true";
  const placement = document.createElement("div");
  placement.id = session.sourceDomId;
  document.body.append(placement);
  vi.mocked(consumePendingFloatingVideoRestore).mockReturnValueOnce(session);
  return { retained, session };
}

async function mountPageHost(onOpen = vi.fn()) {
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () =>
    root!.render(
      <StrictMode>
        <FeedViewOverlayProvider onOpen={onOpen}>{null}</FeedViewOverlayProvider>
      </StrictMode>
    )
  );
  return onOpen;
}

it("restores an inline article video on Home without mounting an article route", async () => {
  const { retained, session } = prepareRestore();
  const onOpen = await mountPageHost();
  expect(window.location.pathname).toBe("/home");
  expect(onOpen).toHaveBeenCalledExactlyOnceWith({ sourceDomId: session.sourceDomId, existingExpandHosts: [] });
  expect(retained.isConnected).toBe(true);
  expect(clearFloatingVideo).toHaveBeenCalledExactlyOnceWith(session.sessionId, "adopted");
});

it("does not claim a restore while still on Popular", async () => {
  prepareRestore();
  window.history.replaceState(null, "", "/popular");
  const onOpen = await mountPageHost();
  expect(onOpen).not.toHaveBeenCalled();
  expect(consumePendingFloatingVideoRestore).not.toHaveBeenCalled();
});

it("leaves an article restore for the article's own overlay instead of Home's generic Back action", async () => {
  const { session } = prepareRestore();
  state.session = { ...session, sourceArticleSlug: "interview" };
  const onOpen = await mountPageHost();
  expect(onOpen).not.toHaveBeenCalled();
  expect(consumePendingFloatingVideoRestore).not.toHaveBeenCalled();
});

it("does not open Feed View without a pending expand request", async () => {
  prepareRestore();
  vi.mocked(consumePendingFloatingVideoRestore).mockReset().mockReturnValue(null);
  expect(await mountPageHost()).not.toHaveBeenCalled();
  expect(clearFloatingVideo).not.toHaveBeenCalled();
});

it("leaves mobile presentation unchanged", async () => {
  prepareRestore();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false }))
  );
  expect(await mountPageHost()).not.toHaveBeenCalled();
  expect(consumePendingFloatingVideoRestore).not.toHaveBeenCalled();
});
