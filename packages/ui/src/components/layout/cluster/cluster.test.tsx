import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { GAP_CLASS, type DsSpace } from "../tokens";

import { Cluster } from "./cluster";

describe("Cluster", () => {
  it("renders a <div> with base wrap-row classes and the defaults", () => {
    const { getByTestId } = render(<Cluster data-testid="cluster">x</Cluster>);
    const el = getByTestId("cluster");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gencl:flex", "gencl:flex-row", "gencl:flex-wrap");
    // default align = "center"
    expect(el).toHaveClass("gencl:items-center");
    // default gap = "xs"
    expect(el).toHaveClass(GAP_CLASS.xs);
    expect(el).toHaveAttribute("data-slot", "layout-cluster");
  });

  const tokens: DsSpace[] = ["none", "xxs", "xs", "sm", "md", "ml", "lg", "xl", "xxl"];

  tokens.forEach((token) => {
    it(`maps gap="${token}" to ${GAP_CLASS[token]}`, () => {
      const { getByTestId } = render(
        <Cluster data-testid="cluster" gap={token}>
          x
        </Cluster>
      );
      expect(getByTestId("cluster")).toHaveClass(GAP_CLASS[token]);
    });
  });

  const aligns = [
    ["start", "gencl:items-start"],
    ["center", "gencl:items-center"],
    ["end", "gencl:items-end"],
    ["baseline", "gencl:items-baseline"],
  ] as const;

  aligns.forEach(([value, expected]) => {
    it(`maps align="${value}" to ${expected}`, () => {
      const { getByTestId } = render(
        <Cluster data-testid="cluster" align={value}>
          x
        </Cluster>
      );
      expect(getByTestId("cluster")).toHaveClass(expected);
    });
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Cluster asChild>
        <ul data-testid="cluster-ul">x</ul>
      </Cluster>
    );
    const el = getByTestId("cluster-ul");
    expect(el.tagName).toBe("UL");
    expect(el).toHaveClass("gencl:flex-wrap");
  });

  it("merges a custom className", () => {
    const { getByTestId } = render(
      <Cluster data-testid="cluster" className="custom-class">
        x
      </Cluster>
    );
    expect(getByTestId("cluster")).toHaveClass("custom-class");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Cluster ref={ref} data-testid="cluster">
        x
      </Cluster>
    );
    expect(ref.current).not.toBeNull();
  });
});
