import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { PageRenderer } from "./page-renderer";
import type { Page } from "./schema";

// jsdom doesn't ship ResizeObserver. Stub it so the hook doesn't crash.
class NoopResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(globalThis as unknown as { ResizeObserver: typeof NoopResizeObserver }).ResizeObserver =
  NoopResizeObserver;

const SAMPLE_PAGE: Page = {
  id: "p1",
  version: "2025.05",
  breakpoints: [
    {
      id: "mobile",
      minWidth: 0,
      root: {
        type: "ui",
        uiVariant: "stack",
        props: { gap: "md" },
        children: [
          {
            type: "ui",
            uiVariant: "heading",
            props: { level: "h1", as: "h1", text: "Title" },
          },
        ],
      },
    },
    {
      id: "desktop",
      minWidth: 1024,
      root: {
        type: "ui",
        uiVariant: "container",
        props: { maxW: "desktop", px: "lg" },
        children: [
          {
            type: "ui",
            uiVariant: "heading",
            props: { level: "headline-0", as: "h1", text: "Title" },
          },
        ],
      },
    },
  ],
};

describe("PageRenderer — single-breakpoint", () => {
  it("renders the root node from the first breakpoint at default width", () => {
    const page: Page = {
      id: "p-single",
      breakpoints: [
        {
          id: "only",
          minWidth: 0,
          root: { type: "ui", uiVariant: "stack" },
        },
      ],
    };
    const { container } = render(<PageRenderer page={page} />);
    const stack = container.querySelector('[data-slot="layout-stack"]');
    expect(stack).not.toBeNull();
    const wrapper = container.querySelector('[data-page-id="p-single"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute("data-active-breakpoint")).toBe("0");
  });
});

describe("PageRenderer — forced-width breakpoint pick", () => {
  it("picks the mobile tree when forcedWidth is below 1024", () => {
    const { container } = render(<PageRenderer page={SAMPLE_PAGE} forcedWidth={500} />);
    expect(container.querySelector('[data-slot="layout-stack"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="layout-container"]')).toBeNull();
    expect(container.querySelector('[data-active-breakpoint="0"]')).not.toBeNull();
  });

  it("picks the desktop tree when forcedWidth ≥ 1024", () => {
    const { container } = render(<PageRenderer page={SAMPLE_PAGE} forcedWidth={1280} />);
    expect(container.querySelector('[data-slot="layout-container"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="layout-stack"]')).toBeNull();
    expect(container.querySelector('[data-active-breakpoint="1024"]')).not.toBeNull();
  });
});

describe("PageRenderer — atomic breakpoint swap", () => {
  it("replaces the rendered subtree when forcedWidth crosses a breakpoint", () => {
    const { container, rerender } = render(
      <PageRenderer page={SAMPLE_PAGE} forcedWidth={500} />,
    );
    const mobileNode = container.querySelector('[data-slot="layout-stack"]');
    expect(mobileNode).not.toBeNull();

    rerender(<PageRenderer page={SAMPLE_PAGE} forcedWidth={1280} />);
    // The mobile stack must be gone — replaced, not preserved.
    expect(container.querySelector('[data-slot="layout-stack"]')).toBeNull();
    expect(container.querySelector('[data-slot="layout-container"]')).not.toBeNull();
  });
});

describe("PageRenderer — host-supplied overrides", () => {
  it("calls resolveSlotProps for slot nodes", () => {
    const page: Page = {
      id: "p-slot",
      breakpoints: [
        {
          id: "only",
          minWidth: 0,
          root: {
            type: "ui",
            uiVariant: "stack",
            children: [{ type: "slot", name: "body", kind: "content" }],
          },
        },
      ],
    };
    const resolveSlotProps = vi.fn(() => ({ body: "Hello." }));
    const { container } = render(
      <PageRenderer page={page} resolveSlotProps={resolveSlotProps} />,
    );
    expect(resolveSlotProps).toHaveBeenCalledOnce();
    expect(container.textContent).toContain("Hello");
  });

  it("merges custom uiRenderers on top of defaults", () => {
    const page: Page = {
      id: "p-custom",
      breakpoints: [
        {
          id: "only",
          minWidth: 0,
          root: { type: "ui", uiVariant: "custom-thing" },
        },
      ],
    };
    const customRenderer = ({ props: _props }: { props: Record<string, unknown> }) => (
      <div data-testid="custom-thing">Custom!</div>
    );
    const { getByTestId } = render(
      <PageRenderer page={page} uiRenderers={{ "custom-thing": customRenderer }} />,
    );
    expect(getByTestId("custom-thing")).toBeInTheDocument();
  });

  it("falls back when policy is 'fallback' and variant is missing", () => {
    const page: Page = {
      id: "p-fallback",
      breakpoints: [
        {
          id: "only",
          minWidth: 0,
          root: { type: "ui", uiVariant: "ghost-variant" },
        },
      ],
    };
    const { container } = render(
      <PageRenderer page={page} onMissingUiVariant="fallback" />,
    );
    const chip = container.querySelector('[data-slot="missing-ui-variant"]');
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain("ghost-variant");
  });
});
