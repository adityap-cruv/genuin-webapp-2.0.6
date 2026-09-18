import type { QueryKey } from "@tanstack/react-query";
import { lazy, useEffect, useRef, useState } from "react";

import type { SheetState } from "@genuin/components/context/base/event-bus";
import { useEmbedContext } from "@genuin/components/context/embed";
import type { EmbedEventContextType } from "@genuin/components/context/embed/event-bus";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useSheetState } from "@genuin/components/hooks/use-sheet-state";
import { useChunkPrefetch } from "@genuin/components/lib/prefetch/use-chunk-prefetch";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { ErrorBoundary } from "@genuin/components/page/standard-wall/error-boundary";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { FeedSkeleton } from "@genuin/components/templates/feed/feed-skeleton";
import { IHeartFeedSkeleton } from "@genuin/components/templates/feed/iheart-feed-skeleton";

// prefetch: CHUNK_LOADERS.expandView mirrors this import (see lib/prefetch/chunk-loaders.ts)
const EmbedExpandView = lazy(() => import("./expand-view").then((m) => ({ default: m.EmbedExpandView })));

// prefetch: CHUNK_LOADERS.expandSectioned mirrors this import (see lib/prefetch/chunk-loaders.ts)
const EmbedExpandSectionedView = lazy(() =>
  import("./embed-expand-sectioned-view").then((m) => ({
    default: m.EmbedExpandSectionedView,
  }))
);

type ExpandViewLoaderProps = {
  videos: PostDetailsType[];
  isSectioned: boolean;
  pageSession?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  queryKey: QueryKey;
  totalVideos: number;
  fetchNextPage: () => void;
};

export function ExpandViewLoader({
  videos,
  isSectioned,
  pageSession,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  queryKey,
  totalVideos,
  fetchNextPage,
}: ExpandViewLoaderProps) {
  const { embedEventBus } = useEmbedContext();
  const {
    view: { brandLayoutType },
  } = useEmbedConfigs();
  const isIHeart = brandLayoutType === "iheart";
  const [isExpandMode, setIsExpandMode] = useState(embedEventBus.getContext().activePlayerType === "expand-view");

  useEffect(() => {
    const handleActivePlayerTypeChange = (_eventData: any, context: EmbedEventContextType) => {
      setIsExpandMode(context.activePlayerType === "expand-view");
    };

    embedEventBus.on("activePlayerTypeChange", handleActivePlayerTypeChange);
    return () => {
      embedEventBus.off("activePlayerTypeChange", handleActivePlayerTypeChange);
    };
  }, [embedEventBus, isExpandMode]);

  // Continuous flow: the expand view INHERITS the tile's linkout state so the
  // user resumes exactly where the tile left off — `default` → `default`,
  // `default-active` → `default-active`, and a drag-promoted `panel-view` /
  // `full-view` (the carousel's promote-to-expand triggers in embed-tile.tsx)
  // opens the expand linkout already at that state. `default` / `default-active`
  // keep the video full-size, so carrying them through preserves the old
  // "open at full video" intent without flattening the state.
  //
  // We still snapshot for exit-restore. The snapshot caps `panel-view` /
  // `full-view` down to `expand-view` because restoring those to the carousel
  // tile would immediately re-fire the promote trigger and bounce the user
  // straight back into expand view — `expand-view` is the biggest valid
  // carousel-tile state.
  const { getContentTypeState, setContentTypeState } = useSheetState();
  const snapshotRef = useRef<SheetState | null>(null);
  const prevIsExpandModeRef = useRef(isExpandMode);
  useEffect(() => {
    const wasExpand = prevIsExpandModeRef.current;
    if (!wasExpand && isExpandMode) {
      const current = getContentTypeState("linkouts");
      // Cap at `expand-view`: see comment above. No entry reset — the tile
      // state carries straight into expand.
      snapshotRef.current = current === "panel-view" || current === "full-view" ? "expand-view" : current;
    } else if (wasExpand && !isExpandMode) {
      if (snapshotRef.current && snapshotRef.current !== "default") {
        setContentTypeState("linkouts", snapshotRef.current);
      }
      snapshotRef.current = null;
    }
    prevIsExpandModeRef.current = isExpandMode;
  }, [isExpandMode, getContentTypeState, setContentTypeState]);

  // Expand view is open → warm secondary chunks (comments etc.) not needed for first
  // paint. Gated on isExpandMode so it only runs once the expand view is actually live.
  useChunkPrefetch("expand-opened", isExpandMode);

  if (!isExpandMode) {
    return null;
  }

  // Fullscreen shimmer for BOTH the chunk-download (pending) and chunk-failure
  // (rejected import) states, so expand-view never blanks to a black screen.
  // Light-DOM shimmer — not a second shadow-DOM portal — so it doesn't add a
  // competing consumer to the expand-view shadow host.
  const fullscreenSkeleton = isIHeart ? (
    <IHeartFeedSkeleton />
  ) : (
    <FeedSkeleton variant="fullscreen" showCommentsSkeleton />
  );

  if (isSectioned) {
    return (
      <SafeSuspense fallback={null} errorFallback={fullscreenSkeleton}>
        <EmbedExpandSectionedView videos={videos} pageSession={pageSession} />
      </SafeSuspense>
    );
  }

  return (
    // Null fallback ON PURPOSE. EmbedExpandView owns the single shadow-DOM portal
    // (portalKey "expand-view") and its own fullscreen Suspense skeleton. A second
    // portal here (as a Suspense fallback) mounts/unmounts a SECOND consumer of the
    // same shadow host across the chunk-resolve commit; the host gets torn down and
    // recreated fresh (unparsed CSS, transparent bg) for a frame — the see-through
    // gap. Keeping exactly one portal consumer for the key avoids the host thrash.
    <SafeSuspense fallback={null} errorFallback={fullscreenSkeleton}>
      <EmbedExpandView
        videos={videos}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        queryKey={queryKey}
        totalVideos={totalVideos}
        fetchNextPage={fetchNextPage}
      />
    </SafeSuspense>
  );
}
