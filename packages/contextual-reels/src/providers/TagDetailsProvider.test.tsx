/**
 * Tests for TagDetailsProvider.
 *
 * TagDetailsProvider is a pure context supplier: it loads the tag config and
 * exposes it via useTagDetails(), rendering `children` unconditionally.
 * Gating `children` on `tagDetails` resolving is {@link TagDetailsGate}'s job
 * — see its own test file.
 */
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useTagLoader } from "@cxr/app/useTagLoader";
import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";
import { TagDetailsProvider, useTagDetails } from "@cxr/providers/TagDetailsProvider";
import type { ShadowDomConfig } from "@cxr/shadow-dom-config";
import type { TagResponse } from "@cxr/types";

vi.mock("../app/useTagLoader", () => ({
  useTagLoader: vi.fn(),
}));

const mockUseTagLoader = useTagLoader as ReturnType<typeof vi.fn>;

// TagDetailsProvider requires `children`, which breaks createElement's
// component-overload inference for positional children; alias it to a plain
// FC type with optional children (no react/no-children-prop lint error).
const Provider = TagDetailsProvider as (props: {
  tagId: string;
  rootTagId: string;
  previewConfig?: TagResponse;
  adLayout: AdLayoutId;
  shadowConfig?: ShadowDomConfig | null;
  children?: React.ReactNode;
}) => React.ReactNode;

interface Captured {
  tagDetails: TagResponse | undefined;
  apiFailed: boolean;
  shadowConfig: ShadowDomConfig | null;
}

let captured: Captured = { tagDetails: undefined, apiFailed: false, shadowConfig: null };

function Consumer(): null {
  const ctx = useTagDetails();
  captured = ctx;
  return null;
}

describe("TagDetailsProvider", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    captured = { tagDetails: undefined, apiFailed: false, shadowConfig: null };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.removeChild(container);
  });

  function render() {
    const props: React.ComponentProps<typeof TagDetailsProvider> = {
      tagId: "tag-1",
      rootTagId: "root-1",
      adLayout: AD_LAYOUT.Unknown,
      children: React.createElement(Consumer),
    };
    act(() => {
      root.render(React.createElement(TagDetailsProvider, props));
    });
  }

  it("exposes the resolved tagDetails value via useTagDetails once resolved", () => {
    const tagDetails: TagResponse = { tag_id: "tag-1", brand_id: 9 };
    mockUseTagLoader.mockReturnValue({ tagDetails, apiFailed: false });
    render();
    expect(captured.tagDetails).toEqual(tagDetails);
    expect(captured.apiFailed).toBe(false);
  });

  it("renders children unconditionally, even while tagDetails is unresolved", () => {
    mockUseTagLoader.mockReturnValue({ tagDetails: undefined, apiFailed: false });
    render();
    expect(captured.tagDetails).toBeUndefined();
    expect(captured.apiFailed).toBe(false);
  });

  it("forwards previewConfig to useTagLoader with tagId, rootTagId, and adLayout", () => {
    mockUseTagLoader.mockReturnValue({ tagDetails: undefined, apiFailed: false });
    const previewConfig = { tag_id: "p1" } as TagResponse;
    act(() => {
      root.render(
        React.createElement(
          Provider,
          {
            tagId: "tag-1",
            rootTagId: "root-1",
            previewConfig,
            adLayout: AD_LAYOUT.L3,
          },
          React.createElement(Consumer)
        )
      );
    });
    expect(mockUseTagLoader).toHaveBeenCalledWith({
      tagId: "tag-1",
      rootTagId: "root-1",
      previewConfig,
      adLayout: AD_LAYOUT.L3,
    });
  });

  it("defaults shadowConfig to null when not passed", () => {
    mockUseTagLoader.mockReturnValue({ tagDetails: undefined, apiFailed: false });
    render();
    expect(captured.shadowConfig).toBeNull();
  });

  it("exposes the supplied shadowConfig via useTagDetails", () => {
    const host = document.createElement("div");
    const shadowRoot = host.attachShadow({ mode: "open" });
    const mountTarget = document.createElement("div");
    shadowRoot.appendChild(mountTarget);
    const shadowConfig: ShadowDomConfig = {
      enabled: true,
      hostElement: host,
      shadowRoot,
      mountTarget,
      shadowHostId: "host-1",
    };

    mockUseTagLoader.mockReturnValue({ tagDetails: undefined, apiFailed: false });
    act(() => {
      root.render(
        React.createElement(
          Provider,
          { tagId: "tag-1", rootTagId: "root-1", adLayout: AD_LAYOUT.Unknown, shadowConfig },
          React.createElement(Consumer)
        )
      );
    });
    expect(captured.shadowConfig).toBe(shadowConfig);
  });

  it("useTagDetails throws outside TagDetailsProvider", () => {
    let errorCaught = false;
    function BadConsumer(): null {
      try {
        useTagDetails();
      } catch {
        errorCaught = true;
      }
      return null;
    }
    act(() => {
      root.render(React.createElement(BadConsumer));
    });
    expect(errorCaught).toBe(true);
  });
});
