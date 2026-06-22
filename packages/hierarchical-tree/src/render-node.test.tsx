import { render } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { renderNode, resolveMissingUiVariantPolicy } from "./render-node";
import type { LayoutNode, SlotKind } from "./schema";
import type { SlotRenderers, UiRenderers } from "./types";

function PassthroughDiv({
  variant,
  children,
}: {
  variant: string;
  children?: React.ReactNode;
}) {
  return (
    <div data-variant={variant} data-testid={`ui-${variant}`}>
      {children}
    </div>
  );
}

const PASSTHROUGH_RENDERERS: UiRenderers = {
  row: ({ children }) => <PassthroughDiv variant="row">{children}</PassthroughDiv>,
  column: ({ children }) => <PassthroughDiv variant="column">{children}</PassthroughDiv>,
  text: ({ props, children }) => (
    <p data-text={(props as { tone?: string }).tone ?? "default"} data-testid="ui-text">
      {children ?? "default-text"}
    </p>
  ),
};

function makeSlotRenderers(): {
  renderers: SlotRenderers;
  spies: Record<SlotKind, ReturnType<typeof vi.fn>>;
} {
  const spies: Record<SlotKind, ReturnType<typeof vi.fn>> = {
    content: vi.fn(({ slot }) => (
      <div data-testid={`slot-content-${slot.name}`}>content:{slot.name}</div>
    )),
    video: vi.fn(({ slot }) => (
      <div data-testid={`slot-video-${slot.name}`}>video:{slot.name}</div>
    )),
    linkout: vi.fn(({ slot }) => (
      <div data-testid={`slot-linkout-${slot.name}`}>linkout:{slot.name}</div>
    )),
  };
  return {
    renderers: spies as unknown as SlotRenderers,
    spies,
  };
}

describe("renderNode — UI-only trees", () => {
  it("renders a single UI node with forwarded props", () => {
    const node: LayoutNode = { type: "ui", uiVariant: "row" };
    const { spies, renderers } = makeSlotRenderers();
    const { getByTestId } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "throw",
      })}</>,
    );
    expect(getByTestId("ui-row")).toBeInTheDocument();
    expect(spies.content).not.toHaveBeenCalled();
  });

  it("recursively renders nested UI children", () => {
    const node: LayoutNode = {
      type: "ui",
      uiVariant: "column",
      children: [
        { type: "ui", uiVariant: "row" },
        { type: "ui", uiVariant: "text", props: { tone: "subtle" } },
      ],
    };
    const { renderers } = makeSlotRenderers();
    const { getByTestId } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "throw",
      })}</>,
    );
    expect(getByTestId("ui-column")).toBeInTheDocument();
    expect(getByTestId("ui-row")).toBeInTheDocument();
    expect(getByTestId("ui-text").getAttribute("data-text")).toBe("subtle");
  });
});

describe("renderNode — Slot dispatch", () => {
  it("dispatches a slot to the matching renderer by kind", () => {
    const node: LayoutNode = { type: "slot", name: "main-video", kind: "video" };
    const { spies, renderers } = makeSlotRenderers();
    const { getByTestId } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "throw",
      })}</>,
    );
    expect(getByTestId("slot-video-main-video")).toBeInTheDocument();
    expect(spies.video).toHaveBeenCalledOnce();
    expect(spies.content).not.toHaveBeenCalled();
  });

  it("passes resolved props from the resolveSlotProps seam", () => {
    const node: LayoutNode = {
      type: "slot",
      name: "body",
      kind: "content",
      props: { raw: true },
    };
    const { spies, renderers } = makeSlotRenderers();
    const resolveSlotProps = vi.fn(() => ({ resolved: true }));
    render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        resolveSlotProps,
        onMissingUiVariant: "throw",
      })}</>,
    );
    expect(resolveSlotProps).toHaveBeenCalledWith(node, "content");
    expect(spies.content).toHaveBeenCalledWith(
      expect.objectContaining({ props: { resolved: true } }),
    );
  });

  it("falls back to raw props when no resolver is supplied", () => {
    const node: LayoutNode = {
      type: "slot",
      name: "body",
      kind: "content",
      props: { raw: true },
    };
    const { spies, renderers } = makeSlotRenderers();
    render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "throw",
      })}</>,
    );
    expect(spies.content).toHaveBeenCalledWith(
      expect.objectContaining({ props: { raw: true } }),
    );
  });

  it("wraps a sticky content slot in a gencl:sticky container", () => {
    const node: LayoutNode = {
      type: "slot",
      name: "body",
      kind: "content",
      sticky: true,
    };
    const { renderers } = makeSlotRenderers();
    const { container, getByTestId } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "throw",
      })}</>,
    );
    const wrapper = container.querySelector('[data-slot-sticky="true"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toContain("gencl:sticky");
    expect(getByTestId("slot-content-body")).toBeInTheDocument();
  });

  it("does NOT wrap sticky video / linkout slots (SDK-managed)", () => {
    const node: LayoutNode = {
      type: "slot",
      name: "v",
      kind: "video",
      sticky: true,
    };
    const { renderers } = makeSlotRenderers();
    const { container } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "throw",
      })}</>,
    );
    expect(container.querySelector('[data-slot-sticky="true"]')).toBeNull();
  });
});

describe("renderNode — mixed UI + Slot trees", () => {
  it("renders UI wrapping Slot leaves", () => {
    const node: LayoutNode = {
      type: "ui",
      uiVariant: "column",
      children: [
        { type: "slot", name: "body", kind: "content" },
        { type: "slot", name: "main-video", kind: "video" },
      ],
    };
    const { renderers } = makeSlotRenderers();
    const { getByTestId } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "throw",
      })}</>,
    );
    expect(getByTestId("ui-column")).toBeInTheDocument();
    expect(getByTestId("slot-content-body")).toBeInTheDocument();
    expect(getByTestId("slot-video-main-video")).toBeInTheDocument();
  });
});

describe("renderNode — missing uiVariant policy", () => {
  it("throws when policy is 'throw'", () => {
    const node: LayoutNode = { type: "ui", uiVariant: "made-up" };
    const { renderers } = makeSlotRenderers();
    expect(() =>
      render(
        <>{renderNode(node, {
          uiRenderers: PASSTHROUGH_RENDERERS,
          slotRenderers: renderers,
          onMissingUiVariant: "throw",
        })}</>,
      ),
    ).toThrow(/uiVariant 'made-up'/);
  });

  it("renders a visible chip when policy is 'fallback'", () => {
    const node: LayoutNode = { type: "ui", uiVariant: "made-up" };
    const { renderers } = makeSlotRenderers();
    const { container } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: "fallback",
      })}</>,
    );
    const chip = container.querySelector('[data-slot="missing-ui-variant"]');
    expect(chip).not.toBeNull();
    expect(chip?.textContent).toContain("made-up");
  });

  it("delegates to a function policy", () => {
    const node: LayoutNode = { type: "ui", uiVariant: "made-up" };
    const { renderers } = makeSlotRenderers();
    const policy = vi.fn((v: string) => <span data-testid="custom-fallback">{v}</span>);
    const { getByTestId } = render(
      <>{renderNode(node, {
        uiRenderers: PASSTHROUGH_RENDERERS,
        slotRenderers: renderers,
        onMissingUiVariant: policy,
      })}</>,
    );
    expect(getByTestId("custom-fallback").textContent).toBe("made-up");
    expect(policy).toHaveBeenCalledWith("made-up");
  });
});

describe("renderNode — defensive runtime checks", () => {
  it("throws when a slot kind has no registered renderer", () => {
    const node: LayoutNode = { type: "slot", name: "x", kind: "linkout" };
    // Build an incomplete slotRenderers map. The walker should throw
    // because the schema's closed enum says linkout must be wired.
    const partial = {
      content: vi.fn(),
      video: vi.fn(),
    } as unknown as SlotRenderers;
    expect(() =>
      render(
        <>{renderNode(node, {
          uiRenderers: PASSTHROUGH_RENDERERS,
          slotRenderers: partial,
          onMissingUiVariant: "throw",
        })}</>,
      ),
    ).toThrow(/slot renderer/);
  });
});

describe("resolveMissingUiVariantPolicy", () => {
  it("returns the supplied policy when explicit", () => {
    expect(resolveMissingUiVariantPolicy("fallback")).toBe("fallback");
    expect(resolveMissingUiVariantPolicy("throw")).toBe("throw");
    const fn = (v: string) => v;
    expect(resolveMissingUiVariantPolicy(fn)).toBe(fn);
  });

  it("defaults to 'throw' in non-production envs", () => {
    const before = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    expect(resolveMissingUiVariantPolicy(undefined)).toBe("throw");
    process.env.NODE_ENV = before;
  });

  it("defaults to 'fallback' in production", () => {
    const before = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(resolveMissingUiVariantPolicy(undefined)).toBe("fallback");
    process.env.NODE_ENV = before;
  });
});
