import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import {
  HEADING_DEFAULT_AS,
  HEADING_DEFAULT_WEIGHT,
  HEADING_LEVEL_CLASS,
  WEIGHT_CLASS,
  type HeadingLevel,
  type TypographyWeight,
} from "../tokens";

import { Heading } from "./heading";

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

const ALL_WEIGHTS: TypographyWeight[] = ["medium", "semibold", "bold"];

describe("Heading", () => {
  it("renders the default level / weight / element / data-slot", () => {
    const { getByTestId } = render(<Heading data-testid="h">Title</Heading>);
    const el = getByTestId("h");
    // default level = "headline-2" → default `as` = h3
    expect(el.tagName).toBe("H3");
    expect(el).toHaveAttribute("data-slot", "heading");
    // headline-2 size classes
    HEADING_LEVEL_CLASS["headline-2"].split(" ").forEach((cls) => {
      expect(el).toHaveClass(cls);
    });
    // canonical default weight for headline-2 = semibold
    expect(el).toHaveClass(WEIGHT_CLASS.semibold);
  });

  describe.each(ALL_LEVELS)("level=%s", (level) => {
    it("applies the level's size + line-height + letter-spacing classes", () => {
      const { getByTestId } = render(
        <Heading data-testid="h" level={level}>
          Title
        </Heading>
      );
      const el = getByTestId("h");
      HEADING_LEVEL_CLASS[level].split(" ").forEach((cls) => {
        expect(el).toHaveClass(cls);
      });
    });

    it("falls back to the canonical default weight when weight is omitted", () => {
      const { getByTestId } = render(
        <Heading data-testid="h" level={level}>
          Title
        </Heading>
      );
      const el = getByTestId("h");
      expect(el).toHaveClass(WEIGHT_CLASS[HEADING_DEFAULT_WEIGHT[level]]);
    });

    it("falls back to the canonical default semantic element when as is omitted", () => {
      const { getByTestId } = render(
        <Heading data-testid="h" level={level}>
          Title
        </Heading>
      );
      const el = getByTestId("h");
      expect(el.tagName).toBe(HEADING_DEFAULT_AS[level].toUpperCase());
    });
  });

  describe.each(ALL_WEIGHTS)("weight=%s", (weight) => {
    it("applies the weight class", () => {
      const { getByTestId } = render(
        <Heading data-testid="h" weight={weight}>
          Title
        </Heading>
      );
      expect(getByTestId("h")).toHaveClass(WEIGHT_CLASS[weight]);
    });
  });

  it("respects the `as` override", () => {
    const { getByTestId } = render(
      <Heading data-testid="h" level="h1" as="h6">
        Title
      </Heading>
    );
    expect(getByTestId("h").tagName).toBe("H6");
  });

  it("applies align=center", () => {
    const { getByTestId } = render(
      <Heading data-testid="h" align="center">
        Title
      </Heading>
    );
    expect(getByTestId("h")).toHaveClass("gencl:text-center");
  });

  it("applies align=right", () => {
    const { getByTestId } = render(
      <Heading data-testid="h" align="right">
        Title
      </Heading>
    );
    expect(getByTestId("h")).toHaveClass("gencl:text-right");
  });

  it("does not add an alignment class for align=left (default)", () => {
    const { getByTestId } = render(<Heading data-testid="h">Title</Heading>);
    const el = getByTestId("h");
    expect(el).not.toHaveClass("gencl:text-center");
    expect(el).not.toHaveClass("gencl:text-right");
  });

  it("applies the ribbon decoration prefix bar", () => {
    const { getByTestId } = render(
      <Heading data-testid="h" decoration="ribbon">
        Title
      </Heading>
    );
    const el = getByTestId("h");
    // Ribbon adds the relative+padding wrapper plus a ::before bar.
    expect(el).toHaveClass("gencl:relative");
    expect(el).toHaveClass("gencl:pl-3");
    expect(el).toHaveClass("gencl:before:bg-primary");
    expect(el).toHaveClass("gencl:before:w-1");
  });

  it("does not add decoration classes when decoration is omitted", () => {
    const { getByTestId } = render(<Heading data-testid="h">Title</Heading>);
    const el = getByTestId("h");
    expect(el).not.toHaveClass("gencl:before:bg-primary");
    expect(el).not.toHaveClass("gencl:pl-3");
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Heading asChild level="headline-3">
        <a href="/somewhere" data-testid="link-heading">
          Linked title
        </a>
      </Heading>
    );
    const el = getByTestId("link-heading");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/somewhere");
    expect(el).toHaveAttribute("data-slot", "heading");
    HEADING_LEVEL_CLASS["headline-3"].split(" ").forEach((cls) => {
      expect(el).toHaveClass(cls);
    });
  });

  it("merges a custom className without overriding base classes", () => {
    const { getByTestId } = render(
      <Heading data-testid="h" className="custom-class" level="h2">
        Title
      </Heading>
    );
    const el = getByTestId("h");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("gencl:text-[64px]");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading ref={ref} data-testid="h" level="h1">
        Title
      </Heading>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("H1");
  });
});
