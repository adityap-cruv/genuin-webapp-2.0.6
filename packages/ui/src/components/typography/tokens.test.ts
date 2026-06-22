import {
  ALIGN_CLASS,
  HEADING_DEFAULT_AS,
  HEADING_DEFAULT_WEIGHT,
  HEADING_LEVEL_CLASS,
  TEXT_DEFAULT_WEIGHT,
  TEXT_SIZE_CLASS,
  WEIGHT_CLASS,
  type HeadingLevel,
  type TextSize,
  type TypographyWeight,
} from "./tokens";

/**
 * Guard rails against silent drift of the DS typography token maps.
 * If a level / size / weight is accidentally deleted or remapped to
 * an empty / wrong class, these tests catch it before the primitives
 * ship to consumers.
 */

const ALL_LEVELS: HeadingLevel[] = [
  "h1",
  "h2",
  "h3",
  "headline-0",
  "headline-1",
  "headline-2",
  "headline-3",
  "headline-4",
];

const ALL_SIZES: TextSize[] = ["body-0", "body-1", "body-2", "body-3", "body-4"];

const ALL_WEIGHTS: TypographyWeight[] = ["medium", "semibold", "bold"];

describe("typography/tokens", () => {
  it.each(ALL_LEVELS)("HEADING_LEVEL_CLASS[%s] is a non-empty gencl: text class", (level) => {
    const value = HEADING_LEVEL_CLASS[level];
    expect(value).toBeTruthy();
    expect(value).toMatch(/gencl:text-\[/);
    expect(value).toMatch(/gencl:leading-\[/);
  });

  it.each(ALL_SIZES)("TEXT_SIZE_CLASS[%s] is a non-empty gencl: text class", (size) => {
    const value = TEXT_SIZE_CLASS[size];
    expect(value).toBeTruthy();
    expect(value).toMatch(/gencl:text-\[/);
    expect(value).toMatch(/gencl:leading-\[/);
  });

  it.each(ALL_WEIGHTS)("WEIGHT_CLASS[%s] is a non-empty gencl: font class", (weight) => {
    const value = WEIGHT_CLASS[weight];
    expect(value).toBeTruthy();
    expect(value).toMatch(/^gencl:font-/);
  });

  it.each(ALL_LEVELS)("HEADING_DEFAULT_WEIGHT[%s] is a valid weight token", (level) => {
    const weight = HEADING_DEFAULT_WEIGHT[level];
    expect(ALL_WEIGHTS).toContain(weight);
  });

  it.each(ALL_SIZES)("TEXT_DEFAULT_WEIGHT[%s] is a valid weight token", (size) => {
    const weight = TEXT_DEFAULT_WEIGHT[size];
    expect(ALL_WEIGHTS).toContain(weight);
  });

  it.each(ALL_LEVELS)("HEADING_DEFAULT_AS[%s] is a valid heading tag", (level) => {
    const tag = HEADING_DEFAULT_AS[level];
    expect(["h1", "h2", "h3", "h4", "h5"]).toContain(tag);
  });

  it("HEADING_LEVEL_CLASS pixel values match the Figma DS scale", () => {
    // Cross-check against Figma node 1821:46389. If any of these
    // shift, update the spec — don't silently follow.
    expect(HEADING_LEVEL_CLASS.h1).toBe("gencl:text-[100px] gencl:leading-[100px] gencl:tracking-[-0.2px]");
    expect(HEADING_LEVEL_CLASS.h2).toBe("gencl:text-[64px] gencl:leading-[72px] gencl:tracking-[-0.2px]");
    expect(HEADING_LEVEL_CLASS.h3).toBe("gencl:text-[48px] gencl:leading-[56px] gencl:tracking-[-0.2px]");
    expect(HEADING_LEVEL_CLASS["headline-0"]).toBe("gencl:text-[72px] gencl:leading-[76px]");
    expect(HEADING_LEVEL_CLASS["headline-1"]).toBe("gencl:text-[36px] gencl:leading-[44px] gencl:tracking-[-0.2px]");
    expect(HEADING_LEVEL_CLASS["headline-2"]).toBe("gencl:text-[32px] gencl:leading-[36px] gencl:tracking-[-0.2px]");
    expect(HEADING_LEVEL_CLASS["headline-3"]).toBe("gencl:text-[24px] gencl:leading-[28px] gencl:tracking-[-0.1px]");
    expect(HEADING_LEVEL_CLASS["headline-4"]).toBe("gencl:text-[20px] gencl:leading-[24px]");
  });

  it("TEXT_SIZE_CLASS pixel values match the Figma DS scale", () => {
    expect(TEXT_SIZE_CLASS["body-0"]).toBe("gencl:text-[16px] gencl:leading-[22px]");
    expect(TEXT_SIZE_CLASS["body-1"]).toBe("gencl:text-[14px] gencl:leading-[20px]");
    expect(TEXT_SIZE_CLASS["body-2"]).toBe("gencl:text-[12px] gencl:leading-[16px]");
    expect(TEXT_SIZE_CLASS["body-3"]).toBe("gencl:text-[10px] gencl:leading-[14px]");
    expect(TEXT_SIZE_CLASS["body-4"]).toBe("gencl:text-[8px] gencl:leading-[12px]");
  });

  it("WEIGHT_CLASS maps weight tokens to the right Tailwind classes", () => {
    expect(WEIGHT_CLASS.medium).toBe("gencl:font-medium");
    expect(WEIGHT_CLASS.semibold).toBe("gencl:font-semibold");
    expect(WEIGHT_CLASS.bold).toBe("gencl:font-bold");
  });

  it("HEADING_DEFAULT_WEIGHT matches the canonical Figma defaults", () => {
    expect(HEADING_DEFAULT_WEIGHT.h1).toBe("bold");
    expect(HEADING_DEFAULT_WEIGHT.h2).toBe("semibold");
    expect(HEADING_DEFAULT_WEIGHT.h3).toBe("semibold");
    expect(HEADING_DEFAULT_WEIGHT["headline-0"]).toBe("bold");
    expect(HEADING_DEFAULT_WEIGHT["headline-1"]).toBe("semibold");
    expect(HEADING_DEFAULT_WEIGHT["headline-2"]).toBe("semibold");
    expect(HEADING_DEFAULT_WEIGHT["headline-3"]).toBe("semibold");
    expect(HEADING_DEFAULT_WEIGHT["headline-4"]).toBe("semibold");
  });

  it("TEXT_DEFAULT_WEIGHT matches the canonical Figma defaults", () => {
    expect(TEXT_DEFAULT_WEIGHT["body-0"]).toBe("semibold");
    expect(TEXT_DEFAULT_WEIGHT["body-1"]).toBe("medium");
    expect(TEXT_DEFAULT_WEIGHT["body-2"]).toBe("medium");
    expect(TEXT_DEFAULT_WEIGHT["body-3"]).toBe("medium");
    expect(TEXT_DEFAULT_WEIGHT["body-4"]).toBe("medium");
  });

  it("HEADING_DEFAULT_AS maps levels to the right semantic tag", () => {
    expect(HEADING_DEFAULT_AS.h1).toBe("h1");
    expect(HEADING_DEFAULT_AS["headline-0"]).toBe("h1");
    expect(HEADING_DEFAULT_AS.h2).toBe("h2");
    expect(HEADING_DEFAULT_AS["headline-1"]).toBe("h2");
    expect(HEADING_DEFAULT_AS.h3).toBe("h3");
    expect(HEADING_DEFAULT_AS["headline-2"]).toBe("h3");
    expect(HEADING_DEFAULT_AS["headline-3"]).toBe("h4");
    expect(HEADING_DEFAULT_AS["headline-4"]).toBe("h5");
  });

  it("ALIGN_CLASS maps alignment tokens to the right Tailwind classes", () => {
    expect(ALIGN_CLASS.left).toBe("");
    expect(ALIGN_CLASS.center).toBe("gencl:text-center");
    expect(ALIGN_CLASS.right).toBe("gencl:text-right");
  });
});
