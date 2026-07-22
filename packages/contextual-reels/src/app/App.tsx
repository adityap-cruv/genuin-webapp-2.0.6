/**
 * App — root of the contextual-reels widget.
 *
 * Everything downstream depends on the tag config, so the file reads
 * top-to-bottom as one continuous chain, gated by that fetch:
 *
 *   App (InstanceProvider → AnalyticsProvider → TagDetailsProvider)
 *     → TagDetailsGate  (lazy-loaded — loading skeleton / error state / children)
 *       → FeedTree      (lazy-loaded — provider stack + fullscreen overlay + feed)
 *
 * `TagDetailsGate` and `FeedTree` are lazy-loaded so their imports (six
 * providers, the fullscreen overlay chrome, the native feed shim) aren't
 * fetched until the tag config resolves. See each file's own doc comment for
 * what it does and why each provider hop exists.
 */

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { lazy, useCallback, useEffect, useState } from "react";

import { FeedSkeleton } from "@cxr/app/FeedSkeleton";
import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";
import { InstanceProvider } from "@cxr/instance/InstanceContext";
import { getInstanceRegistry } from "@cxr/instance/registry/InstanceRegistry";
import { AnalyticsProvider } from "@cxr/providers/AnalyticsProvider";
import { TagDetailsProvider } from "@cxr/providers/TagDetailsProvider";
import type { CxrPublicApiInternal } from "@cxr/publicApi";
import type { ShadowDomConfig } from "@cxr/shadow-dom-config";
import type { TagResponse } from "@cxr/types";

const TagDetailsGate = lazy(() => import("@cxr/providers/TagDetailsGate"));
const FeedTree = lazy(() => import("@cxr/app/FeedTree"));

/** Props accepted by the TypeScript App component. */
interface AppProps {
  tagId: string;
  rootTagId: string;
  adLayout?: AdLayoutId;
  instanceId: string;
  /**
   * Dashboard preview mode. Silences all analytics and lets the dashboard push
   * config via `window.cxr.setPreviewConfig`. Absent for normal embeds.
   */
  preview?: boolean;
  /**
   * Raw `data-giv` attribute for this instance — the per-div initial-volume
   * fallback used when the page-global `GIV` script param is absent. Validated
   * in {@link StrategyProvider}.
   */
  dataGiv?: string | null;
  /** Active Shadow DOM topology for this widget instance, or null in direct mode. */
  shadowConfig?: ShadowDomConfig | null;
}

/**
 * Root application component for the contextual-reels widget: bootstraps the
 * provider tree and mounts the native Feed.
 *
 * @param props  AppProps
 */
export default function App({
  tagId,
  rootTagId,
  adLayout = AD_LAYOUT.Unknown,
  instanceId,
  preview = false,
  dataGiv,
  shadowConfig = null,
}: AppProps): React.JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);
  const handleDismiss = useCallback(() => setDismissed(true), []);
  const [previewConfig, setPreviewConfig] = useState<TagResponse | undefined>(undefined);

  useEffect(() => {
    if (!preview) return;
    // App owns only this control; the loader owns `destroy` and AdProvider owns
    // fireInfolinksImpression — register merges, so no unregister here (the
    // loader's destroy path unmounts the whole tree).
    getInstanceRegistry().register(instanceId, {
      setPreviewConfig: (config) => setPreviewConfig(config as TagResponse),
    });
  }, [preview, instanceId]);

  // Fires once per instance when this root effect commits — the earliest point
  // any embed (preview or normal) can be considered "mounted". Listeners must
  // attach before this runs (synchronously, before yielding to any async task)
  // since `on()` has no replay buffer for events emitted before subscription.
  useEffect(() => {
    const publicApi = (window as Window & { cxr?: CxrPublicApiInternal }).cxr;
    publicApi?._emit(instanceId, "ready");
  }, [instanceId]);

  if (dismissed) return null;

  return (
    <InstanceProvider instanceId={instanceId}>
      <AnalyticsProvider tagId={tagId} preview={preview}>
        <TagDetailsProvider
          tagId={tagId}
          rootTagId={rootTagId}
          previewConfig={previewConfig}
          preview={preview}
          adLayout={adLayout}
          shadowConfig={shadowConfig}>
          <SafeSuspense fallback={<FeedSkeleton />}>
            <TagDetailsGate>
              <FeedTree onDismiss={handleDismiss} dataGiv={dataGiv ?? null} />
            </TagDetailsGate>
          </SafeSuspense>
        </TagDetailsProvider>
      </AnalyticsProvider>
    </InstanceProvider>
  );
}
