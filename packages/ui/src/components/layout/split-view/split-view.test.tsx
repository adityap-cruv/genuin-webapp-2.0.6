import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { GAP_CLASS } from "../tokens";

import { SplitView } from "./split-view";

describe("SplitView", () => {
  it("renders a <div> with the base grid class and default align", () => {
    const { getByTestId } = render(
      <SplitView data-testid="sv" tracks={2}>
        x
      </SplitView>
    );
    const el = getByTestId("sv");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gencl:grid", "gencl:items-stretch");
    expect(el).toHaveAttribute("data-slot", "layout-split-view");
  });

  it("maps a numeric tracks value to repeat(N, minmax(0, 1fr))", () => {
    const { getByTestId } = render(
      <SplitView data-testid="sv" tracks={3}>
        x
      </SplitView>
    );
    expect(getByTestId("sv").style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("maps an array tracks value to a px-joined string", () => {
    const { getByTestId } = render(
      <SplitView data-testid="sv" tracks={[746, 320]}>
        x
      </SplitView>
    );
    expect(getByTestId("sv").style.gridTemplateColumns).toBe("746px 320px");
  });

  it("maps a string tracks value through verbatim", () => {
    const { getByTestId } = render(
      <SplitView data-testid="sv" tracks="2fr 1fr">
        x
      </SplitView>
    );
    expect(getByTestId("sv").style.gridTemplateColumns).toBe("2fr 1fr");
  });

  it("applies gap from GAP_CLASS", () => {
    const { getByTestId } = render(
      <SplitView data-testid="sv" tracks={2} gap="lg">
        x
      </SplitView>
    );
    expect(getByTestId("sv")).toHaveClass(GAP_CLASS.lg);
  });

  const aligns = [
    ["start", "gencl:items-start"],
    ["center", "gencl:items-center"],
    ["end", "gencl:items-end"],
    ["stretch", "gencl:items-stretch"],
  ] as const;

  aligns.forEach(([value, expected]) => {
    it(`maps align="${value}" to ${expected}`, () => {
      const { getByTestId } = render(
        <SplitView data-testid="sv" tracks={2} align={value}>
          x
        </SplitView>
      );
      expect(getByTestId("sv")).toHaveClass(expected);
    });
  });

  it("preserves a caller-provided style alongside resolved tracks", () => {
    const { getByTestId } = render(
      <SplitView data-testid="sv" tracks={[100, 200]} style={{ background: "rgb(0, 0, 0)" }}>
        x
      </SplitView>
    );
    const el = getByTestId("sv");
    expect(el.style.gridTemplateColumns).toBe("100px 200px");
    expect(el.style.background).toBe("rgb(0, 0, 0)");
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <SplitView asChild tracks={2}>
        <section data-testid="sv-section">x</section>
      </SplitView>
    );
    const el = getByTestId("sv-section");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveClass("gencl:grid");
  });

  it("merges a custom className", () => {
    const { getByTestId } = render(
      <SplitView data-testid="sv" tracks={2} className="custom-class">
        x
      </SplitView>
    );
    expect(getByTestId("sv")).toHaveClass("custom-class");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SplitView ref={ref} data-testid="sv" tracks={2}>
        x
      </SplitView>
    );
    expect(ref.current).not.toBeNull();
  });
});
