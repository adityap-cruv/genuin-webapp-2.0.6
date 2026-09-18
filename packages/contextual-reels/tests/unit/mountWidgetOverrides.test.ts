/**
 * Guards `applyTagOverrides` in the E2E harness (`tests/e2e/support/mountWidget.ts`).
 *
 * Unit-tested rather than trusted because L2-PRECEDENCE — the E2E coverage of the L2
 * Octo path — depends on this patch landing in the right place. A silent break
 * would make that spec assert against an unpatched tag without failing loudly.
 */
import { describe, it, expect } from "vitest";

import { applyTagOverrides } from "../e2e/support/mountWidget";

/** The one override the suite actually uses today (L2-PRECEDENCE). */
const GENAI_ON = { config: { enable_ask_question: true } };

/**
 * A captured tag body, trimmed to the fields these tests touch. Today's
 * `/ad_creative` response puts the tag fields directly on `data`.
 */
function tagBody(config: Record<string, unknown> = {}): string {
  return JSON.stringify({ code: 200, data: { tag_id: "tag-1", brand_id: 3252, config } });
}

/** Read the patched tag object back out of a serialised body. */
function tagOf(body: string): Record<string, unknown> {
  return JSON.parse(body).data;
}

describe("applyTagOverrides", () => {
  it("adds the flag to a tag whose config lacks it", () => {
    const tag = tagOf(applyTagOverrides(tagBody(), GENAI_ON));
    expect(tag.config).toEqual({ enable_ask_question: true });
  });

  // The captured QA tags all ship `enable_ask_question: false` — overriding that is
  // the whole point of the hook.
  it("overrides a value the fixture already sends", () => {
    const tag = tagOf(applyTagOverrides(tagBody({ enable_ask_question: false }), GENAI_ON));
    expect((tag.config as { enable_ask_question: boolean }).enable_ask_question).toBe(true);
  });

  it("merges rather than replaces — sibling config survives the patch", () => {
    const body = tagBody({
      enable_ask_question: false,
      show_cta: true,
      on_click: "fullscreen",
    });
    const config = tagOf(applyTagOverrides(body, GENAI_ON)).config as Record<string, unknown>;

    expect(config.enable_ask_question).toBe(true);
    expect(config.show_cta).toBe(true);
    expect(config.on_click).toBe("fullscreen");
  });

  it("leaves fields outside `config` untouched", () => {
    const tag = tagOf(applyTagOverrides(tagBody(), GENAI_ON));
    expect(tag.tag_id).toBe("tag-1");
    expect(tag.brand_id).toBe(3252);
  });

  // Forward compatibility: the feed-API-v2 work nests the tag under
  // `data.iab_standard_tag`. No fixture here has that shape yet, so the branch is
  // pinned by a test rather than by usage.
  it("patches the nested v2 shape when `iab_standard_tag` is present", () => {
    const body = JSON.stringify({
      code: 200,
      data: { iab_standard_tag: { id: "tag-1", config: { enable_ask_question: false } } },
    });
    const tag = JSON.parse(applyTagOverrides(body, GENAI_ON)).data.iab_standard_tag;
    expect(tag.config).toEqual({ enable_ask_question: true });
    expect(tag.id).toBe("tag-1");
  });

  it("throws on a body with no `data` object rather than serving it silently", () => {
    expect(() => applyTagOverrides(JSON.stringify({ code: 500 }), GENAI_ON)).toThrow(/no `data`/);
  });
});
