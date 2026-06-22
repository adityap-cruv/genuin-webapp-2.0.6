/**
 * Storybook-only stub for `<GenAdContainer>`.
 *
 * Wired via a Vite alias in `packages/components/.storybook/main.ts`:
 *
 * ```ts
 * "@genuin/components/molecules/feed-player/gen-ad-container":
 *   resolve(__dirname, "../src/organisms/linkouts/_gen-ad-container-mock"),
 * ```
 *
 * The alias swaps the production runtime (which would lazy-load
 * `gen_ad.min.js` and hit real ad networks) for this deterministic
 * mock so storybook can exercise the full
 * `<DynamicLinkouts content={{ kind: "banner-ad" }}>` code path —
 * picker, scenario override, LinkoutItem branch — without flaky
 * network calls. Visual output mirrors the Figma `DisplayMobile`
 * mockups by reusing the same source creatives and crop math
 * `<MockGenAdContainer>` uses.
 */

import type { GenAdContainerProps } from "@genuin/components/molecules/feed-player/gen-ad-container/gen-ad.types";

import { BANNER_CROP_BY_SIZE, MockGenAdContainer } from "./_story-helpers";

/**
 * Mock `<GenAdContainer>` that reads `config.banner.size` and
 * renders the matching Figma banner creative via
 * `<MockGenAdContainer>`. Falls back to a labelled placeholder when
 * the config has no banner or an unsupported size — keeping the
 * stub safe for any caller that mounts it.
 *
 * Props match the real `<GenAdContainer>` so the lazy import in
 * `<LinkoutItem>` resolves transparently. Only `config.banner` is
 * consumed by the mock; everything else is ignored.
 */
export function GenAdContainer({ config }: GenAdContainerProps) {
  const banner = Array.isArray(config.banner) ? config.banner[0] : config.banner;
  if (!banner) {
    return (
      <div
        data-testid="gen-ad-container-mock"
        data-fallback="no-banner"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f5f6",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          color: "#585c61",
        }}>
        no banner
      </div>
    );
  }
  const [width, height] = banner.size;
  const isSupported = `${width}x${height}` in BANNER_CROP_BY_SIZE;
  if (!isSupported) {
    return (
      <div
        data-testid="gen-ad-container-mock"
        data-fallback="unsupported-size"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f5f6",
          border: "1px solid #dfe1e3",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          color: "#585c61",
        }}>
        {width}x{height}
      </div>
    );
  }
  // `<MockGenAdContainer>` renders at the exact banner dimensions
  // with the same Figma creative + Ad badge + size label the
  // hand-rolled stand-in used. The wrapper from `<LinkoutItem>` is
  // already sized to `banner.size`, so we drop the extra `margin: 0
  // auto` self-centering by absolute-positioning to fill.
  return (
    <div data-testid="gen-ad-container-mock" style={{ position: "absolute", inset: 0 }}>
      <MockGenAdContainer width={width} height={height} />
    </div>
  );
}

/** No-op for the production helper `<GenAdContainer>` exposes to
 *  preload the SDK script. In stories there's nothing to load. */
export function loadGenAdScript(): void {
  /* no-op in stories */
}
