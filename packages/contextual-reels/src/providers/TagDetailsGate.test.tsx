/**
 * Tests for TagDetailsGate.
 *
 * TagDetailsGate gates `children` on the resolved tag: it renders the loading
 * skeleton or the error state itself when `tagDetails` isn't ready, so
 * `children` only ever mounts once the fetch has resolved successfully.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import TagDetailsGate from "@cxr/providers/TagDetailsGate";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";
import type { TagResponse } from "@cxr/types";

vi.mock("../providers/TagDetailsProvider", () => ({
  useTagDetails: vi.fn(),
}));

vi.mock("../app/FeedSkeleton", () => ({
  FeedSkeleton: () => React.createElement("div", { "data-testid": "feed-skeleton" }),
}));

const mockUseTagDetails = useTagDetails as ReturnType<typeof vi.fn>;

describe("TagDetailsGate", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render() {
    act(() => {
      root.render(
        React.createElement(TagDetailsGate, null, React.createElement("div", { "data-testid": "children" }))
      );
    });
  }

  it("renders the loading skeleton — not children — while tagDetails is unresolved", () => {
    mockUseTagDetails.mockReturnValue({ tagDetails: undefined, apiFailed: false });
    render();
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="children"]')).toBeNull();
  });

  it("renders NoContent — not children — when the fetch rejects", () => {
    mockUseTagDetails.mockReturnValue({ tagDetails: undefined, apiFailed: true });
    render();
    const noContent = container.querySelector('[data-testid="cxr-no-content"]');
    expect(noContent).toBeTruthy();
    expect(noContent?.textContent).toContain("no longer available");
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeNull();
    expect(container.querySelector('[data-testid="children"]')).toBeNull();
  });

  it("renders children once tagDetails resolves", () => {
    const tagDetails: TagResponse = { tag_id: "tag-1", brand_id: 9 };
    mockUseTagDetails.mockReturnValue({ tagDetails, apiFailed: false });
    render();
    expect(container.querySelector('[data-testid="children"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="feed-skeleton"]')).toBeNull();
    expect(container.querySelector('[data-testid="cxr-no-content"]')).toBeNull();
  });
});
