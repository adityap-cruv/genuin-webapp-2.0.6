/**
 * Tests for App.tsx — the top-level orchestrator that mounts
 * InstanceProvider → AnalyticsProvider → TagDetailsProvider, then gates
 * FeedTree behind TagDetailsGate (loading skeleton / error state / children).
 *
 * FeedTree itself (the provider stack, fullscreen overlay, and
 * NativeFeedShim) is mocked here to a passthrough — its own rendering
 * behavior is covered by FeedTree.test.tsx.
 *
 * Rendered with raw React + react-dom (this repo does NOT use
 * @testing-library/react).
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import App from "@cxr/app/App";

import { AD_LAYOUT, type AdLayoutId } from "../config";

// ── Provider passthroughs ──────────────────────────────────────────────────

const sendEventMock = vi.fn();
const setBrandIdMock = vi.fn();

vi.mock("../providers/AnalyticsProvider", () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "analytics-provider" }, children),
  useAnalytics: vi.fn(() => ({ sendEvent: sendEventMock, setBrandId: setBrandIdMock })),
}));

const useTagDetailsMock = vi.fn(() => ({
  tagDetails: undefined as Record<string, unknown> | undefined,
  apiFailed: false,
  tagId: "tag-1",
  brandId: undefined as number | undefined,
  adLayout: AD_LAYOUT.Unknown as AdLayoutId,
}));

// Captures the previewConfig prop the TagDetailsProvider was last rendered with.
let capturedPreviewConfig: Record<string, unknown> | undefined;

vi.mock("../providers/TagDetailsProvider", () => ({
  TagDetailsProvider: ({
    children,
    previewConfig,
  }: {
    children: React.ReactNode;
    previewConfig?: Record<string, unknown>;
  }) => {
    capturedPreviewConfig = previewConfig;
    return React.createElement("div", { "data-testid": "tag-details-provider" }, children);
  },
  useTagDetails: () => useTagDetailsMock(),
}));

const registerMock = vi.fn();
vi.mock("../instance/registry/InstanceRegistry", () => ({
  getInstanceRegistry: () => ({ register: registerMock, unregister: vi.fn() }),
}));

// Mirrors the real TagDetailsGate: gates `children` on tagDetails/apiFailed
// instead of rendering them unconditionally, so tests exercise the same
// skeleton/error/children branching the real gate does. Default-exported so
// App's lazy() import resolves the same way it does against the real module.
vi.mock("../providers/TagDetailsGate", async () => {
  const { NoContent } = await import("../app/NoContent");
  const { FeedSkeleton } = await import("../app/FeedSkeleton");
  function MockTagDetailsGate({ children }: { children: React.ReactNode }): React.ReactNode {
    const { tagDetails, apiFailed } = useTagDetailsMock();
    if (apiFailed) return React.createElement(NoContent, { message: "This content is no longer available" });
    if (!tagDetails) return React.createElement(FeedSkeleton);
    return children;
  }
  return { default: MockTagDetailsGate };
});

vi.mock("../app/FeedSkeleton", () => ({
  FeedSkeleton: () => React.createElement("div", { "data-testid": "feed-skeleton" }),
}));

vi.mock("../app/FeedTree", () => ({
  default: ({ onDismiss }: { onDismiss: () => void }) =>
    React.createElement(
      "div",
      { "data-testid": "feed-tree" },
      React.createElement("button", { "data-testid": "dismiss", onClick: onDismiss })
    ),
}));

vi.mock("../instance/InstanceContext", () => ({
  InstanceProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Flushes pending macrotasks so both lazy-loaded chunks (TagDetailsGate, then
// FeedTree nested inside it) resolve before assertions run. The first dynamic
// import() of a vi.mock'd module in a test file costs an extra tick or two
// beyond a warm one, so this flushes more rounds than the two lazy() boundaries
// alone would need.
async function flushPromises(): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

describe("App", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedPreviewConfig = undefined;
    useTagDetailsMock.mockReturnValue({
      tagDetails: { tag_id: "tag-1", config: {}, brand_id: "brand-9" },
      apiFailed: false,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.Unknown,
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete (window as { cxr?: unknown }).cxr;
  });

  function render(props: Partial<React.ComponentProps<typeof App>> = {}): void {
    act(() => {
      root.render(
        React.createElement(App, {
          tagId: "tag-1",
          rootTagId: "root-1",
          adLayout: AD_LAYOUT.Unknown,
          instanceId: "test-instance",
          ...props,
        })
      );
    });
  }

  it("renders the analytics provider and FeedTree once the tag resolves", async () => {
    render();
    await flushPromises();
    expect(container.querySelector('[data-testid="analytics-provider"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="feed-tree"]')).toBeTruthy();
  });

  it("shows the skeleton before the tag config resolves", () => {
    useTagDetailsMock.mockReturnValue({
      tagDetails: undefined,
      apiFailed: false,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.Unknown,
    }); // never resolves
    render();
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="feed-tree"]')).toBeNull();
  });

  it("renders the NoContent fallback when the tag fetch fails", async () => {
    useTagDetailsMock.mockReturnValue({
      tagDetails: undefined,
      apiFailed: true,
      tagId: "tag-1",
      brandId: undefined,
      adLayout: AD_LAYOUT.Unknown,
    });
    render();
    await flushPromises();

    const noContent = container.querySelector('[data-testid="cxr-no-content"]');
    expect(noContent).toBeTruthy();
    expect(noContent?.textContent).toContain("no longer available");
    expect(container.querySelector('[data-testid="feed-tree"]')).toBeNull();
  });

  it("preview mode: registers setPreviewConfig that updates the previewConfig", async () => {
    render({ preview: true });
    await flushPromises();

    const controls = registerMock.mock.calls.find((c) => c[0] === "test-instance")?.[1];
    expect(typeof controls.setPreviewConfig).toBe("function");

    act(() => controls.setPreviewConfig({ tag_id: "p1" }));
    expect(capturedPreviewConfig).toEqual({ tag_id: "p1" });
  });

  it("does not register a preview control when not in preview mode", async () => {
    render();
    await flushPromises();
    const controls = registerMock.mock.calls.find((c) => c[0] === "test-instance")?.[1];
    expect(controls?.setPreviewConfig).toBeUndefined();
  });

  it('emits "ready" on window.cxr once this instance mounts', async () => {
    const _emit = vi.fn();
    (window as { cxr?: unknown }).cxr = { _emit };
    render({ instanceId: "test-instance" });
    await flushPromises();
    expect(_emit).toHaveBeenCalledWith("test-instance", "ready");
  });

  it('does not throw when window.cxr is absent at mount ("ready" has no listener)', async () => {
    delete (window as { cxr?: unknown }).cxr;
    expect(() => render()).not.toThrow();
    await flushPromises();
  });

  it("unmounts everything once FeedTree's onDismiss fires", async () => {
    render();
    await flushPromises();
    const dismissBtn = container.querySelector<HTMLButtonElement>('[data-testid="dismiss"]');
    expect(dismissBtn).toBeTruthy();

    act(() => dismissBtn?.click());
    expect(container.querySelector('[data-testid="feed-tree"]')).toBeNull();
  });
});
