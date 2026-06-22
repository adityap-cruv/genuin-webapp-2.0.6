"use client";

import Script from "next/script";

import { type SdkParams } from "@lib/utils/parse-sdk-params";

/**
 * Web SDK script URL. Resolves by environment (NEXT_PUBLIC_CURRENT_ENV): prod uses the
 * media.begenuin.com CDN, every other env uses the media.qa.begenuin.com CDN. Override
 * with NEXT_PUBLIC_GENUIN_SDK_URL (e.g. a local /public-served bundle).
 */
const SDK_VERSION = "2.0.5";
const isProd = process.env.NEXT_PUBLIC_CURRENT_ENV === "prod";
const GENUIN_SDK_URL =
  process.env.NEXT_PUBLIC_GENUIN_SDK_URL ??
  `https://media${isProd ? "" : ".qa"}.begenuin.com/sdk/${SDK_VERSION}/gen_sdk.min.js`;

type GenuinSdkLoaderProps = {
  apiKey: string;
  params: SdkParams;
};

/**
 * Renders a hidden (0×0) Genuin SDK host element plus the SDK script and an init
 * trigger. The SDK auto-scans `.gen-sdk-class` elements, reads the data-* attributes,
 * and expands on load (data-expand-on-load="true") without affecting page layout.
 *
 * Client component: `genuin.init` runs from the script's `onLoad` once the SDK has
 * loaded in the browser, so all SDK network activity is observable in devtools.
 */
export function GenuinSdkLoader({ apiKey, params }: GenuinSdkLoaderProps) {
  const modeAttrs =
    params.mode === "placement"
      ? { "data-placement-id": params.placementId, "data-style-id": params.styleId }
      : { "data-embed-id": params.embedId };

  return (
    <>
      <div
        id="gen-sdk-1"
        className="gen-sdk-class"
        style={{ width: 0, height: 0, zIndex: 99 }}
        data-api-key={apiKey}
        data-expand-on-load="true"
        {...modeAttrs}
      />
      <Script
        src={GENUIN_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => {
          window.genuin?.init({});
        }}
      />
    </>
  );
}
