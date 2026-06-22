import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRef } from "react";

import { Surface } from "./surface";

describe("Surface", () => {
  it("renders children inside a div with the surface data-slot", () => {
    const { getByText, container } = render(<Surface>panel body</Surface>);
    expect(getByText("panel body")).toBeInTheDocument();
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.tagName).toBe("DIV");
  });

  it("defaults to tone='subtle', radius='md', padding='md'", () => {
    const { container } = render(<Surface>x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-tone", "subtle");
    expect(wrapper).toHaveAttribute("data-radius", "md");
    expect(wrapper).toHaveAttribute("data-padding", "md");
    expect(wrapper).toHaveClass("gencl:bg-secondary-50");
    expect(wrapper).toHaveClass("gencl:rounded-md");
    expect(wrapper).toHaveClass("gencl:p-4");
  });

  it("applies tone='none' as a transparent background", () => {
    const { container } = render(<Surface tone="none">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-tone", "none");
    expect(wrapper).toHaveClass("gencl:bg-transparent");
    expect(wrapper).not.toHaveClass("gencl:text-white");
  });

  it("applies tone='subtle' as the light-grey background", () => {
    const { container } = render(<Surface tone="subtle">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveClass("gencl:bg-secondary-50");
    expect(wrapper).not.toHaveClass("gencl:text-white");
  });

  it("applies tone='inverse' with the theme-independent near-black background and white text flip", () => {
    const { container } = render(<Surface tone="inverse">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-tone", "inverse");
    // `inverse` deliberately bypasses `--gencl-secondary-900` because some
    // publisher palettes (e.g. Planet Fitness) resolve that token to a
    // coloured dark like olive — useless as a "dark mode" tone.
    expect(wrapper).toHaveClass("gencl:bg-black");
    expect(wrapper).toHaveClass("gencl:text-white");
    expect(wrapper).not.toHaveClass("gencl:bg-secondary-900");
  });

  it("applies tone='brand-tint' as the primary-100 background (no text flip)", () => {
    const { container } = render(<Surface tone="brand-tint">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-tone", "brand-tint");
    expect(wrapper).toHaveClass("gencl:bg-primary-100");
    expect(wrapper).not.toHaveClass("gencl:text-white");
  });

  it("applies tone='brand-strong' with the primary background and white text flip", () => {
    const { container } = render(<Surface tone="brand-strong">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-tone", "brand-strong");
    expect(wrapper).toHaveClass("gencl:bg-primary");
    expect(wrapper).toHaveClass("gencl:text-white");
  });

  it("applies tone='accent-strong' with the secondary-500 background and black text flip", () => {
    const { container } = render(<Surface tone="accent-strong">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-tone", "accent-strong");
    // Saturated accent band — `--gencl-secondary-500` cascades to the
    // publisher's bright brand accent (Planet Fitness yellow #ffdf29).
    // Foreground flips to near-black for AA contrast against a bright
    // fill — white-on-yellow would fail.
    expect(wrapper).toHaveClass("gencl:bg-secondary-500");
    expect(wrapper).toHaveClass("gencl:text-black");
    expect(wrapper).not.toHaveClass("gencl:text-white");
  });

  it("applies radius='lg' classes", () => {
    const { container } = render(<Surface radius="lg">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-radius", "lg");
    expect(wrapper).toHaveClass("gencl:rounded-lg");
  });

  it("applies radius='full' classes", () => {
    const { container } = render(<Surface radius="full">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveClass("gencl:rounded-full");
  });

  it("padding='none' emits an explicit p-0 (no md leftover)", () => {
    const { container } = render(<Surface padding="none">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveAttribute("data-padding", "none");
    expect(wrapper).toHaveClass("gencl:p-0");
    expect(wrapper).not.toHaveClass("gencl:p-4");
  });

  it("padding='xl' applies the p-8 utility", () => {
    const { container } = render(<Surface padding="xl">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveClass("gencl:p-8");
  });

  it("merges a custom className without dropping base utilities", () => {
    const { container } = render(<Surface className="custom-x">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).toHaveClass("custom-x");
    expect(wrapper).toHaveClass("gencl:bg-secondary-50");
  });

  it("renders as the child element when asChild=true", () => {
    const { container } = render(
      <Surface asChild>
        <section data-testid="wrapped-section">payload</section>
      </Surface>
    );
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-slot", "surface");
    expect(section).toHaveAttribute("data-testid", "wrapped-section");
    // No wrapping <div> sibling — Slot should have replaced the host element.
    expect(container.querySelectorAll('div[data-slot="surface"]')).toHaveLength(0);
  });

  it("forwards ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Surface ref={ref}>x</Surface>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("applies inline minHeight 420px when minHeight='lg'", () => {
    const { container } = render(<Surface minHeight="lg">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("420px");
    expect(wrapper.getAttribute("data-min-height")).toBe("lg");
  });

  it("applies inline minHeight 600px when minHeight='hero'", () => {
    const { container } = render(<Surface minHeight="hero">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("600px");
  });

  it("applies inline minHeight 100vh when minHeight='screen'", () => {
    const { container } = render(<Surface minHeight="screen">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("100vh");
  });

  it("emits no inline minHeight when minHeight is omitted (default)", () => {
    const { container } = render(<Surface>x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]') as HTMLElement;
    expect(wrapper.style.minHeight).toBe("");
  });

  it("applies inline height 300px when height='md'", () => {
    const { container } = render(<Surface height="md">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]') as HTMLElement;
    expect(wrapper.style.height).toBe("300px");
    expect(wrapper.getAttribute("data-height")).toBe("md");
  });

  it("maps height='full-bleed' to 100vh on Surface (no max-width override)", () => {
    const { container } = render(<Surface height="full-bleed">x</Surface>);
    const wrapper = container.querySelector('[data-slot="surface"]') as HTMLElement;
    expect(wrapper.style.height).toBe("100vh");
    // Surface does not collapse a max-width — only Container does.
    expect(wrapper.style.maxWidth).toBe("");
  });

  it("preserves a caller-provided style alongside dimension props", () => {
    const { container } = render(
      <Surface minHeight="md" style={{ background: "rgb(0, 0, 0)" }}>
        x
      </Surface>
    );
    const wrapper = container.querySelector('[data-slot="surface"]') as HTMLElement;
    expect(wrapper.style.background).toBe("rgb(0, 0, 0)");
    expect(wrapper.style.minHeight).toBe("300px");
  });
});
