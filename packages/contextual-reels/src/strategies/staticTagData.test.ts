/**
 * Tests for the per-tag static AD-only data registry.
 */
import { describe, it, expect } from "vitest";

import { getStaticTagData, isStaticTag, STATIC_TAG_IDS, toEntry } from "@cxr/strategies/staticTagData";
import { resolveStrategies } from "@cxr/strategies/strategies";
import { TAG_STRATEGIES } from "@cxr/strategies/strategyConfig";

describe("getStaticTagData", () => {
  it("resolves the entry for a static tag with its own tag_id + feed", async () => {
    const entry = await getStaticTagData("6a39163e92929ebec64d78ab");
    expect(entry).toBeDefined();
    expect(entry!.tagConfig.tag_id).toBe("6a39163e92929ebec64d78ab");
    // tag_name is not on the typed TagResponse subset — read it off the raw fixture.
    expect((entry!.tagConfig as { tag_name?: string }).tag_name).toBe("320x50-ads-only");
    expect(Array.isArray(entry!.feed)).toBe(true);
    expect(entry!.feed.length).toBeGreaterThan(0);
    // No visitId on the entry — FeedProvider generates a fresh one per load.
    expect(entry as { visitId?: unknown }).not.toHaveProperty("visitId");
  });

  it("serves distinct data per tag", async () => {
    const a = await getStaticTagData("6a39163e92929ebec64d78ab");
    const b = await getStaticTagData("6a3915b692929ebec64d785e");
    expect(a!.tagConfig.tag_id).not.toBe(b!.tagConfig.tag_id);
    expect((b!.tagConfig as { tag_name?: string }).tag_name).toBe("320x100-ads-only");
  });

  it("resolves the 320x480 tag (6a6892e) from its own fixtures", async () => {
    const entry = await getStaticTagData("6a6892e52ca77d200369fb9e");
    expect(entry).toBeDefined();
    expect(entry!.tagConfig.tag_id).toBe("6a6892e52ca77d200369fb9e");
    expect((entry!.tagConfig as { tag_name?: string }).tag_name).toBe("320x480-ads-only");
    expect(entry!.feed.length).toBeGreaterThan(0);
  });

  it("resolves the QA tag (6a3aa78) from its own fixtures", async () => {
    const entry = await getStaticTagData("6a3aa78ba0daccfd439648b8");
    expect(entry).toBeDefined();
    expect(entry!.tagConfig.tag_id).toBe("6a3aa78ba0daccfd439648b8");
    expect(entry!.feed.length).toBeGreaterThan(0);
  });

  it("resolves undefined for a non-static tag", async () => {
    expect(await getStaticTagData("not-a-static-tag")).toBeUndefined();
  });

  it("drift guard: every servedStatically tag has a registry entry", () => {
    for (const tagId of Object.keys(TAG_STRATEGIES)) {
      if (resolveStrategies(tagId).servedStatically) {
        expect(STATIC_TAG_IDS.has(tagId), `missing STATIC_TAG_DATA for ${tagId}`).toBe(true);
      }
    }
  });

  it("reverse drift guard: every registered static tag resolves servedStatically", () => {
    // Catches an orphaned loader/fixture — a tag with static data whose strategy
    // config no longer flags it servedStatically (so it would never be served).
    for (const tagId of STATIC_TAG_IDS) {
      expect(
        resolveStrategies(tagId).servedStatically,
        `${tagId} has static data but does not resolve servedStatically`
      ).toBe(true);
    }
  });
});

describe("isStaticTag", () => {
  const registered = "6a39163e92929ebec64d78ab";

  it("is true only when the flag is set AND the tag is registered", () => {
    expect(isStaticTag(registered, true)).toBe(true);
  });

  it("is false when flagged but unregistered (half-static → treat as normal)", () => {
    expect(isStaticTag("not-a-registered-tag", true)).toBe(false);
  });

  it("is false when registered but the flag is off", () => {
    expect(isStaticTag(registered, false)).toBe(false);
  });

  it("is false for a null/undefined tagId", () => {
    expect(isStaticTag(null, true)).toBe(false);
    expect(isStaticTag(undefined, true)).toBe(false);
  });
});

describe("toEntry", () => {
  const wellFormedTag = { data: { tag_id: "t1" } };
  const wellFormedFeed = { data: { reels: [{ id: 1 }] } };

  it("unwraps .data from both envelopes for a well-formed fixture", () => {
    const entry = toEntry(wellFormedTag, wellFormedFeed);
    expect(entry).toEqual({ tagConfig: { tag_id: "t1" }, feed: [{ id: 1 }] });
  });

  it("returns undefined when the feed fixture is missing data.reels (config drift → API fallback)", () => {
    expect(toEntry(wellFormedTag, { data: {} })).toBeUndefined();
  });

  it("returns undefined when data.reels is not an array", () => {
    expect(toEntry(wellFormedTag, { data: { reels: "nope" } })).toBeUndefined();
  });

  it("returns undefined when the tag fixture is missing data", () => {
    expect(toEntry({}, wellFormedFeed)).toBeUndefined();
  });

  it("returns undefined for null/undefined envelopes", () => {
    expect(toEntry(null, wellFormedFeed)).toBeUndefined();
    expect(toEntry(wellFormedTag, undefined)).toBeUndefined();
  });
});
