/**
 * Drift guard for every committed feed fixture.
 *
 * The `servedStatically` tags, two debug handsets and the whole E2E suite are
 * served from JSON on disk. Those files are the one part of the feed pipeline
 * TypeScript cannot check, so a mis-shaped fixture would only surface as a blank
 * widget in production (`data.reels` undefined → the feed fails). This walks each
 * one through the real normaliser and asserts it still yields renderable slides.
 */
import { readFileSync, readdirSync } from "node:fs";

import { describe, it, expect } from "vitest";

import { normaliseFeed } from "@cxr/feed/feedTransforms";
import type { Reel } from "@cxr/types";

const FIXTURE_DIRS = ["src/providers/static-tag", "src/providers/debug-device", "tests/e2e/fixtures/raw"];

/** Strategy flags are irrelevant to shape; ads stay in so ids can be checked dense. */
const TAG_ID = "fixture-drift-guard";

describe("committed feed fixtures", () => {
  for (const dir of FIXTURE_DIRS) {
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".feed.json"))) {
      it(`${dir}/${file} normalises to renderable slides`, () => {
        const raw = JSON.parse(readFileSync(`${dir}/${file}`, "utf8")) as { data?: { reels?: unknown } };
        expect(Array.isArray(raw.data?.reels)).toBe(true);

        const entries = normaliseFeed(raw.data!.reels as Reel[], TAG_ID, false, false, false);
        expect(entries.length).toBeGreaterThan(0);
        // Ids must be dense — they are React keys and drive `position_index`.
        expect(entries.map((entry) => entry.data.id)).toEqual(entries.map((_, index) => index));
        // Every entry must land on a kind the feed knows how to render.
        for (const entry of entries) {
          expect(["video", "video-with-ad", "ad"]).toContain(entry.kind);
        }
      });
    }
  }
});
