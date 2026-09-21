// @ts-nocheck -- Vitest is provided by the components workspace test runner.
import { describe, expect, it } from "vitest";

import { getAllArticleSlugs } from "@genuin/components/page/article/article-data";

import { getHomeFeedPage } from "./pages";

describe("iHeart home-feed snapshot", () => {
  it("contains iHeart editorial data without Foil branding or links", () => {
    const firstPage = getHomeFeedPage(null);
    const serialized = JSON.stringify(firstPage);

    expect(firstPage).not.toBeNull();
    expect(serialized).toContain("iHeart");
    expect(serialized.toLowerCase()).not.toContain("the foil");
    expect(serialized.toLowerCase()).not.toContain("thefoil.com");
  });

  it("only links editorial cards to available iHeart article routes", () => {
    const firstPage = getHomeFeedPage(null);
    const knownRoutes = new Set(getAllArticleSlugs().map((slug) => `/article/${slug}`));
    const routes = JSON.stringify(firstPage).match(/\/article\/[a-z0-9-]+/g) ?? [];

    expect(routes.length).toBeGreaterThan(0);
    expect(routes.every((route) => knownRoutes.has(route))).toBe(true);
  });
});
