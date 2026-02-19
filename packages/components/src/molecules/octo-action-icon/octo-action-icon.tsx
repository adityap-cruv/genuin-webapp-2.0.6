import { OctoIconAnimated } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { OctoActionIconProps } from "./octo-action-icon.types";
import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { GENAI_ASSETS_BASE_URL } from "@genuin/components/lib/utils/env";

const FALLBACK_GENAI_ASSETS_BASE_URL =
  "https://media.begenuin.com/webapp_assets/assets/genai/";

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

const OCTO_ANIMATION_IMAGES_BASE_URL = new URL(
  "gathering/",
  resolvedGenaiAssetsBaseUrl
).toString();

let cachedOctoAnimationData: object | null = null;
let octoAnimationPromise: Promise<object> | null = null;

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

    const assetFolder =
      typeof asset.u === "string" && asset.u.length > 0 ? asset.u : "";
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
 * OctoActionIcon - Smart component that manages Octo icon animation state
 *
 * This component handles:
 * - Hover state management
 * - Click/active state management
 * - Animation triggers based on interaction
 * - Lottie file loading and fallback
 *
 * Usage:
 * ```tsx
 * <OctoActionIcon
 *   size={32}
 *   isActive={false}
 *   onClick={handleClick}
 * />
 * ```
 */
export function OctoActionIcon({
  className,
  size = 48,
  isActive = false,
  onAnimationComplete,
  onClick,
  ...restProps
}: OctoActionIconProps) {
  const dimensionStyle: CSSProperties | undefined =
    size !== undefined ? { width: size, height: size } : undefined;
  const [octoAnimationData, setOctoAnimationData] = useState<object | null>(
    cachedOctoAnimationData
  );
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

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
    },
    [onClick]
  );

  const handleComplete = useCallback(() => {
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  // If animation data is not available, show a placeholder
  if (!octoAnimationData || loadError) {
    return (
      <div
        className={cn(
          "gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-secondary-100",
          className
        )}
        style={dimensionStyle}
        data-active={isActive ? true : undefined}
        onClick={handleClick}
        {...restProps}
      >
        <div className="gencl:text-xs gencl:text-center gencl:text-secondary-500">
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer",
        className
      )}
      style={dimensionStyle}
      data-active={isActive ? true : undefined}
      onClick={handleClick}
      {...restProps}
    >
      <OctoIconAnimated
        src={octoAnimationData}
        width={size}
        height={size}
        loop
        autoplay
        playing
        onComplete={handleComplete}
      />
    </div>
  );
}
