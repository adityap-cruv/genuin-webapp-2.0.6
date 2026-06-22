import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { GAP_CLASS, type DsSpace } from "../tokens";

import { Row } from "./row";

describe("Row", () => {
  it("renders a <div> with base flex-row classes and the defaults", () => {
    const { getByTestId } = render(<Row data-testid="row">child</Row>);
    const el = getByTestId("row");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gencl:flex", "gencl:flex-row");
    // defaults: align=stretch, justify=start, wrap=false
    expect(el).toHaveClass("gencl:items-stretch", "gencl:justify-start", "gencl:flex-nowrap");
    // default gap = "none"
    expect(el).toHaveClass(GAP_CLASS.none);
    expect(el).toHaveAttribute("data-slot", "layout-row");
  });

  const tokens: DsSpace[] = ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"];

  tokens.forEach((token) => {
    it(`maps gap="${token}" to ${GAP_CLASS[token]}`, () => {
      const { getByTestId } = render(
        <Row data-testid="row" gap={token}>
          x
        </Row>
      );
      expect(getByTestId("row")).toHaveClass(GAP_CLASS[token]);
    });
  });

  const aligns = [
    ["start", "gencl:items-start"],
    ["center", "gencl:items-center"],
    ["end", "gencl:items-end"],
    ["baseline", "gencl:items-baseline"],
    ["stretch", "gencl:items-stretch"],
  ] as const;

  aligns.forEach(([value, expected]) => {
    it(`maps align="${value}" to ${expected}`, () => {
      const { getByTestId } = render(
        <Row data-testid="row" align={value}>
          x
        </Row>
      );
      expect(getByTestId("row")).toHaveClass(expected);
    });
  });

  const justifies = [
    ["start", "gencl:justify-start"],
    ["center", "gencl:justify-center"],
    ["end", "gencl:justify-end"],
    ["between", "gencl:justify-between"],
    ["around", "gencl:justify-around"],
    ["evenly", "gencl:justify-evenly"],
  ] as const;

  justifies.forEach(([value, expected]) => {
    it(`maps justify="${value}" to ${expected}`, () => {
      const { getByTestId } = render(
        <Row data-testid="row" justify={value}>
          x
        </Row>
      );
      expect(getByTestId("row")).toHaveClass(expected);
    });
  });

  it("maps wrap={true} to flex-wrap", () => {
    const { getByTestId } = render(
      <Row data-testid="row" wrap>
        x
      </Row>
    );
    expect(getByTestId("row")).toHaveClass("gencl:flex-wrap");
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Row asChild>
        <section data-testid="row-section">x</section>
      </Row>
    );
    const el = getByTestId("row-section");
    expect(el.tagName).toBe("SECTION");
    expect(el).toHaveClass("gencl:flex", "gencl:flex-row");
  });

  it("merges a custom className", () => {
    const { getByTestId } = render(
      <Row data-testid="row" className="custom-class">
        x
      </Row>
    );
    expect(getByTestId("row")).toHaveClass("custom-class");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Row ref={ref} data-testid="row">
        x
      </Row>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
  });
});
