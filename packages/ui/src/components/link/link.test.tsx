import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { Link, type LinkTone, type LinkWeight, type LinkUnderline } from "./link";

describe("Link", () => {
  it("renders an <a> with default tone, weight, underline and data-slot", () => {
    const { getByTestId } = render(
      <Link data-testid="lk" href="/x">
        Go
      </Link>
    );
    const el = getByTestId("lk");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/x");
    expect(el).toHaveAttribute("data-slot", "link");
    // default tone = "default"
    expect(el).toHaveClass("gencl:text-primary-600");
    // default weight = "medium"
    expect(el).toHaveClass("gencl:font-medium");
    // default underline = "hover"
    expect(el).toHaveClass("gencl:no-underline", "gencl:hover:underline");
  });

  const tones: Array<{ tone: LinkTone; cls: string }> = [
    { tone: "default", cls: "gencl:text-primary-600" },
    { tone: "subtle", cls: "gencl:text-secondary-600" },
    { tone: "inverted", cls: "gencl:text-white" },
  ];

  tones.forEach(({ tone, cls }) => {
    it(`maps tone="${tone}" to ${cls}`, () => {
      const { getByTestId } = render(
        <Link data-testid="lk" href="/x" tone={tone}>
          Go
        </Link>
      );
      expect(getByTestId("lk")).toHaveClass(cls);
    });
  });

  const weights: Array<{ weight: LinkWeight; cls: string }> = [
    { weight: "medium", cls: "gencl:font-medium" },
    { weight: "semibold", cls: "gencl:font-semibold" },
    { weight: "bold", cls: "gencl:font-bold" },
  ];

  weights.forEach(({ weight, cls }) => {
    it(`maps weight="${weight}" to ${cls}`, () => {
      const { getByTestId } = render(
        <Link data-testid="lk" href="/x" weight={weight}>
          Go
        </Link>
      );
      expect(getByTestId("lk")).toHaveClass(cls);
    });
  });

  const underlines: Array<{ underline: LinkUnderline; cls: string[] }> = [
    { underline: "always", cls: ["gencl:underline"] },
    { underline: "hover", cls: ["gencl:no-underline", "gencl:hover:underline"] },
    { underline: "none", cls: ["gencl:no-underline"] },
  ];

  underlines.forEach(({ underline, cls }) => {
    it(`maps underline="${underline}" to ${cls.join(" + ")}`, () => {
      const { getByTestId } = render(
        <Link data-testid="lk" href="/x" underline={underline}>
          Go
        </Link>
      );
      const el = getByTestId("lk");
      cls.forEach((c) => expect(el).toHaveClass(c));
    });
  });

  it("emits target=_blank and rel=noopener noreferrer when external=true", () => {
    const { getByTestId } = render(
      <Link data-testid="lk" href="https://example.com" external>
        Out
      </Link>
    );
    const el = getByTestId("lk");
    expect(el).toHaveAttribute("target", "_blank");
    expect(el).toHaveAttribute("rel", "noopener noreferrer");
    // External affordance class is applied
    expect(el.className).toContain("after:content");
  });

  it("does not override an explicit target / rel even when external=true", () => {
    const { getByTestId } = render(
      <Link data-testid="lk" href="/x" external target="_self" rel="custom-rel">
        Out
      </Link>
    );
    const el = getByTestId("lk");
    expect(el).toHaveAttribute("target", "_self");
    expect(el).toHaveAttribute("rel", "custom-rel");
  });

  it("does not emit target / rel when external=false (default)", () => {
    const { getByTestId } = render(
      <Link data-testid="lk" href="/x">
        Stay
      </Link>
    );
    const el = getByTestId("lk");
    expect(el).not.toHaveAttribute("target");
    expect(el).not.toHaveAttribute("rel");
  });

  it("supports asChild polymorphism (renders as <button>)", () => {
    const { getByTestId } = render(
      <Link asChild>
        <button data-testid="btn" type="button">
          Click
        </button>
      </Link>
    );
    const el = getByTestId("btn");
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveAttribute("data-slot", "link");
    expect(el).toHaveClass("gencl:text-primary-600");
  });

  it("merges a custom className without overriding base classes", () => {
    const { getByTestId } = render(
      <Link data-testid="lk" href="/x" className="custom-class">
        Go
      </Link>
    );
    const el = getByTestId("lk");
    expect(el).toHaveClass("custom-class");
    expect(el).toHaveClass("gencl:font-medium");
  });

  it("preserves a focus-visible ring class (focus visibility never suppressed)", () => {
    const { getByTestId } = render(
      <Link data-testid="lk" href="/x">
        Go
      </Link>
    );
    expect(getByTestId("lk").className).toContain("focus-visible:ring");
  });

  it("passes through aria-* attributes (aria-label, aria-current)", () => {
    const { getByTestId } = render(
      <Link data-testid="lk" href="/x" aria-label="Go somewhere" aria-current="page">
        Go
      </Link>
    );
    const el = getByTestId("lk");
    expect(el).toHaveAttribute("aria-label", "Go somewhere");
    expect(el).toHaveAttribute("aria-current", "page");
  });

  it("forwards ref to the underlying anchor", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} data-testid="lk" href="/x">
        Go
      </Link>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("A");
  });
});
