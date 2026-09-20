// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { requestFloatingVideoPromotion } from "./events";
import {
  consumePendingFloatingVideoRestore,
  getFloatingVideoSession,
  setFloatingVideoSession,
  setPendingFloatingVideoRestore,
} from "./session-store";
import { useFloatingVideoPromoter } from "./use-floating-video-promoter";

const state = vi.hoisted(() => ({ rootElement: null as HTMLElement | null, embedEventBus: {} }));
vi.mock("@genuin/components/context/embed/context", () => ({
  useSafeEmbedContext: () => ({ ...state, embedData: { placement_id: "article-carousel" } }),
}));

let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.history.replaceState(null, "", "/home");
  setFloatingVideoSession(null);
  setPendingFloatingVideoRestore(null);
});
afterEach(async () => {
  await act(async () => root?.unmount());
  setFloatingVideoSession(null);
  setPendingFloatingVideoRestore(null);
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

function Player() {
  useFloatingVideoPromoter({ posts: [{ video: { id: "article-video" } }] as PostDetailsType[], activeIndex: 0 });
  return null;
}

async function mountPlayer(articleSlug?: string) {
  const article = document.createElement("section");
  if (articleSlug) article.dataset.floatingVideoArticleSlug = articleSlug;
  const placement = document.createElement("div");
  placement.id = "source";
  placement.dataset.homeFeedView = "true";
  article.append(placement);
  document.body.append(article);
  const host = document.createElement("div");
  host.dataset.genuinLightPortalHost = "true";
  host.dataset.portalKey = "expand-view";
  const portal = document.createElement("div");
  portal.dataset.genuinRootPortal = "true";
  portal.dataset.portalKey = "expand-view";
  portal.dataset.genuinSourceDomId = placement.id;
  host.append(portal);
  document.body.append(host);
  state.rootElement = placement;
  root = createRoot(placement);
  await act(async () => root.render(<Player />));
  return placement;
}

it("keeps the inline article separate from the current route across PiP round trips", async () => {
  const placement = await mountPlayer("interview");
  expect(requestFloatingVideoPromotion({ targetHref: "/popular", trigger: "sidebar" })).toBe(true);
  expect(getFloatingVideoSession()?.sourceArticleSlug).toBe("interview");

  expect(getFloatingVideoSession()?.sourcePathname).toBe("/home");

  // The retained SDK placement loses its article ancestor after navigation.
  document.body.append(placement);
  setFloatingVideoSession(null);
  window.history.replaceState(null, "", "/popular");
  expect(requestFloatingVideoPromotion({ targetHref: "/latest", trigger: "sidebar" })).toBe(true);
  expect(getFloatingVideoSession()?.sourceArticleSlug).toBe("interview");
  expect(getFloatingVideoSession()?.sourcePathname).toBe("/popular");
});

it("keeps ordinary Home video restores on Home", async () => {
  await mountPlayer();
  expect(requestFloatingVideoPromotion({ targetHref: "/popular", trigger: "sidebar" })).toBe(true);
  expect(getFloatingVideoSession()?.sourcePathname).toBe("/home");
});

it("waits for the original inline article before a shared placement can claim the player", () => {
  const request = {
    sessionId: "restore",
    sourceDomId: "retained",
    sourcePlacementId: "article-carousel",
    sourcePathname: "/home",
    sourceArticleSlug: "interview",
  };
  setPendingFloatingVideoRestore(request);
  const placement = { domId: "new-placement", placementId: "article-carousel" };
  expect(consumePendingFloatingVideoRestore(placement)).toBeNull();
  expect(consumePendingFloatingVideoRestore({ ...placement, articleSlug: "another-article" })).toBeNull();
  expect(consumePendingFloatingVideoRestore({ ...placement, articleSlug: "interview" })).toEqual(request);
  expect(consumePendingFloatingVideoRestore({ ...placement, articleSlug: "interview" })).toBeNull();
});
