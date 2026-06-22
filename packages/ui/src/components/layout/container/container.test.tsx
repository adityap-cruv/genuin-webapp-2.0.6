import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { MAX_W_CLASS, PX_CLASS } from "../tokens";

import { Container } from "./container";

describe("Container", () => {
  it("renders a <div> with base classes and defaults (desktop / md)", () => {
    const { getByTestId } = render(<Container data-testid="c">x</Container>);
    const el = getByTestId("c");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("gencl:mx-auto", "gencl:w-full");
    expect(el).toHaveClass(MAX_W_CLASS.desktop);
    expect(el).toHaveClass(PX_CLASS.md);
    expect(el).toHaveAttribute("data-slot", "layout-container");
  });

  const namedTokens = [
    ["mobile", MAX_W_CLASS.mobile],
    ["tablet-sm", MAX_W_CLASS["tablet-sm"]],
    ["tablet", MAX_W_CLASS.tablet],
    ["desktop", MAX_W_CLASS.desktop],
    ["desktop-wide", MAX_W_CLASS["desktop-wide"]],
    ["full", MAX_W_CLASS.full],
  ] as const;

  namedTokens.forEach(([token, expected]) => {
    it(`maps maxW="${token}" to ${expected}`, () => {
      const { getByTestId } = render(
        <Container data-testid="c" maxW={token}>
          x
        </Container>
      );
      expect(getByTestId("c")).toHaveClass(expected);
    });
  });

  it("uses inline style.maxWidth for raw escape-hatch values", () => {
    const { getByTestId } = render(
      <Container data-testid="c" maxW="960px">
        x
      </Container>
    );
    const el = getByTestId("c");
    expect(el.style.maxWidth).toBe("960px");
    expect(el.className).not.toMatch(/gencl:max-w-/);
  });

  const pxTokens = [
    ["none", PX_CLASS.none],
    ["xs", PX_CLASS.xs],
    ["sm", PX_CLASS.sm],
    ["md", PX_CLASS.md],
    ["lg", PX_CLASS.lg],
    ["xl", PX_CLASS.xl],
  ] as const;

  pxTokens.forEach(([token, expected]) => {
    it(`maps px="${token}" to ${expected}`, () => {
      const { getByTestId } = render(
        <Container data-testid="c" px={token}>
          x
        </Container>
      );
      expect(getByTestId("c")).toHaveClass(expected);
    });
  });

  it("preserves a caller-provided style alongside named maxW", () => {
    const { getByTestId } = render(
      <Container data-testid="c" maxW="desktop" style={{ background: "rgb(0, 0, 0)" }}>
        x
      </Container>
    );
    const el = getByTestId("c");
    expect(el.style.background).toBe("rgb(0, 0, 0)");
    expect(el).toHaveClass(MAX_W_CLASS.desktop);
  });

  it("supports asChild polymorphism", () => {
    const { getByTestId } = render(
      <Container asChild>
        <main data-testid="c-main">x</main>
      </Container>
    );
    const el = getByTestId("c-main");
    expect(el.tagName).toBe("MAIN");
    expect(el).toHaveClass("gencl:mx-auto", "gencl:w-full");
  });

  it("merges a custom className", () => {
    const { getByTestId } = render(
      <Container data-testid="c" className="custom-class">
        x
      </Container>
    );
    expect(getByTestId("c")).toHaveClass("custom-class");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Container ref={ref} data-testid="c">
        x
      </Container>
    );
    expect(ref.current).not.toBeNull();
  });

  it("applies inline minHeight 600px when minHeight='hero'", () => {
    const { getByTestId } = render(
      <Container data-testid="c" minHeight="hero">
        x
      </Container>
    );
    const el = getByTestId("c");
    expect(el.style.minHeight).toBe("600px");
    expect(el.getAttribute("data-min-height")).toBe("hero");
  });

  it("applies inline minHeight 100vh when minHeight='screen'", () => {
    const { getByTestId } = render(
      <Container data-testid="c" minHeight="screen">
        x
      </Container>
    );
    expect(getByTestId("c").style.minHeight).toBe("100vh");
  });

  it("applies inline height 420px when height='lg'", () => {
    const { getByTestId } = render(
      <Container data-testid="c" height="lg">
        x
      </Container>
    );
    expect(getByTestId("c").style.height).toBe("420px");
  });

  it("maps height='full-bleed' to 100vh and cancels the max-width inset", () => {
    const { getByTestId } = render(
      <Container data-testid="c" height="full-bleed">
        x
      </Container>
    );
    const el = getByTestId("c");
    expect(el.style.height).toBe("100vh");
    // `full-bleed` overrides the named max-width inset so the container
    // reaches the viewport edges. The symmetric `calc(50% - 50vw)`
    // negative margin is also set inline (verified via the source —
    // JSDOM filters `calc(…)` from its CSSOM parser, so we don't
    // assert the margin values here).
    expect(el.style.maxWidth).toBe("100vw");
    expect(el.style.width).toBe("100vw");
  });

  it("emits no inline minHeight / height when both are omitted", () => {
    const { getByTestId } = render(<Container data-testid="c">x</Container>);
    const el = getByTestId("c");
    expect(el.style.minHeight).toBe("");
    expect(el.style.height).toBe("");
  });

  it("preserves caller style alongside dimension props", () => {
    const { getByTestId } = render(
      <Container data-testid="c" minHeight="md" style={{ background: "rgb(0, 0, 0)" }}>
        x
      </Container>
    );
    const el = getByTestId("c");
    expect(el.style.background).toBe("rgb(0, 0, 0)");
    expect(el.style.minHeight).toBe("300px");
  });
});
