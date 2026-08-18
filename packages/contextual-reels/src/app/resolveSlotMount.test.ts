/**
 * Tests for the slot mount seam — the one decision `index.jsx` makes that
 * changes what renders: which node the root mounts into, and which layout the
 * widget renders in. Both registered stacked tags are exercised (320×100 → our
 * L3 on top, 300×600 → our L1 on top) plus the ordinary non-stacked path.
 */
import { describe, it, expect, afterEach } from "vitest";

import { resolveSlotMount } from "@cxr/app/resolveSlotMount";
import { AD_LAYOUT, STACKED_LAYOUT_TAGS } from "@cxr/config";
import { STACKED_BOTTOM_ATTR, STACKED_TOP_ATTR } from "@cxr/utils/infolinks";

const STACKED_320 = "6a032e34054c8fcb08582510";
const STACKED_300 = "69b298e3d6a6ad57e7b9a464";
const PLAIN_TAG = "plain-tag-id";

/**
 * A slot element that reports a real layout box — jsdom leaves
 * offsetWidth/offsetHeight at 0, and the resolver measures exactly those.
 */
function makeSlot(width: number, height: number): HTMLElement {
  const node = document.createElement("div");
  Object.defineProperty(node, "offsetWidth", { configurable: true, value: width });
  Object.defineProperty(node, "offsetHeight", { configurable: true, value: height });
  document.body.appendChild(node);
  return node;
}

/** Point the frame chain at a page carrying (or not carrying) the stacked param. */
function setSearch(search: string, hostname = "example.com"): void {
  const href = `http://${hostname}/page${search}`;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { href, search, hostname },
  });
}

afterEach(() => {
  setSearch("");
  document.body.innerHTML = "";
});

describe("resolveSlotMount — ordinary slots", () => {
  it.each([
    ["L1 300×600", 300, 600, AD_LAYOUT.L1],
    ["L2 300×250", 300, 250, AD_LAYOUT.L2],
    ["L3 320×50", 320, 50, AD_LAYOUT.L3],
    ["L4 320×100", 320, 100, AD_LAYOUT.L4],
    ["L5 320×480", 320, 480, AD_LAYOUT.L5],
  ])("mounts %s into the slot itself", (_label, width, height, expected) => {
    const node = makeSlot(width, height);

    const { mountHost, adLayout, isStacked } = resolveSlotMount(node, PLAIN_TAG);

    expect(mountHost).toBe(node);
    expect(adLayout).toBe(expected);
    expect(isStacked).toBe(false);
    expect(node.children).toHaveLength(0);
  });

  it("resolves an unlisted slot size to Unknown and still mounts", () => {
    const node = makeSlot(336, 280);

    const { mountHost, adLayout, isStacked } = resolveSlotMount(node, PLAIN_TAG);

    expect(mountHost).toBe(node);
    expect(adLayout).toBe(AD_LAYOUT.Unknown);
    expect(isStacked).toBe(false);
  });

  // The Infolinks host wraps our slot in `transform: scale(...)` containers, so
  // the bounding rect inflates. Reading offsetWidth/Height is what keeps a real
  // 320×100 slot resolving to L4 there — assert the resolver never consults the
  // rect by making the two disagree.
  it("measures the layout box, not the transformed bounding rect", () => {
    const node = makeSlot(320, 100);
    node.getBoundingClientRect = () => ({ width: 344, height: 204 }) as DOMRect;

    expect(resolveSlotMount(node, PLAIN_TAG).adLayout).toBe(AD_LAYOUT.L4);
  });
});

describe("resolveSlotMount — stacked variant", () => {
  it("splits the 320×100 tag into our L3 on top + an Infolinks row below", () => {
    setSearch("?gen_variant=stacked");
    const node = makeSlot(320, 100);

    const { mountHost, adLayout, isStacked } = resolveSlotMount(node, STACKED_320);

    expect(isStacked).toBe(true);
    expect(adLayout).toBe(AD_LAYOUT.L3);
    expect(mountHost).not.toBe(node);
    expect(mountHost.getAttribute("data-genuin-cxr")).toBe(STACKED_TOP_ATTR);
    expect(node.lastElementChild?.getAttribute("data-genuin-cxr")).toBe(STACKED_BOTTOM_ATTR);
    // Both halves are sized from the registered config, not from the slot.
    expect(mountHost.style.height).toBe(`${STACKED_LAYOUT_TAGS[STACKED_320]!.halfHeight}px`);
  });

  // L1 fills its container, so it renders correctly in the 300×300 half; L2 is
  // dimensionally locked to 300×250 and would leave a 50px gap — hence ourLayout
  // stays L1 for this tag even though the half is 300×300.
  it("splits the 300×600 tag into our L1 on top + an Infolinks row below", () => {
    setSearch("?gen_variant=stacked");
    const node = makeSlot(300, 600);

    const { mountHost, adLayout, isStacked } = resolveSlotMount(node, STACKED_300);

    expect(isStacked).toBe(true);
    expect(adLayout).toBe(AD_LAYOUT.L1);
    expect(mountHost.getAttribute("data-genuin-cxr")).toBe(STACKED_TOP_ATTR);
    expect(mountHost.style.height).toBe("300px");
  });

  it("does not stack a registered tag without the gen_variant param", () => {
    const node = makeSlot(320, 100);

    const { mountHost, adLayout, isStacked } = resolveSlotMount(node, STACKED_320);

    expect(isStacked).toBe(false);
    expect(mountHost).toBe(node);
    expect(adLayout).toBe(AD_LAYOUT.L4);
  });

  it("does not stack a registered tag embedded at the wrong size", () => {
    setSearch("?gen_variant=stacked");
    const node = makeSlot(320, 50);

    const { adLayout, isStacked } = resolveSlotMount(node, STACKED_320);

    expect(isStacked).toBe(false);
    expect(adLayout).toBe(AD_LAYOUT.L3);
  });

  it("does not stack an unregistered tag off localhost", () => {
    setSearch("?gen_variant=stacked");
    const node = makeSlot(320, 100);

    expect(resolveSlotMount(node, PLAIN_TAG).isStacked).toBe(false);
  });

  // Localhost relaxes the tag check so either stacked layout can be exercised
  // against any tag during development.
  it("stacks any tag at a supported size on localhost", () => {
    setSearch("?gen_variant=stacked", "localhost");
    const node = makeSlot(320, 100);

    const { adLayout, isStacked } = resolveSlotMount(node, PLAIN_TAG);

    expect(isStacked).toBe(true);
    expect(adLayout).toBe(AD_LAYOUT.L3);
  });

  // init() re-runs on DOM mutations; a second pass must reuse the existing top
  // row rather than appending a second pair of halves.
  it("is idempotent — a re-mount reuses the existing top row", () => {
    setSearch("?gen_variant=stacked");
    const node = makeSlot(320, 100);

    const first = resolveSlotMount(node, STACKED_320);
    const second = resolveSlotMount(node, STACKED_320);

    expect(second.mountHost).toBe(first.mountHost);
    expect(node.children).toHaveLength(2);
  });
});
