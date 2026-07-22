/**
 * useTagLoader — fetches tag config and fires tag_captured via the analytics
 * buffer.
 *
 * Must be called from a component mounted inside AnalyticsProvider to route
 * the event through the buffer.
 */
import { useEffect, useState } from "react";

import { EVENT, buildHostParamsDiagnostic } from "@cxr/analytics/analytics";
import { AD_LAYOUT, type AdLayoutId, adLayoutVariants } from "@cxr/config";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { getTag } from "@cxr/services/api";
import { getStaticTagData, isStaticTag } from "@cxr/strategies/staticTagData";
import { resolveStrategies } from "@cxr/strategies/strategies";
import type { TagResponse } from "@cxr/types";
import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/app");

interface UseTagLoaderParams {
  tagId: string;
  rootTagId: string;
  /**
   * Full client-supplied tag config for dashboard preview. When present and
   * non-empty it replaces the `getTag` fetch verbatim — no network call. Absent
   * → fetch normally.
   */
  previewConfig?: TagResponse;
  /**
   * Preview mode. Suppresses the `getTag` fetch entirely — even before
   * `previewConfig` arrives — so a preview instance never hits the API while
   * waiting for the dashboard's first config push.
   */
  preview?: boolean;
  adLayout: AdLayoutId;
}

/** True when `previewConfig` carries at least one field (an empty object = no preview). */
function hasPreviewConfig(cfg: TagResponse | undefined): cfg is TagResponse {
  return !!cfg && Object.keys(cfg).length > 0;
}

interface UseTagLoaderResult {
  /** Resolved tag config, or undefined until the fetch resolves. */
  tagDetails: TagResponse | undefined;
  /** True if the tag fetch rejected. */
  apiFailed: boolean;
}

/**
 * Resolve tag config for `tagId`/`rootTagId`: when `previewConfig` is supplied
 * (dashboard preview) use it verbatim and skip the `getTag` fetch, otherwise
 * fetch. Either way force `config.show_cta = false` and report via `tag_captured`
 * (a no-op in preview, where analytics is silenced upstream).
 */
export function useTagLoader({
  tagId,
  rootTagId,
  previewConfig,
  preview = false,
  adLayout = AD_LAYOUT.Unknown,
}: UseTagLoaderParams): UseTagLoaderResult {
  const { sendEvent, setBrandId } = useAnalytics();
  const [tagDetails, setTagDetails] = useState<TagResponse | undefined>();
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    // Guards against a stale response resolving after the tagId changed or the
    // component unmounted — without it a slow fetch for an old tagId could
    // overwrite a fresh one (last-write-wins by network timing) and setState /
    // sendEvent / setBrandId would fire for a tag no longer mounted.
    let cancelled = false;

    /** Force-disable the default CTA, publish state + brand, fire tag_captured. */
    const applyResolved = (resolved: TagResponse): void => {
      const merged = resolved as Record<string, unknown>;
      // Disable default CTA — must be explicitly configured by the embed
      if (merged["config"] && typeof merged["config"] === "object") {
        (merged["config"] as Record<string, unknown>)["show_cta"] = false;
      }

      setTagDetails(merged as TagResponse);

      // Register brand_id before the first event so tag_captured and every
      // subsequent event (including the IAB/infolink ad events) carry it.
      setBrandId((merged as TagResponse).brand_id);

      const tagDimensions = adLayoutVariants.find((v) => v.id === adLayout);
      // tag_id is injected by AnalyticsProvider; only the camelCase `tagId`
      // legacy key and the tag dimensions are event-specific here. In preview
      // mode sendEvent/setBrandId are no-ops (AnalyticsProvider preview gate).
      sendEvent(EVENT.TAG_CAPTURED, {
        tagId,
        tag_height: tagDimensions?.height,
        tag_width: tagDimensions?.width,
        // One-time diagnostic: the raw host-provided loader script params, so
        // we can tell whether unresolved macros (~appb~, ~loclat~, …) are the
        // host sending an unfilled template vs. sending nothing at all.
        ...buildHostParamsDiagnostic(),
      });
    };

    // Preview: client supplied a full config — render it verbatim, no fetch.
    if (hasPreviewConfig(previewConfig)) {
      setApiFailed(false);
      // Clone so the forced show_cta mutation never leaks back into the caller's object.
      applyResolved(structuredClone(previewConfig));
      return () => {
        cancelled = true;
      };
    }

    // Preview instance still waiting for its first config push: never fetch —
    // a preview widget must not hit the API even before the config arrives.
    if (preview) return;

    /** Normal path: fetch the tag config from /ad_creative. */
    const fetchTagFromApi = (): void => {
      if (!tagId || !rootTagId) return;
      setApiFailed(false);
      getTag<Record<string, unknown>>(tagId)
        .then((td) => {
          if (cancelled) return;
          if (!td) {
            setApiFailed(true);
            return;
          }
          applyResolved(td as TagResponse);
        })
        .catch((err) => {
          if (cancelled) return;
          logger.error("error::", err);
          setApiFailed(true);
        });
    };

    // Static AD-only tag: serve its committed config verbatim, skip /ad_creative.
    // Fixtures load lazily (per-tag chunk) via getStaticTagData. If the tag is
    // flagged servedStatically but has no usable static data — absent from the
    // registry (config drift), the loader resolves empty, or the chunk fails to
    // load — fall back to the normal /ad_creative fetch rather than failing.
    if (isStaticTag(tagId, resolveStrategies(tagId).servedStatically)) {
      setApiFailed(false);
      getStaticTagData(tagId)
        .then((staticEntry) => {
          if (cancelled) return;
          if (!staticEntry) {
            // No static data → hit the API.
            fetchTagFromApi();
            return;
          }
          // Clone so the forced show_cta mutation never leaks into the fixture.
          applyResolved(structuredClone(staticEntry.tagConfig));
        })
        .catch((err) => {
          if (cancelled) return;
          logger.error("static tag load error, falling back to API::", err);
          fetchTagFromApi();
        });
      return () => {
        cancelled = true;
      };
    }

    fetchTagFromApi();

    return () => {
      cancelled = true;
    };
    // sendEvent and setBrandId are stable (AnalyticsProvider useMemo/useCallback).
    // adLayout intentionally omitted — fetch runs once per tagId/rootTagId/previewConfig change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagId, rootTagId, previewConfig, preview]);

  return { tagDetails, apiFailed };
}
