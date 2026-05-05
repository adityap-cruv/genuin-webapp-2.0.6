import { useEffect, useState } from "react";

import { GENAI_ASSETS_BASE_URL } from "@genuin/components/lib/utils/env";

const FALLBACK_GENAI_ASSETS_BASE_URL = "https://media.begenuin.com/webapp_assets/assets/genai/";

function withTrailingSlash(value: string) {
  const sanitized = value.trim();
  return sanitized.endsWith("/") ? sanitized : `${sanitized}/`;
}

const resolvedGenaiAssetsBaseUrl = withTrailingSlash(
  (GENAI_ASSETS_BASE_URL && GENAI_ASSETS_BASE_URL.trim().length > 0
    ? GENAI_ASSETS_BASE_URL
    : FALLBACK_GENAI_ASSETS_BASE_URL) as string
);

const OCTO_ANIMATION_URL = new URL(
  "gathering/animations/c6620ae0-a5cd-477c-9441-7c90b34a7ed4.json",
  resolvedGenaiAssetsBaseUrl
).toString();

const OCTO_ANIMATION_IMAGES_BASE_URL = new URL("gathering/", resolvedGenaiAssetsBaseUrl).toString();

let cachedOctoAnimationData: object | null = null;
let octoAnimationPromise: Promise<object> | null = null;

/**
 * Normalizes asset paths in the Lottie animation JSON to use absolute URLs.
 * This ensures assets are loaded from the correct CDN location.
 */
function normaliseOctoAnimationData(rawData: any) {
  if (!rawData || typeof rawData !== "object") return rawData;

  if (!Array.isArray(rawData.assets)) {
    return { ...rawData };
  }

  const normalisedAssets = rawData.assets.map((asset: any) => {
    if (!asset || typeof asset !== "object") return asset;

    if (typeof asset.p !== "string" || asset.p.startsWith("data:")) {
      return asset;
    }

    const assetFolder = typeof asset.u === "string" && asset.u.length > 0 ? asset.u : "";
    const combinedPath = `${assetFolder}${asset.p}`;
    const absoluteAssetUrl = new URL(
      combinedPath
        .replace(/^\/+/u, "")
        .replace(/^(\.\/)+/u, "")
        .replace(/^(\.\.\/)+/u, ""),
      OCTO_ANIMATION_IMAGES_BASE_URL
    ).toString();

    return {
      ...asset,
      u: "",
      p: absoluteAssetUrl,
    };
  });

  return {
    ...rawData,
    assets: normalisedAssets,
  };
}

/**
 * Loads and caches the Octo Lottie animation data.
 * Uses a module-level cache to avoid re-fetching the same animation.
 */
async function loadOctoAnimationData() {
  if (cachedOctoAnimationData) {
    return cachedOctoAnimationData;
  }

  if (!octoAnimationPromise) {
    octoAnimationPromise = fetch(OCTO_ANIMATION_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load octo animation");
        }

        return response.json();
      })
      .then((data) => {
        const normalised = normaliseOctoAnimationData(data);
        cachedOctoAnimationData = normalised;
        return normalised;
      })
      .finally(() => {
        octoAnimationPromise = null;
      });
  }

  return octoAnimationPromise;
}

/**
 * Custom hook to load and manage Octo Lottie animation data.
 * Handles loading, caching, and error states.
 *
 * @returns Object containing animation data and loading/error states
 */
export function useOctoAnimation() {
  const [octoAnimationData, setOctoAnimationData] = useState<object | null>(cachedOctoAnimationData);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (octoAnimationData) {
      return;
    }

    let cancelled = false;

    loadOctoAnimationData()
      .then((data) => {
        if (!cancelled) {
          setOctoAnimationData(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [octoAnimationData]);

  return {
    animationData: octoAnimationData,
    isLoading: !octoAnimationData && !loadError,
    hasError: loadError,
  };
}
