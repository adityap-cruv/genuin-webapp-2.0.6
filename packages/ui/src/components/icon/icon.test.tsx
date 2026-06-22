import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { Icon, type IconName, type IconSize, type IconTone } from "./icon";

describe("Icon", () => {
  it("renders an SVG with default size, tone (currentColor) and aria-label", () => {
    const { container } = render(<Icon name="check" aria-label="Done" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.tagName.toLowerCase()).toBe("svg");
    expect(svg).toHaveAttribute("data-slot", "icon");
    expect(svg).toHaveAttribute("data-icon-name", "check");
    expect(svg).toHaveAttribute("aria-label", "Done");
    expect(svg).toHaveAttribute("role", "img");
    // default size = "md" → 16
    expect(svg?.getAttribute("width")).toBe("16");
    expect(svg?.getAttribute("height")).toBe("16");
    // currentColor tone applies no class
    expect(svg?.className.baseVal ?? svg?.getAttribute("class") ?? "").not.toMatch(/text-/);
  });

  it("marks the icon as decorative when aria-label is empty", () => {
    const { container } = render(<Icon name="x" aria-label="" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("aria-label");
    expect(svg).not.toHaveAttribute("role");
  });

  // Smoke check a representative spread of names so a typo in the
  // lookup map gets caught without rendering all 28.
  const SAMPLE_NAMES: IconName[] = [
    "arrow-right",
    "chevron-down",
    "check",
    "x",
    "search",
    "heart",
    "external-link",
    "link",
    "play",
    "alert-circle",
  ];

  SAMPLE_NAMES.forEach((name) => {
    it(`renders an SVG for name="${name}"`, () => {
      const { container } = render(<Icon name={name} aria-label={name} />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("data-icon-name", name);
    });
  });

  const SIZES: Array<{ size: IconSize; px: string }> = [
    { size: "xs", px: "12" },
    { size: "sm", px: "14" },
    { size: "md", px: "16" },
    { size: "lg", px: "20" },
    { size: "xl", px: "24" },
  ];

  SIZES.forEach(({ size, px }) => {
    it(`maps size="${size}" to ${px}px`, () => {
      const { container } = render(<Icon name="check" size={size} aria-label="ok" />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("width")).toBe(px);
      expect(svg?.getAttribute("height")).toBe(px);
    });
  });

  const TONES: Array<{ tone: IconTone; cls: string | null }> = [
    { tone: "currentColor", cls: null },
    { tone: "default", cls: "gencl:text-secondary-900" },
    { tone: "subtle", cls: "gencl:text-secondary-600" },
    { tone: "inverted", cls: "gencl:text-white" },
  ];

  TONES.forEach(({ tone, cls }) => {
    it(`maps tone="${tone}" to ${cls ?? "no class"}`, () => {
      const { container } = render(<Icon name="check" tone={tone} aria-label="ok" />);
      const svg = container.querySelector("svg");
      const cn = svg?.getAttribute("class") ?? "";
      if (cls) {
        expect(cn).toContain(cls);
      } else {
        expect(cn).not.toMatch(/gencl:text-/);
      }
    });
  });

  it("merges a custom className with the tone class", () => {
    const { container } = render(<Icon name="check" tone="default" className="custom-class" aria-label="ok" />);
    const svg = container.querySelector("svg");
    const cn = svg?.getAttribute("class") ?? "";
    expect(cn).toContain("custom-class");
    expect(cn).toContain("gencl:text-secondary-900");
  });

  it("forwards ref to the underlying svg", () => {
    const ref = createRef<SVGSVGElement>();
    render(<Icon ref={ref} name="check" aria-label="ok" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe("svg");
  });
});
