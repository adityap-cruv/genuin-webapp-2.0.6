import { COL_GAP_CLASS, GAP_CLASS, MAX_W_CLASS, PX_CLASS, ROW_GAP_CLASS, isNamedMaxW, type DsSpace } from "./tokens";

/**
 * Guard rails against silent drift of the DS token maps. If a token is
 * accidentally deleted or remapped to an empty / wrong class, these
 * tests catch it before the primitives ship.
 */

describe("layout/tokens", () => {
  const ALL_SPACE_TOKENS: DsSpace[] = ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"];

  it.each(ALL_SPACE_TOKENS)("GAP_CLASS[%s] is a non-empty gencl: gap class", (token) => {
    const value = GAP_CLASS[token];
    expect(value).toMatch(/^gencl:gap-/);
  });

  it.each(ALL_SPACE_TOKENS)("COL_GAP_CLASS[%s] is a non-empty gencl: gap-x class", (token) => {
    const value = COL_GAP_CLASS[token];
    expect(value).toMatch(/^gencl:gap-x-/);
  });

  it.each(ALL_SPACE_TOKENS)("ROW_GAP_CLASS[%s] is a non-empty gencl: gap-y class", (token) => {
    const value = ROW_GAP_CLASS[token];
    expect(value).toMatch(/^gencl:gap-y-/);
  });

  it.each(ALL_SPACE_TOKENS)("PX_CLASS[%s] is a non-empty gencl: px class", (token) => {
    const value = PX_CLASS[token];
    expect(value).toMatch(/^gencl:px-/);
  });

  it("GAP_CLASS pixel ladder matches the DS Padding scale", () => {
    // Pixel-value cross-check against the Figma DS Padding scale
    // (node 6162:726). Tailwind units: 1=4px, 2=8px, 3=12px, 4=16px,
    // 5=20px, 6=24px, 8=32px, 10=40px.
    expect(GAP_CLASS.none).toBe("gencl:gap-0");
    expect(GAP_CLASS.xxs).toBe("gencl:gap-1");
    expect(GAP_CLASS.xs).toBe("gencl:gap-2");
    expect(GAP_CLASS.sm).toBe("gencl:gap-3");
    expect(GAP_CLASS.md).toBe("gencl:gap-4");
    expect(GAP_CLASS.ml).toBe("gencl:gap-5");
    expect(GAP_CLASS.lg).toBe("gencl:gap-6");
    expect(GAP_CLASS.xl).toBe("gencl:gap-8");
    expect(GAP_CLASS.xxl).toBe("gencl:gap-10");
  });

  it("MAX_W_CLASS covers every named breakpoint token", () => {
    expect(MAX_W_CLASS.mobile).toBe("gencl:max-w-[420px]");
    expect(MAX_W_CLASS["tablet-sm"]).toBe("gencl:max-w-[748px]");
    expect(MAX_W_CLASS.tablet).toBe("gencl:max-w-[1024px]");
    expect(MAX_W_CLASS.desktop).toBe("gencl:max-w-[1280px]");
    expect(MAX_W_CLASS["desktop-wide"]).toBe("gencl:max-w-[1512px]");
    expect(MAX_W_CLASS.full).toBe("gencl:max-w-full");
  });

  describe("isNamedMaxW", () => {
    it("returns true for every named token in MAX_W_CLASS", () => {
      for (const name of Object.keys(MAX_W_CLASS)) {
        expect(isNamedMaxW(name)).toBe(true);
      }
    });

    it("returns false for raw escape-hatch strings", () => {
      expect(isNamedMaxW("960px")).toBe(false);
      expect(isNamedMaxW("100%")).toBe(false);
      expect(isNamedMaxW("")).toBe(false);
    });
  });
});
