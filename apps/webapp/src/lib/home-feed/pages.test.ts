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

  it("rotates sponsor between U.S. Ski and Capital One with responsive placements", () => {
    const page0 = getHomeFeedPage(null);
    expect(page0.data.tmobile.header?.heading).toBe("U.S. Ski");
    expect(page0.data.tmobile.sponsored).toBe(true);
    const widgetNode0 = page0.layout.rows.flatMap((r) => r.children).find((c) => c.dataKey === "tmobile");
    expect(widgetNode0?.config?.placementId).toBe("6ab157b8d8e21711abc4bba3");
    expect(widgetNode0?.config?.styleId).toBe("6ab157b8d8e21711abc4bba2");
    expect(widgetNode0?.config?.mobilePlacementId).toBe("6ab157b9d8e21711abc4bba5");
    expect(widgetNode0?.config?.mobileStyleId).toBe("6ab157b9d8e21711abc4bba4");

    const page1 = getHomeFeedPage(page0.pagination.nextCursor);
    expect(page1.data.tmobile.header?.heading).toBe("Capital One");
    expect(page1.data.tmobile.sponsored).toBe(true);
    const widgetNode1 = page1.layout.rows.flatMap((r) => r.children).find((c) => c.dataKey === "tmobile");
    expect(widgetNode1?.config?.placementId).toBe("6ab157bbd8e21711abc4bba8");
    expect(widgetNode1?.config?.styleId).toBe("6ab157bbd8e21711abc4bba7");
    expect(widgetNode1?.config?.mobilePlacementId).toBe("6ab157bbd8e21711abc4bbaa");
    expect(widgetNode1?.config?.mobileStyleId).toBe("6ab157bbd8e21711abc4bba9");
  });
});
