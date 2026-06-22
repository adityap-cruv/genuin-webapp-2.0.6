import { test, expect } from "@playwright/test";

test("loader bundle is served from dist", async ({ page }) => {
  const response = await page.goto("/gen_ext.min.js");
  expect(response?.status()).toBe(200);
  const body = await response!.text();
  expect(body.length).toBeGreaterThan(0);
  expect(body).not.toContain("__CR_CORE_FILENAME__"); // Placeholder must be replaced by the build pipeline.
  expect(body).not.toContain("__CR_CDN_BASE__");
});

test("hashed core bundle exists in dist", async ({ request, baseURL }) => {
  const loader = await request.get(`${baseURL}/gen_ext.min.js`);
  const code = await loader.text();
  const match = code.match(/gen_ext-([A-Za-z0-9_-]+)\.js/);
  expect(match).not.toBeNull();
  const coreUrl = `${baseURL}/${match![0]}`;
  const coreResp = await request.get(coreUrl);
  expect(coreResp.status()).toBe(200);
});
