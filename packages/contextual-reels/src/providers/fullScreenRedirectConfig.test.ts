import { describe, expect, it } from "vitest";

import { resolveFullScreenRedirectUrl } from "@cxr/providers/fullScreenRedirectConfig";

describe("resolveFullScreenRedirectUrl", () => {
  it("builds the configured redirect URL with embed_id for brand 3252", () => {
    expect(resolveFullScreenRedirectUrl(3252)).toBe(
      "https://infolinks.begenuin.com/home?embed_id=6a4b8a153b428877f20c9bb5"
    );
  });

  it("builds the configured redirect URL with no embed_id param for brand 3250 (QA placeholder)", () => {
    expect(resolveFullScreenRedirectUrl(3250)).toBe("https://www.google.com/");
  });

  it("returns undefined for a brand with no configured redirect", () => {
    expect(resolveFullScreenRedirectUrl(9999)).toBeUndefined();
  });

  it("returns undefined when brandId is undefined", () => {
    expect(resolveFullScreenRedirectUrl(undefined)).toBeUndefined();
  });
});
