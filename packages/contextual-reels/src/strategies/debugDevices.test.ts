import { afterEach, describe, expect, it, vi } from "vitest";

const ANDROID_ID = "d92f58dd-b550-4e6b-8721-21255d967444";
const IOS_ID = "4842110A-E9A9-4DCE-82E0-D42838C39B51";
const DEBUG_TAG = "6a39163e92929ebec64d78ab";

/**
 * Load the module fresh with the given script params. `hostMacros` captures the
 * window bag once at module load, so both it and the module under test must be
 * re-imported per case.
 */
async function loadWith(params: string | undefined) {
  vi.resetModules();
  if (params === undefined) {
    delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  } else {
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = params;
  }
  return import("./debugDevices");
}

afterEach(() => {
  delete (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__;
  vi.resetModules();
});

describe("isDebugDeviceFeed", () => {
  it("matches the Android test device on the debug tag", async () => {
    const { isDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(true);
  });

  it("matches the iOS test device case-insensitively", async () => {
    // iOS reports an uppercase IDFA; the registry keys are lowercase.
    const { isDebugDeviceFeed } = await loadWith(`ifa=${IOS_ID}`);
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(true);
  });

  it.each(["appidfa", "appaid", "deviceid"])("matches on the `%s` macro key", async (key) => {
    const { isDebugDeviceFeed } = await loadWith(`${key}=${ANDROID_ID}`);
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(true);
  });

  it("does not match a debug device on a tag outside the debug set", async () => {
    // A tag id not present in DEBUG_FEED_TAG_IDS is deliberately excluded.
    const { isDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    expect(isDebugDeviceFeed("6a3aa78ba0daccfd439648b8")).toBe(false);
  });

  it("does not match when the tag id is null", async () => {
    const { isDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    expect(isDebugDeviceFeed(null)).toBe(false);
  });

  it("does not match an ordinary device on the debug tag", async () => {
    // A real captured payload from a non-test handset.
    const { isDebugDeviceFeed } = await loadWith("ifa=643cd8b6-313b-4b4b-bb65-55cc23fa599a&dnt=0");
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("does not match when no device id is present", async () => {
    const { isDebugDeviceFeed } = await loadWith(`tagId=${DEBUG_TAG}&country=US`);
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("does not match when there are no script params at all", async () => {
    const { isDebugDeviceFeed } = await loadWith(undefined);
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("never matches the all-zero opted-out advertising id", async () => {
    // Serving the debug feed to every ATT-denied user would be a live incident.
    const { isDebugDeviceFeed } = await loadWith("ifa=00000000-0000-0000-0000-000000000000");
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("ignores an unresolved host placeholder", async () => {
    // `~ifa~` is dropped upstream by parseHostMacros; assert the gate stays false.
    const { isDebugDeviceFeed } = await loadWith("ifa=~ifa~");
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("falls through to a later macro key when an earlier one is absent", async () => {
    const { isDebugDeviceFeed } = await loadWith(`appn=Sudoku&deviceid=${ANDROID_ID}`);
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(true);
  });
});

/**
 * The acceptance criteria for shipping this: the debug path must be inert for
 * everyone who is not a registered debug device. These lock that in — a future
 * edit that widens the gate should fail here rather than in production.
 */
describe("inert for ordinary traffic", () => {
  const ORDINARY = "ifa=643cd8b6-313b-4b4b-bb65-55cc23fa599a&appn=Sudoku&country=US&dnt=0";

  it("never claims a debug feed for an ordinary device on ANY tag", async () => {
    const { isDebugDeviceFeed } = await loadWith(ORDINARY);
    // Every tag in the static registry plus an unknown one.
    for (const tag of [DEBUG_TAG, "6a3915b692929ebec64d785e", "6a3aa78ba0daccfd439648b8", "some-other-tag"]) {
      expect(isDebugDeviceFeed(tag)).toBe(false);
    }
  });

  it("never claims a debug feed when the host sends no macros at all", async () => {
    const { isDebugDeviceFeed, getDebugDeviceFeed } = await loadWith(undefined);
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
    await expect(getDebugDeviceFeed(DEBUG_TAG)).resolves.toBeUndefined();
  });

  it("is a pure read — resolving the gate never mutates the host macro bag", async () => {
    const params = ORDINARY;
    const { isDebugDeviceFeed } = await loadWith(params);
    isDebugDeviceFeed(DEBUG_TAG);
    expect((window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__).toBe(params);
  });

  it("treats a partial / prefix device-id collision as an ordinary device", async () => {
    // Guards against any future switch to substring matching.
    const { isDebugDeviceFeed } = await loadWith("ifa=d92f58dd-b550-4e6b-8721-21255d96744");
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("treats a debug id embedded in a longer string as an ordinary device", async () => {
    const { isDebugDeviceFeed } = await loadWith("ifa=xd92f58dd-b550-4e6b-8721-21255d967444x");
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("does not let a prototype-chain key masquerade as a registered device", async () => {
    // `"constructor" in obj` is true for a bare object literal — the registry
    // lookup must not treat inherited keys as registered devices.
    const { isDebugDeviceFeed } = await loadWith("ifa=constructor");
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("does not let __proto__ masquerade as a registered device", async () => {
    const { isDebugDeviceFeed } = await loadWith("ifa=__proto__");
    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });
});

describe("getDebugDeviceFeed", () => {
  it("loads the Android device's committed fixture", async () => {
    const { getDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    const feed = await getDebugDeviceFeed(DEBUG_TAG);
    expect(feed).toHaveLength(4);
  });

  it("loads the iOS device's committed fixture from an uppercase IDFA", async () => {
    const { getDebugDeviceFeed } = await loadWith(`ifa=${IOS_ID}`);
    const feed = await getDebugDeviceFeed(DEBUG_TAG);
    expect(feed).toHaveLength(4);
  });

  it("serves ad reels on the tritondigital audio-VAST path", async () => {
    const { getDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    const feed = await getDebugDeviceFeed(DEBUG_TAG);
    for (const reel of feed ?? []) {
      const entry = reel as unknown as { type: string; video_ad: { platform: string }[] };
      expect(entry.type).toBe("ads");
      // A video creative would exercise a different GenAd path and prove
      // nothing about the reported audio symptom.
      expect(entry.video_ad[0]?.platform).toBe("tritondigital");
    }
  });

  it("includes the betmgm creative", async () => {
    const { getDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    const feed = await getDebugDeviceFeed(DEBUG_TAG);
    const urls = (feed ?? []).map((reel) => (reel as unknown as { video_ad: { url: string }[] }).video_ad[0]?.url);
    expect(urls).toContain("https://gimedia.begenuin.com/vast/betmgm-vast.xml");
  });

  it("sets both `url` and `ads_url` so extractPrimaryAdUrl resolves either", async () => {
    const { getDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    const feed = await getDebugDeviceFeed(DEBUG_TAG);
    for (const reel of feed ?? []) {
      const entry = (reel as unknown as { video_ad: { url: string; ads_url: string }[] }).video_ad[0];
      expect(entry?.ads_url).toBe(entry?.url);
      expect(entry?.url).toMatch(/^https:\/\/gimedia\.begenuin\.com\/vast\/.+-vast\.xml$/);
    }
  });

  it("resolves undefined for an ordinary device so the normal static feed is served", async () => {
    const { getDebugDeviceFeed } = await loadWith("ifa=643cd8b6-313b-4b4b-bb65-55cc23fa599a");
    await expect(getDebugDeviceFeed(DEBUG_TAG)).resolves.toBeUndefined();
  });

  it("resolves undefined for a debug device on an unlisted tag", async () => {
    const { getDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    await expect(getDebugDeviceFeed("6a3aa78ba0daccfd439648b8")).resolves.toBeUndefined();
  });

  it("falls back to the static feed when the fixture is malformed", async () => {
    // Fixture drift must not serve an undefined `reels` that throws downstream.
    vi.resetModules();
    vi.doMock("@cxr/providers/debug-device/d92f58dd-b550-4e6b-8721-21255d967444.feed.json", () => ({
      default: { code: "200", message: "Feed is loaded.", data: {} },
    }));
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = `ifa=${ANDROID_ID}`;
    const { getDebugDeviceFeed } = await import("./debugDevices");

    await expect(getDebugDeviceFeed(DEBUG_TAG)).resolves.toBeUndefined();
    vi.doUnmock("@cxr/providers/debug-device/d92f58dd-b550-4e6b-8721-21255d967444.feed.json");
  });
});

/**
 * `forced_fill` gates every audibility rate query (they all filter it out), so a
 * `true` on a genuine fill silently deletes that impression from the numerator
 * quoted to Infolinks. It must therefore track the feed ACTUALLY served, never
 * mere eligibility.
 */
describe("didServeDebugDeviceFeed", () => {
  it("is false before any feed resolves, even for an eligible device", async () => {
    const { didServeDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    expect(didServeDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("is true once the debug fixture has actually been served", async () => {
    const { getDebugDeviceFeed, didServeDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    await getDebugDeviceFeed(DEBUG_TAG);
    expect(didServeDebugDeviceFeed(DEBUG_TAG)).toBe(true);
  });

  it("stays false for an ordinary device that served the real static feed", async () => {
    const { getDebugDeviceFeed, didServeDebugDeviceFeed } = await loadWith("ifa=643cd8b6-313b-4b4b-bb65-55cc23fa599a");
    await getDebugDeviceFeed(DEBUG_TAG);
    expect(didServeDebugDeviceFeed(DEBUG_TAG)).toBe(false);
  });

  it("stays false when an eligible device fell back on a malformed fixture", async () => {
    // The regression this exists to prevent: eligibility said "debug device",
    // but the fixture was unusable and the REAL feed was served — so the
    // impression is genuine and must count toward the audibility rate.
    vi.resetModules();
    vi.doMock("@cxr/providers/debug-device/d92f58dd-b550-4e6b-8721-21255d967444.feed.json", () => ({
      default: { code: "200", message: "Feed is loaded.", data: {} },
    }));
    (window as { __CXR_SCRIPT_PARAMS__?: string }).__CXR_SCRIPT_PARAMS__ = `ifa=${ANDROID_ID}`;
    const { getDebugDeviceFeed, didServeDebugDeviceFeed, isDebugDeviceFeed } = await import("./debugDevices");

    expect(isDebugDeviceFeed(DEBUG_TAG)).toBe(true);
    await expect(getDebugDeviceFeed(DEBUG_TAG)).resolves.toBeUndefined();
    expect(didServeDebugDeviceFeed(DEBUG_TAG)).toBe(false);
    vi.doUnmock("@cxr/providers/debug-device/d92f58dd-b550-4e6b-8721-21255d967444.feed.json");
  });

  it("does not leak one tag's verdict onto another tag", async () => {
    const { getDebugDeviceFeed, didServeDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    await getDebugDeviceFeed(DEBUG_TAG);
    expect(didServeDebugDeviceFeed("6a3915b692929ebec64d785e")).toBe(false);
  });

  it("is false for a null tag id", async () => {
    const { didServeDebugDeviceFeed } = await loadWith(`ifa=${ANDROID_ID}`);
    expect(didServeDebugDeviceFeed(null)).toBe(false);
  });
});
