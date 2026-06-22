import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { GAP_CLASS, type DsSpace } from "../tokens";

import { Column } from "./column";

describe("Column", () => {
  it("renders a <div> with base flex-col classes and defaults", () => {
    const { getByTestId } = render(<Column data-testid="col">child</Column>);
    const el = getByTestId("col");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gencl:flex", "gencl:flex-col");
    expect(el).toHaveClass("gencl:items-stretch", "gencl:justify-start", "gencl:flex-nowrap");
    expect(el).toHaveClass(GAP_CLASS.none);
    expect(el).toHaveAttribute("data-slot", "layout-column");
  });

  const tokens: DsSpace[] = ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"];

  tokens.forEach((token) => {
    it(`maps gap="${token}" to ${GAP_CLASS[token]}`, () => {
      const { getByTestId } = render(
        <Column data-testid="col" gap={token}>
          x
        </Column>
      );
      expect(getByTestId("col")).toHaveClass(GAP_CLASS[token]);
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
        <Column data-testid="col" align={value}>
          x
        </Column>
      );
      expect(getByTestId("col")).toHaveClass(expected);
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
        <Column data-testid="col" justify={value}>
          x
        </Column>
      );
      expect(getByTestId("col")).toHaveClass(expected);
    });
  });

  it("maps wrap={true} to flex-wrap", () => {
    const { getByTestId } = render(
      <Column data-testid="col" wrap>
        x
      </Column>
    );
    expect(getByTestId("col")).toHaveClass("gencl:flex-wrap");
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Column asChild>
        <article data-testid="col-article">x</article>
      </Column>
    );
    const el = getByTestId("col-article");
    expect(el.tagName).toBe("ARTICLE");
    expect(el).toHaveClass("gencl:flex", "gencl:flex-col");
  });

  it("merges a custom className", () => {
    const { getByTestId } = render(
      <Column data-testid="col" className="custom-class">
        x
      </Column>
    );
    expect(getByTestId("col")).toHaveClass("custom-class");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Column ref={ref} data-testid="col">
        x
      </Column>
    );
    expect(ref.current).not.toBeNull();
  });
});
