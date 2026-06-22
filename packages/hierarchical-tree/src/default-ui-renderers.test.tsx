import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_UI_VARIANTS, defaultUiRenderers } from "./default-ui-renderers";

describe("defaultUiRenderers — registry shape", () => {
  it("registers all 23 v0 emittable uiVariant strings", () => {
    const expected = [
      "row",
      "column",
      "stack",
      "grid",
      "container",
      "cluster",
      "split-view",
      "heading",
      "text",
      "button",
      "avatar",
      "chip",
      "image",
      "decorative-list",
      "meta-list",
      "divider",
      "link",
      "icon",
      "accent-border",
      "surface",
      "accordion",
      "tabs",
      "collapsible",
    ];
    expect(DEFAULT_UI_VARIANTS).toEqual(expected);
    expect(Object.keys(defaultUiRenderers).sort()).toEqual(expected.sort());
  });
});

describe("defaultUiRenderers — surface", () => {
  it("wraps walker children inside a surface data-slot with default tone", () => {
    const Renderer = defaultUiRenderers.surface!;
    const { container, getByText } = render(
      <Renderer props={{ tone: "subtle", radius: "md", padding: "md" }}>
        Sidebar panel body
      </Renderer>,
    );
    const wrapper = container.querySelector('[data-slot="surface"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute("data-tone", "subtle");
    expect(wrapper).toHaveAttribute("data-radius", "md");
    expect(wrapper).toHaveAttribute("data-padding", "md");
    expect(getByText("Sidebar panel body")).toBeInTheDocument();
  });
});

describe("defaultUiRenderers — accent-border", () => {
  it("wraps walker children inside an accent-border data-slot", () => {
    const Renderer = defaultUiRenderers["accent-border"]!;
    const { container, getByText } = render(
      <Renderer
        props={{ side: "left", tone: "primary", weight: "medium", state: "always", inset: "sm" }}>
        Sponsored card body
      </Renderer>,
    );
    const wrapper = container.querySelector('[data-slot="accent-border"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute("data-side", "left");
    expect(wrapper).toHaveAttribute("data-tone", "primary");
    expect(getByText("Sponsored card body")).toBeInTheDocument();
  });
});

describe("defaultUiRenderers — meta-list", () => {
  it("renders a <dl> with a row per items[] entry", () => {
    const Renderer = defaultUiRenderers["meta-list"]!;
    const { container, getByText } = render(
      <Renderer
        props={{
          items: [
            { label: "Network", value: "Activated" },
            { label: "Octo", value: "Enabled" },
          ],
        }}>
        {undefined}
      </Renderer>,
    );
    const dl = container.querySelector('dl[data-slot="meta-list"]');
    expect(dl).not.toBeNull();
    expect(dl?.querySelectorAll("dt")).toHaveLength(2);
    expect(dl?.querySelectorAll("dd")).toHaveLength(2);
    expect(getByText("Network").tagName).toBe("DT");
    expect(getByText("Activated").tagName).toBe("DD");
  });
});

describe("defaultUiRenderers — primitive smoke tests", () => {
  it("row renders an element with the layout-row data-slot", () => {
    const Renderer = defaultUiRenderers.row!;
    const { container } = render(<Renderer props={{ gap: "md" }}>hello</Renderer>);
    expect(container.querySelector('[data-slot="layout-row"]')).not.toBeNull();
  });

  it("text renders body copy with the typography text data-slot", () => {
    const Renderer = defaultUiRenderers.text!;
    const { container, getByText } = render(<Renderer props={{}}>body copy</Renderer>);
    expect(container.querySelector('[data-slot="text"]')).not.toBeNull();
    expect(getByText("body copy")).toBeInTheDocument();
  });

  it("heading renders a heading data-slot element", () => {
    const Renderer = defaultUiRenderers.heading!;
    const { container } = render(
      <Renderer props={{ level: "headline-2", as: "h2" }}>Title</Renderer>,
    );
    expect(container.querySelector('[data-slot="heading"]')).not.toBeNull();
  });

  it("divider renders a separator role", () => {
    const Renderer = defaultUiRenderers.divider!;
    const { container } = render(<Renderer props={{}} />);
    expect(container.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("link renders an anchor data-slot element", () => {
    const Renderer = defaultUiRenderers.link!;
    const { container } = render(<Renderer props={{ href: "/x" }}>click me</Renderer>);
    expect(container.querySelector('[data-slot="link"]')).not.toBeNull();
  });

  it("button renders a button data-slot element", () => {
    const Renderer = defaultUiRenderers.button!;
    const { container } = render(<Renderer props={{}}>Click</Renderer>);
    expect(container.querySelector('[data-slot="button"]')).not.toBeNull();
  });

  it("icon renders a svg with the matching data-icon-name", () => {
    const Renderer = defaultUiRenderers.icon!;
    const { container } = render(
      <Renderer props={{ name: "play", "aria-label": "Play" }} />,
    );
    expect(container.querySelector('[data-icon-name="play"]')).not.toBeNull();
  });

  it("chip renders a paragraph with chip classes", () => {
    const Renderer = defaultUiRenderers.chip!;
    const { getByText } = render(<Renderer props={{}}>Chip</Renderer>);
    expect(getByText("Chip")).toBeInTheDocument();
  });

  it("container honours a max-width token", () => {
    const Renderer = defaultUiRenderers.container!;
    const { container } = render(
      <Renderer props={{ maxW: "tablet", px: "lg" }}>x</Renderer>,
    );
    expect(container.querySelector('[data-slot="layout-container"]')).not.toBeNull();
  });

  it("grid renders a grid data-slot element", () => {
    const Renderer = defaultUiRenderers.grid!;
    const { container } = render(<Renderer props={{ cols: 2, gap: "md" }}>x</Renderer>);
    expect(container.querySelector('[data-slot="layout-grid"]')).not.toBeNull();
  });
});
