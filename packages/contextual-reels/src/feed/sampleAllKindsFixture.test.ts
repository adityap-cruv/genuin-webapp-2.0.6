/**
 * Validates `tests/e2e/fixtures/raw/sample-all-kinds.feed.json` — a small,
 * hand-authored feed response with exactly one reel of each `FeedEntry` kind,
 * for e2e specs that want deterministic single-example-per-kind input without
 * parsing a multi-KB captured production fixture. Lives here (not under
 * tests/e2e/) because Vitest's config excludes tests/e2e/** — that path is
 * reserved for Playwright specs.
 */
import { describe, it, expect } from "vitest";

import { normaliseFeed } from "@cxr/feed/feedTransforms";
import type { Reel } from "@cxr/types";

import sampleFeed from "../../tests/e2e/fixtures/raw/sample-all-kinds.feed.json";

describe("tests/e2e/fixtures/raw/sample-all-kinds.feed.json", () => {
  it("normalises to exactly one entry of each FeedEntry kind", () => {
    const reels = sampleFeed.data.reels as Reel[];
    const entries = normaliseFeed(reels, "sample-tag", false, false, false);

    expect(entries).toHaveLength(3);
    expect(entries.map((e) => e.kind).sort()).toEqual(["ad", "video", "video-with-ad"]);
  });
});
