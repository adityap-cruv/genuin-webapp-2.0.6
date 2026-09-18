// @vitest-environment node
import { describe, expect, it } from "vitest";

import { buildTargetingSync } from "./targeting";

/**
 * Runs under a real non-browser environment (no `window`/`document` at all) —
 * jsdom always provides both, so the SSR guards in `resolveMetaKeywords` and
 * `resolvePageUrl` can only be genuinely exercised here, not in targeting.test.ts.
 */
describe("buildTargetingSync — non-browser (SSR) context", () => {
  it("returns undefined entirely when there is no window/document", () => {
    expect(typeof window).toBe("undefined");
    expect(buildTargetingSync()).toBeUndefined();
  });
});
