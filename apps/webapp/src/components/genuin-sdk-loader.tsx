"use client";

import Script from "next/script";

import { type SdkParams } from "@lib/utils/parse-sdk-params";

/**
 * Web SDK script URL. Resolves by environment (NEXT_PUBLIC_CURRENT_ENV):
 * - local: the web-sdk dev server (`serve:dev` runs `vite build --watch` + serves dist on :3000
 *   with CORS), so local SDK changes are picked up without publishing to the CDN.
 * - prod: the media.begenuin.com CDN. every other env: the media.qa.begenuin.com CDN.
 * Override any of the above with NEXT_PUBLIC_GENUIN_SDK_URL.
 */
const SDK_VERSION = "2.0.6";
const currentEnv = process.env.NEXT_PUBLIC_CURRENT_ENV;
const isProd = currentEnv === "prod";
const isLocal = currentEnv === "local";
/**
 * Local web-sdk dev server. Run `pnpm serve:dev` in packages/web-sdk — it runs
 * `vite build --watch` + `serve dist -l 0.0.0.0:3000 --cors`, serving the dist contents
 * at the root with CORS (so the loader's dynamically-imported chunks load cross-origin).
 */
const LOCAL_SDK_URL = "http://localhost:3000/gen_sdk.js";
const GENUIN_SDK_URL =
  process.env.NEXT_PUBLIC_GENUIN_SDK_URL ??
  (isLocal ? LOCAL_SDK_URL : `https://media${isProd ? "" : ".qa"}.begenuin.com/sdk/${SDK_VERSION}/gen_sdk.min.js`);

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
