import { describe, expect, it } from "vitest";

import {
  layoutNodeSchema,
  pageSchema,
  slotKindSchema,
  slotNodeSchema,
  slotStyleSchema,
  uiNodeSchema,
} from "./schema";

describe("slotKindSchema", () => {
  it("accepts the three canonical kinds", () => {
    for (const kind of ["content", "video", "linkout"] as const) {
      expect(slotKindSchema.parse(kind)).toBe(kind);
    }
  });

  it("rejects unknown kinds", () => {
    expect(slotKindSchema.safeParse("ai-response").success).toBe(false);
    expect(slotKindSchema.safeParse("").success).toBe(false);
  });
});

describe("slotStyleSchema", () => {
  it("accepts single / feed / grid / carousel", () => {
    for (const style of ["single", "feed", "grid", "carousel"] as const) {
      expect(slotStyleSchema.parse(style)).toBe(style);
    }
  });

  it("rejects unknown styles", () => {
    expect(slotStyleSchema.safeParse("masonry").success).toBe(false);
  });
});

describe("uiNodeSchema / slotNodeSchema", () => {
  it("parses a minimal UI node", () => {
    const node = uiNodeSchema.parse({ type: "ui", uiVariant: "row" });
    expect(node.type).toBe("ui");
    expect(node.uiVariant).toBe("row");
  });

  it("parses a minimal slot node with required `kind`", () => {
    const node = slotNodeSchema.parse({
      type: "slot",
      name: "main-video",
      kind: "video",
    });
    expect(node.kind).toBe("video");
    expect(node.name).toBe("main-video");
  });

  it("rejects a slot node missing `name`", () => {
    expect(
      slotNodeSchema.safeParse({ type: "slot", kind: "content" }).success,
    ).toBe(false);
  });

  it("accepts density: 'compact'", () => {
    const node = slotNodeSchema.parse({
      type: "slot",
      name: "rail-tiles",
      kind: "linkout",
      density: "compact",
    });
    expect(node.density).toBe("compact");
  });

  it("accepts density: 'default'", () => {
    const node = slotNodeSchema.parse({
      type: "slot",
      name: "rail-tiles",
      kind: "linkout",
      density: "default",
    });
    expect(node.density).toBe("default");
  });

  it("accepts a slot node without density (optional)", () => {
    const node = slotNodeSchema.parse({
      type: "slot",
      name: "rail-tiles",
      kind: "linkout",
    });
    expect(node.density).toBeUndefined();
  });

  it("rejects density values outside the enum (e.g. 'spacious')", () => {
    expect(
      slotNodeSchema.safeParse({
        type: "slot",
        name: "rail-tiles",
        kind: "linkout",
        density: "spacious",
      }).success,
    ).toBe(false);
  });

  it("accepts size: 'compact' | 'default' | 'hero'", () => {
    for (const size of ["compact", "default", "hero"] as const) {
      const node = slotNodeSchema.parse({
        type: "slot",
        name: "hero-carousel",
        kind: "video",
        style: "carousel",
        cols: 3,
        size,
      });
      expect(node.size).toBe(size);
    }
  });

  it("accepts a slot node without size (optional)", () => {
    const node = slotNodeSchema.parse({
      type: "slot",
      name: "hero-carousel",
      kind: "video",
      style: "carousel",
      cols: 3,
    });
    expect(node.size).toBeUndefined();
  });

  it("rejects size values outside the enum (e.g. 'small')", () => {
    expect(
      slotNodeSchema.safeParse({
        type: "slot",
        name: "hero-carousel",
        kind: "video",
        style: "carousel",
        cols: 3,
        size: "small",
      }).success,
    ).toBe(false);
  });
});

describe("layoutNodeSchema — discriminated union", () => {
  it("walks a nested UI tree containing a slot leaf", () => {
    const tree = layoutNodeSchema.parse({
      type: "ui",
      uiVariant: "column",
      props: { gap: "md" },
      children: [
        { type: "ui", uiVariant: "heading", props: { level: "h1" } },
        { type: "slot", name: "body", kind: "content", sticky: false },
      ],
    });
    expect(tree.type).toBe("ui");
    if (tree.type !== "ui") throw new Error("expected ui root");
    expect(tree.children).toHaveLength(2);
  });

  it("rejects a node with an unknown discriminator", () => {
    expect(
      layoutNodeSchema.safeParse({ type: "garbage", uiVariant: "x" }).success,
    ).toBe(false);
  });
});

describe("pageSchema", () => {
  it("parses a single-breakpoint page", () => {
    const page = pageSchema.parse({
      id: "page-1",
      version: "2025.05",
      breakpoints: [
        {
          id: "bp-0",
          minWidth: 0,
          root: { type: "ui", uiVariant: "container" },
        },
      ],
    });
    expect(page.id).toBe("page-1");
    expect(page.breakpoints).toHaveLength(1);
  });

  it("requires at least one breakpoint", () => {
    expect(
      pageSchema.safeParse({ id: "p", breakpoints: [] }).success,
    ).toBe(false);
  });

  it("requires a non-empty page id", () => {
    expect(
      pageSchema.safeParse({
        id: "",
        breakpoints: [
          { id: "bp-0", minWidth: 0, root: { type: "ui", uiVariant: "row" } },
        ],
      }).success,
    ).toBe(false);
  });
});
