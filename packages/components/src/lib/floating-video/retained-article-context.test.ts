// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { getParentExpandViewSourceIds } from "../feed-view/presentation";

import { clearFloatingVideo, promoteFloatingVideo } from "./events";
import { ARTICLE_CONTEXT_SUSPEND_EVENT, claimArticleContext, suspendArticleContext } from "./retained-article-context";
import { setFloatingVideoSession, setPendingFloatingVideoRestore } from "./session-store";
import type { FloatingVideoSession } from "./types";

const session: FloatingVideoSession = {
  sessionId: "child-session",
  sourceDomId: "article-video",
  sourceInstanceId: "child-instance",
  sourcePlacementId: "article-carousel",
  videoId: "child-video",
  sourcePathname: "/home",
  sourceArticleSlug: "interview",
  sourceParentDomIds: ["home-video"],
  targetHref: "/popular",
  targetPathname: "/popular",
  trigger: "sidebar",
};

function host(sourceId: string) {
  const element = document.createElement("div");
  element.dataset.genuinLightPortalHost = "true";
  element.dataset.portalKey = "expand-view";
  const portal = document.createElement("div");
  portal.dataset.genuinRootPortal = "true";
  portal.dataset.portalKey = "expand-view";
  portal.dataset.genuinSourceDomId = sourceId;
  element.append(portal);
  document.body.append(element);
  return { element, portal };
}
function prepare() {
  const source = document.createElement("div");
  source.id = "home-video";
  document.body.append(source);
  const parent = host("home-video");
  const article = document.createElement("section");
  article.dataset.slot = "inline-intelligence-article";
  const childSource = document.createElement("div");
  childSource.id = "article-video";
  article.append(childSource);
  const pip = document.createElement("video");
  parent.portal.append(article, pip);
  const child = host("article-video");
  const childVideo = document.createElement("video");
  child.portal.append(childVideo);
  promoteFloatingVideo(session);
  return { parent, article, pip, child, childVideo, childSource, source };
}
beforeEach(() => {
  window.history.replaceState(null, "", "/home");
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => window.setTimeout(fn, 0));
});
afterEach(async () => {
  clearFloatingVideo(session.sessionId, "manual-close");
  document.body.replaceChildren();
  await Promise.resolve();
  setFloatingVideoSession(null);
  setPendingFloatingVideoRestore(null);
  document.getElementById("gen-floating-video-style")?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("preserves the same article, original PiP and child video across navigation and restoration", () => {
  const { parent, article, pip, child, childVideo, childSource } = prepare();
  expect(getParentExpandViewSourceIds(childSource)).toEqual(["home-video"]);
  const suspended = vi.fn();
  document.addEventListener(ARTICLE_CONTEXT_SUSPEND_EVENT, suspended, { once: true });
  expect(suspendArticleContext(parent.element)).toBe(true);
  expect(suspended).toHaveBeenCalledOnce();
  expect(parent.element.style.visibility).toBe("hidden");
  expect(parent.element.inert).toBe(true);
  expect(child.element.dataset.genuinFloatingVideo).toBe("true");
  expect(article.isConnected).toBe(true);
  expect(pip.isConnected).toBe(true);

  window.history.replaceState(null, "", "/popular");
  setPendingFloatingVideoRestore(session);
  expect(claimArticleContext()).toBeNull();
  window.history.replaceState(null, "", "/home");
  expect(claimArticleContext()).toEqual({
    sourceDomId: "home-video",
    host: parent.element,
    sessionId: session.sessionId,
  });
  clearFloatingVideo(session.sessionId, "adopted");
  expect(parent.element.style.visibility).toBe("");
  expect(parent.element.inert).not.toBe(true);
  expect(parent.portal.querySelector("video")).toBe(pip);
  expect(parent.portal.querySelector("section")).toBe(article);
  expect(child.portal.querySelector("video")).toBe(childVideo);
  expect(child.element.hasAttribute("data-genuin-floating-video")).toBe(false);
});

it("does not restore the hidden parent just because its route mounted without an expand request", () => {
  const { parent } = prepare();
  suspendArticleContext(parent.element);
  expect(claimArticleContext()).toBeNull();
  expect(parent.element.style.visibility).toBe("hidden");
});

it("releases the retained parent when the floating session is explicitly closed", () => {
  const { parent } = prepare();
  const collapse = vi.fn();
  vi.stubGlobal("genuin", { collapse });
  suspendArticleContext(parent.element);
  clearFloatingVideo(session.sessionId, "manual-close");
  expect(collapse).toHaveBeenCalledWith("home-video");
  setPendingFloatingVideoRestore(session);
  expect(claimArticleContext()).toBeNull();
});

it("does not reattach a released parent when a queued parking frame runs", async () => {
  const { parent, source } = prepare();
  suspendArticleContext(parent.element);
  source.remove();
  clearFloatingVideo(session.sessionId, "manual-close");
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(document.getElementById("home-video")).toBeNull();
});
