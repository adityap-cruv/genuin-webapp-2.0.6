/**
 * Presentation component for a single reel video player.
 *
 * Renders only the `<video>` element; all playback logic lives in
 * `usePlayerLifecycle` and its sub-hooks. This component is intentionally
 * kept slim (≤120 lines) so it is easy to reason about in isolation.
 */
import { useCallback, useRef, useState } from "react";

import { VideoScrubber } from "@cxr/player/VideoScrubber";
import { useActiveVideoIdBroadcast } from "@cxr/player/playerEvents";
import type { LightPlayerProps } from "@cxr/player/types";
import { usePlayerLifecycle } from "@cxr/player/usePlayerLifecycle";
import { useAnalytics } from "@cxr/providers/AnalyticsProvider";
import { usePlayer } from "@cxr/providers/PlayerProvider";

/**
 * A `<video>` element wired up to the full CXR player pipeline.
 *
 * All behaviour (HLS, IMA ads, analytics) is driven by props — the parent
 * (ReelItem) owns state and passes `isPlay`, `volume`, `lastUserPlayAt` etc.
 *
 * @example
 * <LightPlayer
 *   content={item.content}
 *   id={item.id}
 *   isPlay={isPlay}
 *   volume={volume}
 *   tagDetails={tagDetails}
 *   videoDetails={item}
 * />
 */
export function LightPlayer({
  content,
  ad,
  id,
  poster,
  videoId,
  config,
  videoMode,
  volume,
  isPlay,
  hideScrubber,
  supportAds,
  tagDetails,
  videoDetails,
  dims,
  lastUserPlayAt = 0,
  onTimeUpdate,
  onEnded,
  onReady,
}: LightPlayerProps): React.JSX.Element {
  const videoEl = useRef<HTMLVideoElement>(null);
  const lastUserPlayAtRef = useRef<number>(lastUserPlayAt);
  const [progress, setProgress] = useState(0);

  // Keep the ref in sync when the prop changes (avoids stale closure in lifecycle hooks).
  lastUserPlayAtRef.current = lastUserPlayAt;

  const { sendEvent: sendEventRaw } = useAnalytics();
  const { notifyAutoplayBlocked } = usePlayer();

  // Stamp this video's id onto every player-lifecycle event (video_loaded,
  // video_started, video_play_started/interrupted, quartiles, complete) so
  // analytics can attribute each event to its video — mirrors the Web SDK's
  // per-video `baseAnalyticsData.video_id`. Caller payloads still win on collision.
  const sendEvent = useCallback(
    (name: string, payload?: Record<string, unknown>) => {
      // Omit video_id when absent so we never emit a `video_id: undefined` key.
      sendEventRaw(name, { ...(videoId ? { video_id: videoId } : {}), ...payload });
    },
    [sendEventRaw, videoId]
  );

  // Broadcast active videoId to window for external consumers.
  useActiveVideoIdBroadcast({ videoId });

  // Determine whether this item is a "video" item for analytics + auto-advance.
  // NormalisedReel uses `kind` ("video" | "video-with-ad") and camelCase
  // `videoType`; legacy raw reels use `type` / snake_case `video_type`. Organic
  // reels often have a null video_type, so the `kind` check is what lets them
  // auto-advance on completion — not just vast/typed items.
  const rawKind = videoDetails["kind"];
  const rawVideoType = videoDetails["video_type"] ?? videoDetails["videoType"];
  const isVideoItem =
    videoDetails["type"] === "video" ||
    rawKind === "video" ||
    rawKind === "video-with-ad" ||
    (typeof rawVideoType === "string" && rawVideoType !== "");
  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number, itemId: number) => {
      if (duration > 0) setProgress(currentTime / duration);
      onTimeUpdate?.(currentTime, duration, itemId);
    },
    [onTimeUpdate]
  );

  usePlayerLifecycle({
    videoEl,
    content,
    ad,
    config,
    isPlay,
    volume,
    tagDetails,
    videoDetails,
    dims,
    supportAds,
    sendEvent,
    getLastUserPlayAt: () => lastUserPlayAtRef.current,
    onTimeUpdate: handleTimeUpdate,
    onEnded,
    onReady,
    itemId: id,
    isVideoItem,
    // Browser blocked unmuted autoplay — drop feed volume to 0 so the mute icon
    // and app state match the now-muted element. User can unmute from there.
    // In expand/fullscreen this is a no-op so the expand stays unmuted (the
    // element keeps unmuted at volume 0 and audio resumes once playback settles).
    onAutoplayBlocked: notifyAutoplayBlocked,
  });

  return (
    <div className="lightPlayer gencl:relative gencl:h-full gencl:w-full">
      <video
        poster={poster}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy attribute value from original JSX
        crossOrigin={"true" as any}
        ref={videoEl}
        className="gencl:h-full gencl:w-full"
        style={{ objectFit: videoMode ?? "contain" }}
        preload="metadata"
        muted
        playsInline
        data-testid="light-player-video"
      />
      {!hideScrubber && <VideoScrubber progress={progress} />}
    </div>
  );
}
