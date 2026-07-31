"use client";

import Script from "next/script";
import { useId, useLayoutEffect } from "react";

const DEFAULT_SDK_SRC = "https://media.qa.begenuin.com/sdk/2.0.5/gen_sdk.min.js";

type PlacementConfiguration = {
  sections: ReadonlyArray<{
    readonly title: string;
  }>;
};

interface GenuinWindow {
  genuin?: {
    init: (config: Record<string, unknown>) => void;
  };
}

let sdkInitScheduled = false;
let pendingConfiguration: PlacementConfiguration | undefined;

/**
 * The SDK discovers every pending `.gen-sdk-class` host at init time. Batch
 * sibling mounts so all unique placement hosts are present before discovery.
 */
function scheduleSdkInitialization(configuration?: PlacementConfiguration) {
  pendingConfiguration = configuration ?? pendingConfiguration;
  if (sdkInitScheduled) return;

  sdkInitScheduled = true;
  queueMicrotask(() => {
    sdkInitScheduled = false;

    const sdk = (window as Window & GenuinWindow).genuin;
    if (!sdk) return;

    const configurationForBatch = pendingConfiguration;
    pendingConfiguration = undefined;
    sdk.init(configurationForBatch ? { configuration: configurationForBatch } : {});
  });
}

type GenuinEmbedIdentity =
  | {
      embedId: string;
      placementId?: never;
      styleId?: never;
    }
  | {
      embedId?: never;
      styleId: string;
      placementId: string;
    };

export type GenuinEmbedCarouselProps = GenuinEmbedIdentity & {
  apiKey: string;
  configuration?: PlacementConfiguration;
  containerId?: string;
  testId?: string;
  className?: string;
  sdkSrc?: string;
};

/**
 * Existing Genuin Web SDK host used by publisher landing pages. It supports
 * multiple unique hosts, exposes each integration through data attributes, and
 * batches SDK discovery against the fixed QA 2.0.5 loader.
 */
export function GenuinEmbedCarousel({
  embedId,
  styleId,
  placementId,
  apiKey,
  configuration,
  containerId,
  testId = "genuin-placement",
  className,
  sdkSrc = DEFAULT_SDK_SRC,
}: GenuinEmbedCarouselProps) {
  const generatedId = useId().replaceAll(":", "");
  const resolvedContainerId = containerId ?? `gen-sdk-${generatedId}`;

  useLayoutEffect(() => {
    scheduleSdkInitialization(configuration);
  }, [configuration]);

  return (
    <>
      <div
        id={resolvedContainerId}
        data-api-key={apiKey}
        data-embed-id={embedId}
        data-placement-id={placementId}
        data-style-id={styleId}
        data-testid={testId}
        className={`gen-sdk-class ${className ?? ""}`.trim()}
        style={{ width: "100%", height: "100%" }}
      />
      <Script src={sdkSrc} strategy="afterInteractive" onReady={() => scheduleSdkInitialization(configuration)} />
    </>
  );
}
