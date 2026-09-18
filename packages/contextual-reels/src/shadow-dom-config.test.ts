/**
 * Contract lock for the shadow-DOM data attributes.
 *
 * These are not internal names: `data-cxr-shadow-host` and friends are stamped
 * onto the publisher's own DOM, are what the E2E harness and any host-side
 * debugging select on, and `data-shadow-dom` is the opt-in a publisher writes in
 * their markup. Renaming one silently breaks all of that, so the literal values
 * are pinned here rather than left to be re-derived from usage.
 */
import { describe, it, expect } from "vitest";

import {
  DATA_ATTR_SHADOW_DOM_OPT_IN,
  DATA_ATTR_SHADOW_HOST,
  DATA_ATTR_SHADOW_ROOT_CONTAINER,
  DATA_ATTR_SHADOW_MOUNT,
} from "@cxr/shadow-dom-config";

describe("shadow-dom-config attribute contract", () => {
  it("pins the publisher-facing opt-in attribute", () => {
    expect(DATA_ATTR_SHADOW_DOM_OPT_IN).toBe("data-shadow-dom");
  });

  it("pins the internal marker attributes", () => {
    expect(DATA_ATTR_SHADOW_HOST).toBe("data-cxr-shadow-host");
    expect(DATA_ATTR_SHADOW_ROOT_CONTAINER).toBe("data-cxr-shadow-root");
    expect(DATA_ATTR_SHADOW_MOUNT).toBe("data-cxr-mount");
  });

  it("keeps every attribute distinct", () => {
    const all = [
      DATA_ATTR_SHADOW_DOM_OPT_IN,
      DATA_ATTR_SHADOW_HOST,
      DATA_ATTR_SHADOW_ROOT_CONTAINER,
      DATA_ATTR_SHADOW_MOUNT,
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  it("keeps every attribute a valid, lowercase data-* name", () => {
    for (const attr of [
      DATA_ATTR_SHADOW_DOM_OPT_IN,
      DATA_ATTR_SHADOW_HOST,
      DATA_ATTR_SHADOW_ROOT_CONTAINER,
      DATA_ATTR_SHADOW_MOUNT,
    ]) {
      // An uppercase letter here would silently mismatch a CSS attribute
      // selector, which lowercases attribute names in HTML documents.
      expect(attr).toMatch(/^data-[a-z-]+$/);
      // Round-trips through a real element, so a typo that HTML rejects fails here.
      const el = document.createElement("div");
      el.setAttribute(attr, "1");
      expect(el.getAttribute(attr)).toBe("1");
    }
  });
});
