import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { AccentBorder } from "./accent-border";

describe("AccentBorder", () => {
  it("renders children inside a div with the accent-border data-slot", () => {
    const { getByText, container } = render(<AccentBorder side="left">Sponsored content</AccentBorder>);
    expect(getByText("Sponsored content")).toBeInTheDocument();
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.tagName).toBe("DIV");
  });

  it("applies the side data attribute and corresponding pseudo-element layout", () => {
    const { container } = render(<AccentBorder side="left">x</AccentBorder>);
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveAttribute("data-side", "left");
    // Left side positions the pseudo on the left edge with full height.
    expect(wrapper).toHaveClass("gencl:before:left-0");
    expect(wrapper).toHaveClass("gencl:before:h-full");
  });

  it("defaults to tone='primary'", () => {
    const { container } = render(<AccentBorder side="left">x</AccentBorder>);
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveAttribute("data-tone", "primary");
    expect(wrapper).toHaveClass("gencl:[--accent-border-color:var(--gencl-color-primary)]");
  });

  it("applies tone='secondary' classes", () => {
    const { container } = render(
      <AccentBorder side="left" tone="secondary">
        x
      </AccentBorder>
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveAttribute("data-tone", "secondary");
    expect(wrapper).toHaveClass("gencl:[--accent-border-color:var(--gencl-color-secondary-800)]");
  });

  it("applies weight='thick' classes", () => {
    const { container } = render(
      <AccentBorder side="left" weight="thick">
        x
      </AccentBorder>
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveAttribute("data-weight", "thick");
    expect(wrapper).toHaveClass("gencl:[--accent-border-weight:5px]");
  });

  it("state='expand' adds the hover-expand utility for the side axis", () => {
    const { container } = render(
      <AccentBorder side="bottom" state="expand">
        x
      </AccentBorder>
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveAttribute("data-state", "expand");
    // bottom edge expands width 0 → full.
    expect(wrapper).toHaveClass("gencl:before:w-0");
    expect(wrapper).toHaveClass("gencl:hover:before:w-full");
  });

  it("state='reveal' fades the pseudo in on hover (no expand utility)", () => {
    const { container } = render(
      <AccentBorder side="left" state="reveal">
        x
      </AccentBorder>
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveAttribute("data-state", "reveal");
    expect(wrapper).toHaveClass("gencl:before:opacity-0");
    expect(wrapper).toHaveClass("gencl:hover:before:opacity-100");
    // Reveal does NOT shrink the line dimensions — only the expand
    // state does.
    expect(wrapper).not.toHaveClass("gencl:before:h-0");
    expect(wrapper).not.toHaveClass("gencl:before:w-0");
  });

  it("inset='md' adds padding only on the accent side", () => {
    const { container } = render(
      <AccentBorder side="left" inset="md">
        x
      </AccentBorder>
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveClass("gencl:pl-4");
    expect(wrapper).not.toHaveClass("gencl:pr-4");
    expect(wrapper).not.toHaveClass("gencl:pt-4");
    expect(wrapper).not.toHaveClass("gencl:pb-4");
  });

  it("inset='none' omits padding entirely", () => {
    const { container } = render(
      <AccentBorder side="left" inset="none">
        x
      </AccentBorder>
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).not.toHaveClass("gencl:pl-2");
    expect(wrapper).not.toHaveClass("gencl:pl-3");
    expect(wrapper).not.toHaveClass("gencl:pl-4");
  });

  it("merges a custom className without dropping the base utilities", () => {
    const { container } = render(
      <AccentBorder side="left" className="custom-x">
        x
      </AccentBorder>
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).toHaveClass("custom-x");
    expect(wrapper).toHaveClass("gencl:relative");
  });

  it("renders as the child element when asChild=true", () => {
    const { container } = render(
      <AccentBorder side="left" asChild>
        <section data-testid="wrapped-section">payload</section>
      </AccentBorder>
    );
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-slot", "accent-border");
    expect(section).toHaveAttribute("data-testid", "wrapped-section");
    // No wrapping <div> should exist as a sibling of the section.
    expect(container.querySelectorAll('div[data-slot="accent-border"]')).toHaveLength(0);
  });

  it("forwards ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AccentBorder ref={ref} side="left">
        x
      </AccentBorder>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
  });
});
