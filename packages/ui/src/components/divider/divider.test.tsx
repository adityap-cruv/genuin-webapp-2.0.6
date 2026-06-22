import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { Divider, type DividerTone, type DividerInset } from "./divider";

describe("Divider", () => {
  it("renders a horizontal <div> separator with default tone and base classes", () => {
    const { getByTestId } = render(<Divider data-testid="d" />);
    const el = getByTestId("d");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveAttribute("role", "separator");
    expect(el).toHaveAttribute("aria-orientation", "horizontal");
    expect(el).toHaveAttribute("data-slot", "divider");
    expect(el).toHaveClass("gencl:h-px", "gencl:w-full", "gencl:bg-secondary-150");
  });

  it("renders a vertical separator with vertical base classes and aria-orientation", () => {
    const { getByTestId } = render(<Divider data-testid="d" orientation="vertical" />);
    const el = getByTestId("d");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
    expect(el).toHaveClass("gencl:w-px", "gencl:h-full");
    expect(el).not.toHaveClass("gencl:h-px");
  });

  const tones: Array<{ tone: DividerTone; cls: string }> = [
    { tone: "subtle", cls: "gencl:bg-secondary-100" },
    { tone: "default", cls: "gencl:bg-secondary-150" },
    { tone: "strong", cls: "gencl:bg-secondary-300" },
  ];

  tones.forEach(({ tone, cls }) => {
    it(`maps tone="${tone}" to ${cls}`, () => {
      const { getByTestId } = render(<Divider data-testid="d" tone={tone} />);
      expect(getByTestId("d")).toHaveClass(cls);
    });
  });

  const insets: Array<{ inset: DividerInset; cls: string | null }> = [
    { inset: "none", cls: null },
    { inset: "sm", cls: "gencl:mx-2" },
    { inset: "md", cls: "gencl:mx-4" },
    { inset: "lg", cls: "gencl:mx-6" },
  ];

  insets.forEach(({ inset, cls }) => {
    it(`maps horizontal inset="${inset}" to ${cls ?? "no class"}`, () => {
      const { getByTestId } = render(<Divider data-testid="d" inset={inset} />);
      const el = getByTestId("d");
      if (cls) {
        expect(el).toHaveClass(cls);
      } else {
        expect(el.className).not.toMatch(/gencl:mx-/);
      }
    });
  });

  it("ignores `inset` when orientation is vertical", () => {
    const { getByTestId } = render(<Divider data-testid="d" orientation="vertical" inset="lg" />);
    const el = getByTestId("d");
    expect(el.className).not.toMatch(/gencl:mx-/);
  });

  it("supports asChild polymorphism (renders as <hr>)", () => {
    const { getByTestId } = render(
      <Divider asChild>
        <hr data-testid="hr" />
      </Divider>
    );
    const el = getByTestId("hr");
    expect(el.tagName).toBe("HR");
    expect(el).toHaveAttribute("data-slot", "divider");
    expect(el).toHaveAttribute("role", "separator");
    expect(el).toHaveClass("gencl:h-px", "gencl:w-full");
  });

  it("merges a custom className without overriding base classes", () => {
    const { getByTestId } = render(<Divider data-testid="d" className="custom-class" />);
    const el = getByTestId("d");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("gencl:h-px");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Divider ref={ref} data-testid="d" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
  });
});
