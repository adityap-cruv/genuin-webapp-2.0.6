import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { GAP_CLASS, type DsSpace } from "../tokens";

import { Stack } from "./stack";

describe("Stack", () => {
  it("renders a <div> with base flex-col classes and default gap", () => {
    const { getByTestId } = render(<Stack data-testid="stack">child</Stack>);
    const el = getByTestId("stack");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gencl:flex", "gencl:flex-col");
    // default gap = "md"
    expect(el).toHaveClass(GAP_CLASS.md);
    expect(el).toHaveAttribute("data-slot", "layout-stack");
  });

  const tokens: DsSpace[] = ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"];

  tokens.forEach((token) => {
    it(`maps gap="${token}" to ${GAP_CLASS[token]}`, () => {
      const { getByTestId } = render(
        <Stack data-testid="stack" gap={token}>
          x
        </Stack>
      );
      expect(getByTestId("stack")).toHaveClass(GAP_CLASS[token]);
    });
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Stack asChild>
        <section data-testid="stack-section">x</section>
      </Stack>
    );
    const el = getByTestId("stack-section");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveAttribute("data-slot", "layout-stack");
    expect(el).toHaveClass("gencl:flex", "gencl:flex-col");
  });

  it("merges a custom className", () => {
    const { getByTestId } = render(
      <Stack data-testid="stack" className="custom-class">
        x
      </Stack>
    );
    const el = getByTestId("stack");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("gencl:flex");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stack ref={ref} data-testid="stack">
        x
      </Stack>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("applies inline minHeight 180px when minHeight='sm'", () => {
    const { getByTestId } = render(
      <Stack data-testid="stack" minHeight="sm">
        x
      </Stack>
    );
    const el = getByTestId("stack");
    expect(el.style.minHeight).toBe("180px");
    expect(el.getAttribute("data-min-height")).toBe("sm");
  });

  it("applies inline minHeight 420px when minHeight='lg'", () => {
    const { getByTestId } = render(
      <Stack data-testid="stack" minHeight="lg">
        x
      </Stack>
    );
    expect(getByTestId("stack").style.minHeight).toBe("420px");
  });

  it("emits no inline minHeight when minHeight is omitted", () => {
    const { getByTestId } = render(<Stack data-testid="stack">x</Stack>);
    expect(getByTestId("stack").style.minHeight).toBe("");
  });

  it("applies inline height 600px when height='hero'", () => {
    const { getByTestId } = render(
      <Stack data-testid="stack" height="hero">
        x
      </Stack>
    );
    expect(getByTestId("stack").style.height).toBe("600px");
    expect(getByTestId("stack").getAttribute("data-height")).toBe("hero");
  });

  it("maps height='full-bleed' to 100vh on Stack (no max-width override)", () => {
    const { getByTestId } = render(
      <Stack data-testid="stack" height="full-bleed">
        x
      </Stack>
    );
    const el = getByTestId("stack");
    expect(el.style.height).toBe("100vh");
    expect(el.style.maxWidth).toBe("");
  });
});
