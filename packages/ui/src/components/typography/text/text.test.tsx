import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { TEXT_DEFAULT_WEIGHT, TEXT_SIZE_CLASS, WEIGHT_CLASS, type TextSize, type TypographyWeight } from "../tokens";

import { Text } from "./text";

const ALL_SIZES: TextSize[] = ["body-0", "body-1", "body-2", "body-3", "body-4"];
const ALL_WEIGHTS: TypographyWeight[] = ["medium", "semibold", "bold"];

describe("Text", () => {
  it("renders the default <p> with the default size + weight + data-slot", () => {
    const { getByTestId } = render(<Text data-testid="t">Paragraph</Text>);
    const el = getByTestId("t");
    expect(el.tagName).toBe("P");
    expect(el).toHaveAttribute("data-slot", "text");
    TEXT_SIZE_CLASS["body-1"].split(" ").forEach((cls) => {
      expect(el).toHaveClass(cls);
    });
    // canonical default weight for body-1 = medium
    expect(el).toHaveClass(WEIGHT_CLASS.medium);
  });

  describe.each(ALL_SIZES)("size=%s", (size) => {
    it("applies the size's font-size + line-height classes", () => {
      const { getByTestId } = render(
        <Text data-testid="t" size={size}>
          x
        </Text>
      );
      const el = getByTestId("t");
      TEXT_SIZE_CLASS[size].split(" ").forEach((cls) => {
        expect(el).toHaveClass(cls);
      });
    });

    it("falls back to the canonical default weight when weight is omitted", () => {
      const { getByTestId } = render(
        <Text data-testid="t" size={size}>
          x
        </Text>
      );
      expect(getByTestId("t")).toHaveClass(WEIGHT_CLASS[TEXT_DEFAULT_WEIGHT[size]]);
    });
  });

  describe.each(ALL_WEIGHTS)("weight=%s", (weight) => {
    it("applies the weight class", () => {
      const { getByTestId } = render(
        <Text data-testid="t" weight={weight}>
          x
        </Text>
      );
      expect(getByTestId("t")).toHaveClass(WEIGHT_CLASS[weight]);
    });
  });

  it("respects the `as` override (span)", () => {
    const { getByTestId } = render(
      <Text data-testid="t" as="span">
        inline
      </Text>
    );
    expect(getByTestId("t").tagName).toBe("SPAN");
  });

  it("respects the `as` override (div)", () => {
    const { getByTestId } = render(
      <Text data-testid="t" as="div">
        block
      </Text>
    );
    expect(getByTestId("t").tagName).toBe("DIV");
  });

  it("respects the `as` override (label)", () => {
    const { getByTestId } = render(
      <Text data-testid="t" as="label">
        labelled
      </Text>
    );
    expect(getByTestId("t").tagName).toBe("LABEL");
  });

  it("applies align=center", () => {
    const { getByTestId } = render(
      <Text data-testid="t" align="center">
        x
      </Text>
    );
    expect(getByTestId("t")).toHaveClass("gencl:text-center");
  });

  it("applies align=right", () => {
    const { getByTestId } = render(
      <Text data-testid="t" align="right">
        x
      </Text>
    );
    expect(getByTestId("t")).toHaveClass("gencl:text-right");
  });

  it("does not add an alignment class for align=left (default)", () => {
    const { getByTestId } = render(<Text data-testid="t">x</Text>);
    const el = getByTestId("t");
    expect(el).not.toHaveClass("gencl:text-center");
    expect(el).not.toHaveClass("gencl:text-right");
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Text asChild size="body-2">
        <a href="/somewhere" data-testid="link-text">
          Linked text
        </a>
      </Text>
    );
    const el = getByTestId("link-text");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/somewhere");
    expect(el).toHaveAttribute("data-slot", "text");
    TEXT_SIZE_CLASS["body-2"].split(" ").forEach((cls) => {
      expect(el).toHaveClass(cls);
    });
  });

  it("merges a custom className without overriding base classes", () => {
    const { getByTestId } = render(
      <Text data-testid="t" className="custom-class" size="body-0">
        x
      </Text>
    );
    const el = getByTestId("t");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("gencl:text-[16px]");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Text ref={ref} data-testid="t" as="span">
        x
      </Text>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("SPAN");
  });
});
