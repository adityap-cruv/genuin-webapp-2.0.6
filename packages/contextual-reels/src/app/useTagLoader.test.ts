/**
 * Tests for useTagLoader — verifies the tag-config fetch, merge/CTA-delay
 * logic, the forced show_cta=false override, the tag_captured analytics
 * event, brand_id registration, and the failure/empty-id branches.
 *
 * Mounted with raw react-dom (no @testing-library/react, matching repo
 * convention) via a throwaway harness component. `getTag` and `useAnalytics`
 * are mocked directly so the hook is exercised in isolation from the real
 * providers/services.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sendEventMock = vi.fn();
const setBrandIdMock = vi.fn();
vi.mock("@cxr/providers/AnalyticsProvider", () => ({
  useAnalytics: () => ({ sendEvent: sendEventMock, setBrandId: setBrandIdMock }),
}));

const getTagMock = vi.fn();
vi.mock("@cxr/services/api", () => ({
  getTag: (tagId: string) => getTagMock(tagId),
}));

// servedStatically gating: default every tag to non-static so the existing suite is
// unaffected; the static test overrides per-call.
const resolveStrategiesMock = vi.fn();
resolveStrategiesMock.mockReturnValue({ servedStatically: false });
vi.mock("@cxr/strategies/strategies", () => ({
  resolveStrategies: (tagId: string) => resolveStrategiesMock(tagId),
}));

const getStaticTagDataMock = vi.fn();
// Mock registry membership so the SUT's isStaticTag gate passes for the static
// test's tag id. isStaticTag mirrors production (flag AND registry membership)
// against the mocked set. Declared inside the factory — vi.mock is hoisted above
// any outer const, so referencing one here would hit the TDZ.
vi.mock("@cxr/strategies/staticTagData", () => {
  const staticIds = new Set(["static-1"]);
  return {
    getStaticTagData: (tagId: string) => getStaticTagDataMock(tagId),
    STATIC_TAG_IDS: staticIds,
    isStaticTag: (tagId: string | null | undefined, servedStatically: boolean) =>
      servedStatically && tagId != null && staticIds.has(tagId),
  };
});

import { useTagLoader } from "@cxr/app/useTagLoader";
import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";
import type { TagResponse } from "@cxr/types";

let container: HTMLDivElement;
let root: Root;
let lastResult: { tagDetails: TagResponse | undefined; apiFailed: boolean } | null = null;

interface HarnessProps {
  tagId: string;
  rootTagId: string;
  previewConfig?: TagResponse;
  preview?: boolean;
  adLayout?: AdLayoutId;
}

/** Mounts a throwaway harness component that calls the hook and records its result. */
function setup({ tagId, rootTagId, previewConfig, preview, adLayout = AD_LAYOUT.Unknown }: HarnessProps): void {
  function Harness(): React.JSX.Element {
    lastResult = useTagLoader({ tagId, rootTagId, previewConfig, preview, adLayout });
    return React.createElement("span");
  }
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(React.createElement(Harness));
  });
}

// Wait for the getTag promise chain (then/catch → setState) to flush.
async function flushPromises(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useTagLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastResult = null;
    getTagMock.mockResolvedValue({ tag_id: "tag-1", config: {}, brand_id: "brand-9" });
    // clearAllMocks wipes the default impl — restore non-static as the default.
    resolveStrategiesMock.mockReturnValue({ servedStatically: false });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("loads the tag, registers the brand id, and emits tag_captured", async () => {
    setup({ tagId: "tag-1", rootTagId: "root-1", adLayout: AD_LAYOUT.L3 });
    await flushPromises();

    expect(getTagMock).toHaveBeenCalledWith("tag-1");
    expect(setBrandIdMock).toHaveBeenCalledWith("brand-9");
    expect(sendEventMock).toHaveBeenCalledWith(
      "Tag Captured",
      expect.objectContaining({ tagId: "tag-1", tag_height: 50, tag_width: 320 })
    );
    expect(lastResult?.tagDetails).toMatchObject({ tag_id: "tag-1", brand_id: "brand-9" });
    expect(lastResult?.apiFailed).toBe(false);
  });

  it("forces config.show_cta=false on the fetched tag", async () => {
    getTagMock.mockResolvedValue({ tag_id: "tag-1", config: { show_cta: true }, brand_id: "b" });
    setup({ tagId: "tag-1", rootTagId: "root-1" });
    await flushPromises();

    expect(lastResult?.tagDetails).toMatchObject({ config: { show_cta: false } });
  });

  it("previewConfig present: uses it verbatim and skips getTag", async () => {
    const preview = { tag_id: "p1", brand_id: 42, config: { show_share: true } } as TagResponse;
    setup({ tagId: "tag-1", rootTagId: "root-1", previewConfig: preview, adLayout: AD_LAYOUT.L3 });
    await flushPromises();

    expect(getTagMock).not.toHaveBeenCalled();
    expect(lastResult?.tagDetails?.tag_id).toBe("p1");
    // show_cta is force-disabled even in preview
    expect((lastResult?.tagDetails?.config as Record<string, unknown>)?.show_cta).toBe(false);
    expect(lastResult?.apiFailed).toBe(false);
  });

  it("previewConfig does not mutate the caller's object", async () => {
    const preview = { tag_id: "p1", config: { show_cta: true } } as TagResponse;
    setup({ tagId: "tag-1", rootTagId: "root-1", previewConfig: preview });
    await flushPromises();

    // The forced show_cta=false must apply to the clone, not the caller's config.
    expect((preview.config as Record<string, unknown>).show_cta).toBe(true);
  });

  it("servedStatically tag: uses the static tag config and skips getTag", async () => {
    resolveStrategiesMock.mockReturnValue({ servedStatically: true });
    getStaticTagDataMock.mockResolvedValue({
      tagConfig: { tag_id: "static-1", brand_id: 42, config: { show_cta: true } },
      feed: [],
      visitId: "v-static",
    });

    setup({ tagId: "static-1", rootTagId: "root-1", adLayout: AD_LAYOUT.L3 });
    await flushPromises();

    expect(getTagMock).not.toHaveBeenCalled();
    expect(lastResult?.tagDetails?.tag_id).toBe("static-1");
    // useTagLoader force-disables show_cta on the resolved config
    expect((lastResult?.tagDetails?.config as Record<string, unknown>)?.show_cta).toBe(false);
    expect(lastResult?.apiFailed).toBe(false);
    // still reports the tag
    expect(sendEventMock).toHaveBeenCalledWith("Tag Captured", expect.objectContaining({ tagId: "static-1" }));
  });

  it("servedStatically tag: falls back to getTag when the fixture load rejects", async () => {
    resolveStrategiesMock.mockReturnValue({ servedStatically: true });
    getStaticTagDataMock.mockRejectedValue(new Error("chunk load failed"));
    getTagMock.mockResolvedValue({ tag_id: "static-1", config: {}, brand_id: 7 });

    setup({ tagId: "static-1", rootTagId: "root-1" });
    await flushPromises();

    // Static data unavailable → hit the real API instead of failing.
    expect(getTagMock).toHaveBeenCalledWith("static-1");
    expect(lastResult?.tagDetails?.tag_id).toBe("static-1");
    expect(lastResult?.apiFailed).toBe(false);
  });

  it("servedStatically tag: falls back to getTag when the loader resolves no data", async () => {
    resolveStrategiesMock.mockReturnValue({ servedStatically: true });
    getStaticTagDataMock.mockResolvedValue(undefined);
    getTagMock.mockResolvedValue({ tag_id: "static-1", config: {}, brand_id: 7 });

    setup({ tagId: "static-1", rootTagId: "root-1" });
    await flushPromises();

    expect(getTagMock).toHaveBeenCalledWith("static-1");
    expect(lastResult?.tagDetails?.tag_id).toBe("static-1");
  });

  it("servedStatically tag not in the registry (drift): falls back to getTag", async () => {
    resolveStrategiesMock.mockReturnValue({ servedStatically: true });
    // "drift-tag" is absent from the mocked STATIC_TAG_IDS set, so the SUT's
    // registry-membership gate fails and it falls through to the normal fetch.
    setup({ tagId: "drift-tag", rootTagId: "root-1" });
    await flushPromises();

    expect(getTagMock).toHaveBeenCalledWith("drift-tag");
  });

  it("previewConfig absent: falls back to getTag (unchanged)", async () => {
    setup({ tagId: "tag-1", rootTagId: "root-1", adLayout: AD_LAYOUT.L3 });
    await flushPromises();
    expect(getTagMock).toHaveBeenCalledWith("tag-1");
  });

  it("preview mode without a config yet: never fetches (waits for the push)", async () => {
    setup({ tagId: "tag-1", rootTagId: "root-1", preview: true, adLayout: AD_LAYOUT.L3 });
    await flushPromises();
    expect(getTagMock).not.toHaveBeenCalled();
    expect(lastResult?.tagDetails).toBeUndefined();
    expect(lastResult?.apiFailed).toBe(false);
  });

  it("empty previewConfig object: still fetches (treated as absent)", async () => {
    setup({ tagId: "tag-1", rootTagId: "root-1", previewConfig: {} as TagResponse, adLayout: AD_LAYOUT.L3 });
    await flushPromises();
    expect(getTagMock).toHaveBeenCalledWith("tag-1");
  });

  it("sets apiFailed on fetch rejection", async () => {
    getTagMock.mockRejectedValue(new Error("gateway down"));
    setup({ tagId: "tag-1", rootTagId: "root-1" });
    await flushPromises();

    expect(lastResult?.apiFailed).toBe(true);
    expect(lastResult?.tagDetails).toBeUndefined();
  });

  it("does not fetch when tagId or rootTagId is empty", async () => {
    setup({ tagId: "tag-1", rootTagId: "" });
    await flushPromises();

    expect(getTagMock).not.toHaveBeenCalled();
  });

  it("sets apiFailed when getTag resolves with no tag", async () => {
    getTagMock.mockResolvedValue(undefined);
    setup({ tagId: "tag-1", rootTagId: "root-1" });
    await flushPromises();

    expect(lastResult?.apiFailed).toBe(true);
    expect(lastResult?.tagDetails).toBeUndefined();
    expect(setBrandIdMock).not.toHaveBeenCalled();
    expect(sendEventMock).not.toHaveBeenCalled();
  });

  it("ignores a response that resolves after unmount", async () => {
    let resolveTag: (value: unknown) => void = () => {};
    getTagMock.mockReturnValue(new Promise((resolve) => (resolveTag = resolve)));

    setup({ tagId: "tag-1", rootTagId: "root-1" });
    act(() => root.unmount());

    // Resolve the in-flight fetch only after the harness has unmounted; the
    // cancelled guard must suppress every setter and side effect.
    await act(async () => {
      resolveTag({ tag_id: "tag-1", config: {}, brand_id: "brand-9" });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(setBrandIdMock).not.toHaveBeenCalled();
    expect(sendEventMock).not.toHaveBeenCalled();
  });
});
